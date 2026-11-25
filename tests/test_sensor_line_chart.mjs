import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createInterface } from 'node:readline';

const stamp = () => new Date().toISOString();
const out = (type, data) => console.log(JSON.stringify({type, time: stamp(), ...data}));
const [mode, baselineFile, port = '8765'] = process.argv.slice(2);
assert(['--before','--before-live','--after','--after-live'].includes(mode) && baselineFile,
  'Usage: node tests/test_sensor_line_chart.mjs --before|--before-live|--after|--after-live <temporary capture JSON> [loopback port]');
assert(/^\d{1,5}$/.test(port) && +port > 0 && +port <= 65535);
const origin = 'http://127.0.0.1:' + port;
const beforeMode = mode.startsWith('--before');
const attached = mode.endsWith('-live');

// Reuse the accepted M5 loopback lifecycle helper without running its browser driver.
const supervisor = spawn('python',['-X','utf8','-B','-c',String.raw`
import json
import http.client
import subprocess
import sys
sys.path.insert(0, "tests")
import test_m5_browser_uat as lifecycle

lifecycle.PORT = int(sys.argv[1])

class Service(lifecycle.ApiProcess):
    def start(self):
        if self.child is not None:
            raise RuntimeError("API already started by the VIS supervisor")
        lifecycle.port_closed()
        self.instance += 1
        port = lifecycle.PORT
        args = [sys.executable, "-B", "-m", "web.api", "--port", str(port)]
        self.child = subprocess.Popen(args, cwd=lifecycle.ROOT, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        line = self.child.stdout.readline().strip()
        lifecycle.record("api_start", instance=self.instance, pid=self.child.pid,
            command=f"python -B -m web.api --port {port}", stdout=line)
        if line != f"FD001 API listening on http://127.0.0.1:{port} (ready)":
            raise RuntimeError("Owned API startup did not reach ready")
        connection = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
        try:
            connection.request("GET", "/api/health")
            response = connection.getresponse()
            data = json.load(response)["data"]
            if response.status != 200 or data["readiness"] != "ready" or not all(
                source["hash_verified"] for source in data["sources"].values()
            ):
                raise RuntimeError("Owned API did not verify trusted sources")
            lifecycle.record("health", instance=self.instance, port=port, http=response.status, source_status=data)
        finally:
            connection.close()

api = Service()
try:
    for line in sys.stdin:
        command = line.strip()
        if command == "quit":
            break
        try:
            {"start": api.start, "stop": api.stop}[command]()
        except (KeyError, OSError, RuntimeError, ValueError) as exc:
            print(json.dumps({"type":"vis_control", "ok":False, "error":str(exc)}), flush=True)
        else:
            print(json.dumps({"type":"vis_control", "ok":True}), flush=True)
finally:
    if api.child is not None:
        api.stop()
`,port],{stdio:['pipe','pipe','inherit']});
const supervisorExit = new Promise((resolve,reject) => {
  supervisor.once('error',reject);
  supervisor.once('exit',resolve);
});
const supervisorLines = createInterface({input:supervisor.stdout});
let controlReply;
supervisorLines.on('line',line=>{
  const entry=JSON.parse(line);
  if (entry.type==='vis_control') controlReply?.(entry);
  else console.log(line);
});
async function control(command) {
  const reply = new Promise(resolve=>{ controlReply=resolve; });
  supervisor.stdin.write(command+'\n');
  const result = await Promise.race([reply,delay(15000,null,{ref:false})]);
  controlReply=undefined;
  assert(result?.ok,result?.error || 'API lifecycle control timed out');
}

const temp = await realpath(tmpdir());
const profile = await mkdtemp(join(temp, 'fd001-vis-'));
const chrome = join(process.env.ProgramFiles, 'Google', 'Chrome', 'Application', 'chrome.exe');
const browser = spawn(chrome, [
  '--headless=new', '--remote-debugging-port=0', '--remote-debugging-address=127.0.0.1',
  '--disable-background-networking', '--no-first-run', '--no-default-browser-check',
  '--window-size=1440,920', '--user-data-dir=' + profile, 'about:blank',
], {stdio:'ignore', windowsHide:true});
const browserExit = new Promise(resolve => browser.once('exit', (code, signal) => resolve({code, signal})));
let socket;
let nextId = 0;
const pending = new Map();
const requests = new Map();
const events = [];
const logs = [];
const external = [];
let verifiedCatalog;
const paused = [];
let intercept;
async function until(fn, label) {
  for (let count = 0; count < 200; count++) {
    const result = await fn();
    if (result) return result;
    await delay(40);
  }
  throw new Error('Timed out: ' + label);
}
function call(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {pending.delete(id); reject(new Error('CDP timeout: ' + method));}, 10000);
    pending.set(id, {resolve, reject, timer});
    socket.send(JSON.stringify({id, method, params}));
  });
}
function onMessage({data}) {
  const {id, result, error, method, params: p} = JSON.parse(data);
  if (id) {
    const entry = pending.get(id);
    if (!entry) return;
    clearTimeout(entry.timer);
    pending.delete(id);
    if (error) entry.reject(new Error(error.message)); else entry.resolve(result);
  } else if (method === 'Network.requestWillBeSent' && p.request.url.startsWith(origin + '/')) {
    const row = {id:p.requestId, url:p.request.url, method:p.request.method};
    requests.set(p.requestId,row);
    events.push(row);
  } else if (method === 'Network.requestWillBeSent' && /^https?:/.test(p.request.url)) {
    external.push(new URL(p.request.url).origin);
  } else if (method === 'Network.responseReceived' && requests.has(p.requestId)) {
    Object.assign(requests.get(p.requestId), {status:p.response.status, mime:p.response.mimeType});
  } else if (method === 'Network.loadingFinished' && requests.has(p.requestId)) {
    requests.get(p.requestId).finished = true;
  } else if (method === 'Network.loadingFailed' && requests.has(p.requestId)) {
    requests.get(p.requestId).failure = p.errorText;
  } else if (method === 'Runtime.exceptionThrown') {
    logs.push({kind:'exception', text:p.exceptionDetails.text});
  } else if (method === 'Runtime.consoleAPICalled' && ['error','warning'].includes(p.type)) {
    logs.push({kind:p.type, text:p.args.map(arg => arg.value ?? arg.description).join(' ')});
  } else if (method === 'Log.entryAdded' && ['error','warning'].includes(p.entry.level)) {
    logs.push({kind:p.entry.source, text:p.entry.text, url:p.entry.url});
  } else if (method === 'Fetch.requestPaused') {
    paused.push(p);
    if (intercept) intercept(p);
  }
}
const evaluate = async expression => {
  const result = await call('Runtime.evaluate',{expression, awaitPromise:true, returnByValue:true});
  assert(!result.exceptionDetails, 'Browser evaluation should succeed');
  return result.result.value;
};
const snapshot = () => evaluate("({controls:['split','unit','sensor','start','end'].map(k=>document.getElementById(k)?.value), status:document.querySelector('#feedback')?.dataset.state, message:document.querySelector('#feedback')?.textContent, selection:document.querySelector('#selection')?.textContent, dots:document.querySelectorAll('#chart circle').length,lines:document.querySelectorAll('#chart .trend-line').length, rows:document.querySelectorAll('#rows tr').length, source:document.querySelector('#source dd')!==null,promptState:document.querySelector('#prompt-status')?.dataset.state,previewLength:document.querySelector('#prompt-preview')?.textContent.length,copyDisabled:document.querySelector('#copy-prompt')?.disabled,promptScope:document.querySelector('#prompt-scope')?.textContent})");
const state = async expected => until(async () => {
  const current = await snapshot();
  return current.status === expected && current;
}, expected);
const keyCodes = {Home:36,ArrowDown:40,ArrowUp:38,Enter:13,Space:32};
async function key(name) {
  const config = {key:name==='Space'?' ':name, code:name, windowsVirtualKeyCode:keyCodes[name]};
  const text = name === 'Enter' ? '\r' : name === 'Space' ? ' ' : '';
  await call('Input.dispatchKeyEvent',{type:'keyDown',...config,text,unmodifiedText:text});
  await call('Input.dispatchKeyEvent',{type:'keyUp',...config});
}
async function select(id, index) {
  await evaluate('document.getElementById(' + JSON.stringify(id) + ').focus()');
  await key('Home');
  for (let step = 0; step < index; step++) await key('ArrowDown');
  assert.equal(await evaluate('document.getElementById(' + JSON.stringify(id) + ').selectedIndex'),index);
}
async function input(id, value) {
  await evaluate('document.getElementById(' + JSON.stringify(id) + ').select()');
  await call('Input.insertText',{text:String(value)});
}
async function windowInput(start, end) {
  await input('start',start);
  await input('end',end);
}
function history(split, unit, sensor, start, end) {
  return origin + '/api/history?split=' + split + '&unit=' + unit + '&sensor=' + sensor + '&start=' + start + '&end=' + end;
}
const fetches = (mark) => events.slice(mark).filter(x => x.url.includes('/api/'));
const summary = (mark) => events.slice(mark).map(({url, method, status, failure, mime}) => ({url,method,status,failure,mime}));
async function response(url, status, mark) {
  return until(() => events.slice(mark).find(row => row.url === url && row.status === status && row.finished),url);
}
async function scenario(name, expected, url, code, action) {
  const before = await snapshot();
  const mark = events.length;
  if (action) await action();
  const hit = url ? await response(url,code,mark) : undefined;
  const after = await state(expected);
  if (!url) assert(!fetches(mark).length, 'Invalid window must not reach API');
  assert.equal(after.dots,after.rows);
  assert.equal(after.source,after.rows>0);
  if (expected === 'empty' || expected === 'invalid' || expected === 'error') assert.equal(after.rows,0);
  if (expected === 'ready') {
    assert.equal(after.promptState,'valid');
    assert.equal(after.copyDisabled,false);
    assert(after.previewLength > 0);
    const data=await checkPrompt(hit);
    await checkGeometry(data,hit.url);
  } else {
    assert.equal(after.lines,0);
    assert.equal(after.promptState,expected);
    assert.equal(after.copyDisabled,true);
    assert.equal(after.previewLength,0);
  }
  out('scenario',{name,before,after,network:summary(mark)});
  return hit;
}

const preview = () => evaluate("document.querySelector('#prompt-preview').textContent");
const promptRows = text => text.split(/\r?\n/).filter(line=>/^[0-9]+ \| /.test(line));
const rowFromAPI = ({cycle,value,raw_reference:r}) => [cycle,value,r.original_value,r.physical_line_number,
  r.data_row_index,r.source_column_index,r.reread_matches].join(' | ');
async function checkPrompt(hit) {
  const envelope = JSON.parse((await call('Network.getResponseBody',{requestId:hit.id})).body);
  const data = envelope.data;
  const text = await preview();
  const url = new URL(hit.url);
  const params = url.searchParams;
  const {controls} = await snapshot();
  assert.deepEqual(controls,['split','unit','sensor','start','end'].map(name=>params.get(name)));
  assert(promptRows(text).join('\n')===data.points.map(rowFromAPI).join('\n'),'Full preview rows must match live history');
  assert(text.includes('Actual Observation Count: '+data.count));
  assert(text.includes('Sensor '+params.get('sensor')+' ('+data.sensor_name+') = Column '+(5+Number(params.get('sensor')))));
  assert(text.includes('requested cycles '+data.start+'-'+data.end+' inclusive'));
  if (verifiedCatalog) {
    const q = verifiedCatalog.summary[data.dataset_split];
    assert(text.includes('Row Count: '+q.rows+' | Column Count: '+q.columns+' | Unit Count: '+q.unit_count+' | Missing Value Count: '+q.missing_total));
  }
  return data;
}
async function clickSelector(selector, scroll = false) {
  const coords = await evaluate('(() => {const element=document.querySelector('+JSON.stringify(selector)+'); if ('+scroll+') element.scrollIntoView({block:"center"}); const r=element.getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2];})()');
  const [x,y] = coords;
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
  await call('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
}
async function waitPrompt(state) {
  return until(async()=>{const current=await snapshot();return current.promptState===state && current;},'prompt '+state);
}
const fingerprint = text => createHash('sha256').update(text,'utf8').digest('hex');
async function clipboardChecks() {
  const current = await snapshot();
  const text = await preview();
  const mark = events.length;
  await call('Page.bringToFront');
  assert(await evaluate('window.isSecureContext && document.hasFocus()'));
  await call('Browser.grantPermissions',{origin,permissions:['clipboardReadWrite','clipboardSanitizedWrite']});
  await clickSelector('#copy-prompt',true);
  await waitPrompt('copied');
  const readback = await evaluate('navigator.clipboard.readText()');
  assert(typeof readback === 'string' && text === readback,'Real clipboard must exactly match preview');
  out('clipboard',{action:'native click and real readText',selection:current.controls,scope:current.promptScope,
    message:await evaluate("document.querySelector('#prompt-status').textContent"),priorRequest:history(...current.controls),
    http:200,exact:true,characters:readback.length,lf:(readback.match(/\n/g)||[]).length,
    cr:(readback.match(/\r/g)||[]).length,previewSha256:fingerprint(text),clipboardSha256:fingerprint(readback)});
  await evaluate("Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>Promise.reject(new DOMException('SYNTHETIC clipboard denial','NotAllowedError'))}); true");
  await clickSelector('#copy-prompt');
  await waitPrompt('copy-failed');
  assert((await preview())===text && (await evaluate('navigator.clipboard.readText()'))===readback);
  out('clipboard',{action:'native click with SYNTHETIC NotAllowedError',selection:current.controls,
    unchangedClipboard:true,message:await evaluate("document.querySelector('#prompt-status').textContent")});
  await evaluate("Object.defineProperty(navigator.clipboard,'writeText',{configurable:true,value:()=>new Promise(resolve=>{window.m5FinishClipboard=resolve;})}); true");
  await clickSelector('#copy-prompt');
  await waitPrompt('copying');
  await evaluate('window.scrollTo(0,0)');
  await clickPoint(5);
  assert((await waitPrompt('valid')).copyDisabled);
  assert((await snapshot()).promptScope.includes('Focus Cycle 5'));
  await evaluate('window.m5FinishClipboard(); delete window.m5FinishClipboard; true');
  const focus = await until(async()=>{const fresh=await snapshot(); return !fresh.copyDisabled && fresh;},'settled old clipboard write');
  assert.equal(focus.promptState,'valid');
  assert((await evaluate('navigator.clipboard.readText()'))===readback);
  out('clipboard',{action:'SYNTHETIC delayed write completed after native focus change',scope:focus.promptScope,
    finalState:focus.promptState,unchangedClipboard:true,result:'PASS'});
  await evaluate("delete navigator.clipboard.writeText");
  await call('Browser.resetPermissions');
  assert.equal(events.length,mark,'Copy does not issue an HTTP request');
}
function assertCleared(current, stateName) {
  assert.equal(current.promptState,stateName);
  assert.equal(current.previewLength,0);
  assert.equal(current.copyDisabled,true);
  assert.equal(current.dots,0);
  assert.equal(current.lines,0);
  assert.equal(current.rows,0);
  assert.equal(current.source,false);
}

async function pressLoad() {
  await evaluate("document.querySelector('#load').focus()");
  await key('Enter');
}

async function injectHistory(url, status, payload, expected) {
  const before = await snapshot();
  const mark = events.length;
  await call('Fetch.enable',{patterns:[{urlPattern:url,requestStage:'Request'}]});
  let fulfillment;
  intercept = request => {
    fulfillment=call('Fetch.fulfillRequest',{requestId:request.requestId,responseCode:status,
      responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(payload).toString('base64')});
  };
  try {
    await pressLoad();
    const hit=await response(url,status,mark);
    await fulfillment;
    const after=await state(expected);
    return {hit,before,after};
  } finally {
    intercept=undefined;
    await call('Fetch.disable');
  }
}

async function raceRequest({field, pendingIndex, finalIndex, pausedUrl, recoveredHistory,
                            choosePending = () => select(field,pendingIndex),
                            chooseFinal = () => select(field,finalIndex)}) {
  await call('Fetch.enable',{patterns:[{urlPattern:pausedUrl,requestStage:'Request'}]});
  const mark=events.length;
  try {
    await choosePending();
    await until(()=>paused.find(p=>p.request.url===pausedUrl),'paused '+field);
    assertCleared(await snapshot(),'loading');
    await scenario('Rapid '+field+' switch','ready',recoveredHistory,200,chooseFinal);
  } finally {
    await call('Fetch.disable');
  }
  const aborted=await until(()=>events.slice(mark).find(row=>row.url===pausedUrl && row.failure),'aborted '+field);
  out('race',{control:field,earlier:aborted.url,result:aborted.failure,current:(await snapshot()).selection});
}

async function capture() {
  await evaluate('window.scrollTo(0,0)');
  return (await call('Page.captureScreenshot',{format:'png',fromSurface:true})).data;
}

async function montage(states) {
  await call('Page.navigate',{url:'about:blank'});
  await until(()=>evaluate("location.href==='about:blank'"),'montage document');
  const script = 'async entries=>{ const width=1024, height=640, label=36; const canvas=document.createElement("canvas"); canvas.width=width; canvas.height=(height+label)*entries.length; const ctx=canvas.getContext("2d"); ctx.fillStyle="#102a43"; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.fillStyle="#fff"; ctx.font="bold 17px Segoe UI"; for(const [i,entry] of entries.entries()){const image=new Image(); image.src="data:image/png;base64,"+entry[1];await image.decode();const top=i*(height+label);ctx.fillText(entry[0],16,top+24);ctx.drawImage(image,0,top+label,width,height);} return canvas.toDataURL("image/png").split(",")[1]; }';
  const data=await evaluate('('+script+')('+JSON.stringify(states)+')');
  const file='reports/LINE_CHART_BROWSER_SCREENSHOT.png';
  await writeFile(file,Buffer.from(data,'base64'));
  out('screenshot',{file,states:states.map(([label])=>label)});
}

const originals = new Map();
async function original(split, unit, cycle, sensor) {
  if (!originals.has(split)) {
    const file = 'FD001/' + split + '_FD001.txt';
    const bytes = await readFile(file);
    originals.set(split,{file,hash:createHash('sha256').update(bytes).digest('hex'),lines:bytes.toString('utf8').split(/\r?\n/)});
  }
  const {file, hash, lines} = originals.get(split);
  let row = 0;
  for (const [index, line] of lines.entries()) {
    const cols = line.trim() ? line.trim().split(/\s+/) : [];
    if (!cols.length) continue;
    if (+cols[0] === unit && +cols[1] === cycle) {
      assert.equal(cols.length,26);
      const token = cols[4 + sensor];
      return {dataset_split:split,unit_id:unit,cycle,sensor_name:'sensor_'+sensor,sensor_value:+token,
        source_file:file,source_sha256:hash,physical_line_number:index+1,data_row_index:row,
        source_column_index:5+sensor,original_value:token,reread_matches:true};
    }
    row++;
  }
  throw new Error('Original observation is missing');
}
async function sample(hit, split, unit, sensor, cycles) {
  const raw = await call('Network.getResponseBody',{requestId:hit.id});
  const {data} = JSON.parse(raw.body);
  assert.equal(data.count,await evaluate("document.querySelectorAll('#chart circle').length"));
  for (const cycle of cycles) {
    const dot = '#chart circle[data-cycle="' + cycle + '"]';
    const row = '#rows tr[data-cycle="' + cycle + '"]';
    await evaluate('document.querySelector(' + JSON.stringify(row+' button') + ').focus()');
    await key('Space');
    await until(()=>evaluate("document.querySelector('#chart .selected').dataset.cycle === "+JSON.stringify(String(cycle))),'keyboard selection');
    const dom = await evaluate("(() => { const d=document.querySelector("+JSON.stringify(dot)+"); const r=document.querySelector("+JSON.stringify(row)+"); return {source:Object.fromEntries([...document.querySelectorAll('#source dd')].map(n=>[n.dataset.field,n.textContent])), dot:[d.dataset.cycle,d.dataset.value,d.getAttribute('cx'),d.getAttribute('cy')], selected:d.classList.contains('selected')&&r.classList.contains('selected'), row:[...r.cells].map(c=>c.textContent)}; })()");
    const expected = await original(split,unit,cycle,sensor);
    const point = data.points.find(p => p.cycle === cycle);
    const {sensor_name, sensor_value, ...ref} = expected;
    assert.deepEqual(point,{cycle,value:sensor_value,sensor_name,raw_reference:{...ref,
      column_name:sensor_name,data_row_index_base:0,reread_value:ref.original_value}});
    assert.deepEqual(dom.source,Object.fromEntries(Object.entries(expected).map(([k,v])=>[k,String(v)])));
    assert.deepEqual(dom.row,[cycle,sensor_value,ref.original_value,ref.physical_line_number,ref.data_row_index,ref.source_column_index].map(String));
    assert(dom.selected);
    const values = data.points.map(p=>p.value);
    const min = Math.min(...values), max = Math.max(...values);
    const pad = (max-min)*.12 || Math.max(Math.abs(min)*.005,.01);
    const expectedX = data.start === data.end ? 405 : 89+(cycle-data.start)/(data.end-data.start)*632;
    const expectedY = 232-(sensor_value-(min-pad))/((max+pad)-(min-pad))*216;
    assert.deepEqual(dom.dot.slice(0,2),[String(cycle),String(sensor_value)]);
    assert(Math.abs(+dom.dot[2]-expectedX)<1e-10 && Math.abs(+dom.dot[3]-expectedY)<1e-10);
    const text = await preview();
    const promptRow = [cycle,sensor_value,ref.original_value,ref.physical_line_number,
      ref.data_row_index,ref.source_column_index,ref.reread_matches].join(' | ');
    assert(promptRows(text).includes(promptRow),'Original TXT provenance row must appear in preview');
    assert(text.includes('Source File: '+ref.source_file) && text.includes('Source SHA-256: '+ref.source_sha256));
    assert(text.includes('Selected row (the complete window is above): '+promptRow));
    assert.equal(promptRows(text).length,data.count);
    const path = await evaluate("document.querySelector('#chart .trend-line')?.getAttribute('d') || ''");
    const endpoint = [...path.matchAll(/([ML]) ([^ ]+) ([^ ]+)/g)].find(([, ,x,y])=>+x===+dom.dot[2] && +y===+dom.dot[3]);
    assert(endpoint,'Each selected live point is on an actual line endpoint');
    out('source',{url:hit.url,http:hit.status,actual:expected,promptRow,windowCount:data.count,
      svg:{x:+dom.dot[2],y:+dom.dot[3],pathCommand:endpoint[1]},match:true});
  }
}
async function clickPoint(cycle) {
  const selector = '#chart circle[data-cycle="' + cycle + '"]';
  const coords = await evaluate('(() => { const r=document.querySelector('+JSON.stringify(selector)+').getBoundingClientRect(); return [r.left+r.width/2,r.top+r.height/2]; })()');
  const [x,y] = coords;
  await call('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',clickCount:1});
  await call('Input.dispatchMouseEvent',{type:'mouseReleased',x,y,button:'left',clickCount:1});
  assert.equal(await evaluate("document.querySelector('#chart .selected').dataset.cycle"),String(cycle));
}
async function checkGeometry(data, url, source='LIVE') {
  const display = await evaluate("(() => {const chart=document.querySelector('#chart');const paths=[...chart.querySelectorAll('.trend-line')];const dots=[...chart.querySelectorAll('circle')];return {dots:dots.map(dot=>({cycle:+dot.dataset.cycle,value:+dot.dataset.value,x:+dot.getAttribute('cx'),y:+dot.getAttribute('cy'),title:dot.querySelector('title')?.textContent})),paths:paths.map(path=>path.getAttribute('d')),pointer:paths[0]?getComputedStyle(paths[0]).pointerEvents:null,lineStyle:paths[0]?[getComputedStyle(paths[0]).stroke,getComputedStyle(paths[0]).strokeDasharray,getComputedStyle(paths[0]).fill]:null,behind:!paths[0]||dots.every(dot=>Boolean(paths[0].compareDocumentPosition(dot)&4))};})()");
  assert.equal(display.dots.length,data.count);
  const values=data.points.map(point=>point.value);
  const lo=Math.min(...values),hi=Math.max(...values),pad=(hi-lo)*.12||Math.max(Math.abs(lo)*.005,.01);
  for (const [index,point] of data.points.entries()) {
    const dot=display.dots[index];
    assert.equal(dot.cycle,point.cycle);
    assert.equal(dot.value,point.value);
    assert.equal(dot.title,'Cycle '+point.cycle+' · '+point.value);
    const x=data.start===data.end?405:89+(point.cycle-data.start)/(data.end-data.start)*632;
    const y=232-(point.value-(lo-pad))/((hi+pad)-(lo-pad))*216;
    assert(Math.abs(dot.x-x)<1e-10 && Math.abs(dot.y-y)<1e-10,'Circle must retain original axes and value geometry');
  }

  // Independently enumerate maximal contiguous runs and compare the entire SVG path.
  const runs=[];
  for (const dot of display.dots) {
    const previous=runs.at(-1)?.at(-1);
    if (!previous || dot.cycle!==previous.cycle+1) runs.push([]);
    runs.at(-1).push(dot);
  }
  const segments=runs.filter(run=>run.length>1);
  const expected=beforeMode?[]:segments.flatMap(run=>run.map((dot,index)=>[index?'L':'M',dot.x,dot.y]));
  assert.equal(display.paths.length,expected.length?1:0);
  const path=display.paths[0] || '';
  const commands=[...path.matchAll(/([ML]) ([^ ]+) ([^ ]+)/g)].map(([,op,x,y])=>[op,Number(x),Number(y)]);
  assert.deepEqual(commands,expected);
  assert.equal(commands.map(command=>command.join(' ')).join(' '),path);
  if (commands.length) {
    assert.equal(display.pointer,'none');
    assert(display.behind);
    assert.notEqual(display.lineStyle[0],'none');
    assert.deepEqual(display.lineStyle.slice(1),['none','none']);
  }
  const evidence={source,url,http:200,circles:display.dots.length,paths:display.paths.length,
    moves:commands.filter(([op])=>op==='M').length,lines:commands.filter(([op])=>op==='L').length,
    first:commands[0],last:commands.at(-1),runs:segments.map(run=>[run[0].cycle,run.at(-1).cycle]),
    geometrySha256:fingerprint(JSON.stringify(display.dots)),promptSha256:fingerprint(await preview()),result:'PASS'};
  out('geometry',evidence);
  return evidence;
}

async function syntheticGaps(url,envelope) {
  for (const [label,cycles] of [
    ['two consecutive observations',[1,2]],['two nonconsecutive observations',[1,4]],
    ['Cycle 1, 2, 4',[1,2,4]],['multiple separated runs',[1,2,4,5,7,9,10]],
    ['singleton',[4]],['empty',[]],
  ]) {
    const payload=structuredClone(envelope);
    payload.data.points=payload.data.points.filter(point=>cycles.includes(point.cycle));
    payload.data.count=cycles.length;
    const result=await injectHistory(url,200,JSON.stringify(payload),cycles.length?'ready':'empty');
    const {data}=JSON.parse((await call('Network.getResponseBody',{requestId:result.hit.id})).body);
    assert.deepEqual(data.points.map(point=>point.cycle),cycles);
    if (cycles.length) await checkPrompt(result.hit); else assertCleared(result.after,'empty');
    const chart=await checkGeometry(data,url,'SYNTHETIC — NOT NASA FD001');
    const observed=await evaluate("Array.from(document.querySelectorAll('#chart circle'),dot=>Number(dot.dataset.cycle))");
    assert.deepEqual(observed,cycles);
    out('synthetic_gap',{source:'SYNTHETIC — NOT NASA FD001',label,observed,lines:chart.lines,runs:chart.runs,result:'PASS'});
  }
}

async function syntheticErrors(url,envelope) {
  const badCases=[
    ['null',body=>{body.data.points[0].value=null;}],
    ['undefined',body=>{delete body.data.points[0].value;}],
    ['nonfinite',body=>{body.data.points[0].value='VIS_NONFINITE';}],
    ['source SHA-256 mismatch',body=>{body.data.points[0].raw_reference.source_sha256='0'.repeat(64);}],
  ];
  for (const [label,alter] of badCases) {
    const mock=structuredClone(envelope);
    alter(mock);
    const result=await injectHistory(url,200,JSON.stringify(mock).replace('"VIS_NONFINITE"','1e309'),'error');
    assertCleared(result.after,'error');
    assert.match(result.after.message,/CLIENT_HISTORY_VALIDATION_FAILED/);
    out('synthetic_error',{source:'SYNTHETIC — NOT NASA FD001',label,url,http:result.hit.status,before:result.before,after:result.after,result:'PASS'});
  }
  const response503=JSON.stringify({status:'error',error:{code:'DATA_NOT_READY',message:'SYNTHETIC UAT fault',details:{}}});
  const error=await injectHistory(url,503,response503,'error');
  assertCleared(error.after,'error');
  assert.match(error.after.message,/503.*DATA_NOT_READY/);
  out('synthetic_error',{source:'SYNTHETIC — NOT NASA FD001',label:'isolated HTTP 503',url,http:error.hit.status,after:error.after,result:'PASS'});
  const mock=structuredClone(envelope);
  mock.data.points=mock.data.points.slice(0,1);
  mock.data.count=1;
  const point=mock.data.points[0];
  point.value=0;
  point.raw_reference.original_value=point.raw_reference.reread_value='0.00';
  const zero=await injectHistory(url,200,JSON.stringify(mock),'ready');
  const data=await checkPrompt(zero.hit);
  assert.equal(data.points[0].value,0);
  const chart=await checkGeometry(data,url,'SYNTHETIC — NOT NASA FD001');
  assert.equal(chart.circles,1);
  out('synthetic_zero',{source:'SYNTHETIC — NOT NASA FD001',url,http:zero.hit.status,value:0,after:zero.after,result:'PASS'});
}

async function run() {
  if (attached) {
    // An already running service can produce a read-only baseline, but is never stopped by this driver.
    for (const [url,file] of [['/','web/index.html'],['/style.css','web/style.css'],['/ui.js','web/ui.js']]) {
      const response=await fetch(origin+url);
      assert.equal(response.status,200);
      const actual=Buffer.from(await response.arrayBuffer());
      const expected=await readFile(file);
      assert(actual.equals(expected),'Existing listener must serve this checkout before it may provide a baseline');
      out('existing_listener_asset',{path:url,http:response.status,sha256:fingerprint(actual)});
    }
  } else {
    await control('start');
  }
  const portFile = join(profile,'DevToolsActivePort');
  const devtoolsPort = await until(() => readFile(portFile,'utf8').then(x=>x.split(/\s+/)[0]).catch(()=>false),'Chrome DevTools port');
  const targets = await (await fetch('http://127.0.0.1:'+devtoolsPort+'/json/list')).json();
  socket = new WebSocket(targets.find(t=>t.type==='page').webSocketDebuggerUrl);
  await new Promise((resolve,reject) => {
    socket.addEventListener('open',resolve,{once:true});
    socket.addEventListener('error',reject,{once:true});
  });
  socket.addEventListener('message',onMessage);
  const version = await call('Browser.getVersion');
  out('browser',{product:version.product,protocol:version.protocolVersion,node:process.version});
  for (const method of ['Page.enable','Network.enable','Runtime.enable','Log.enable']) await call(method);
  await call('Emulation.setDeviceMetricsOverride',{width:1440,height:1020,deviceScaleFactor:1,mobile:false});
  const initial = history('train',1,7,1,20);
  await scenario('Live landing and default Sensor 7 window','ready',initial,200,()=>call('Page.navigate',{url:origin+'/'}));
  for (const route of ['/','/style.css','/ui.js','/api/health','/api/catalog','/api/units?split=train']) {
    const request=await response(origin+route,200,0);
    out('startup_request',{url:request.url,http:request.status,contentType:request.mime});
  }
  const catalogHit=await response(origin+'/api/catalog',200,0);
  verifiedCatalog=JSON.parse((await call('Network.getResponseBody',{requestId:catalogHit.id})).body).data;
  const range100=history('train',1,9,1,100);
  const primary=await scenario('Train Unit 1 Sensor 9, Cycles 1-100','ready',range100,200,async()=>{
    await select('sensor',8);
    await windowInput(1,100);
  });
  const envelope=JSON.parse((await call('Network.getResponseBody',{requestId:primary.id})).body);
  const geometry=await checkGeometry(envelope.data,range100);
  assert.equal(geometry.circles,100);
  const primaryShot=await capture();
  if (beforeMode) {
    await writeFile(baselineFile,JSON.stringify({photo:primaryShot,geometry,browser:version.product,time:stamp()}));
    out('before_capture',{circles:geometry.circles,paths:geometry.paths,sha256:fingerprint(Buffer.from(primaryShot,'base64')),result:'PASS'});
    return;
  }

  const baseline=JSON.parse(await readFile(baselineFile,'utf8'));
  assert.equal(baseline.browser,version.product);
  assert.equal(geometry.geometrySha256,baseline.geometry.geometrySha256);
  assert.equal(geometry.promptSha256,baseline.geometry.promptSha256);
  assert.equal(geometry.moves,1);
  assert.equal(geometry.lines,99);
  out('before_after',{unchangedGeometry:true,unchangedUnfocusedPrompt:true,beforePaths:baseline.geometry.paths,afterPaths:geometry.paths});
  await clickPoint(10);
  assert((await preview()).includes('Selected row (the complete window is above): 10 | '));
  assert.equal(promptRows(await preview()).length,100);
  out('native_point',{cycle:10,selection:(await snapshot()).promptScope,result:'PASS'});
  await sample(primary,'train',1,9,[1,10,100]);

  const train7=await scenario('Train Unit 1 Sensor 7, Cycles 1-20','ready',initial,200,async()=>{
    await select('sensor',6);
    await windowInput(1,20);
  });
  await sample(train7,'train',1,7,[1,20]);
  await evaluate('window.scrollTo(0,0)');
  await clickPoint(4);
  await clipboardChecks();

  const train2=history('train',2,5,5,12);
  const second=await scenario('Train Unit 2 Sensor 5, Cycles 5-12','ready',train2,200,async()=>{
    await select('unit',1);
    await select('sensor',4);
    await windowInput(5,12);
  });
  const secondaryShot=await capture();
  await sample(second,'train',2,5,[5,12]);

  const test=await scenario('Test Unit 1 Sensor 7, Cycles 5-12','ready',history('test',1,7,5,12),200,async()=>{
    await select('split',1);
    await select('sensor',6);
  });
  await sample(test,'test',1,7,[5,12]);
  await scenario('Live Test singleton','ready',history('test',1,7,31,31),200,()=>windowInput(31,31));
  const empty=await scenario('Live Test empty','empty',history('test',1,7,32,33),200,()=>windowInput(32,33));
  const emptyBody=JSON.parse((await call('Network.getResponseBody',{requestId:empty.id})).body);
  assert.deepEqual([emptyBody.data.points,emptyBody.data.count],[[],0]);
  await scenario('Reversed Cycles','invalid',null,null,()=>windowInput(20,1));
  await scenario('Oversized range','invalid',null,null,()=>windowInput(1,101));
  await scenario('Reload and restore primary live case','ready',range100,200,async()=>{
    await call('Page.reload',{ignoreCache:true});
    await state('ready');
    await select('sensor',8);
    await windowInput(1,100);
  });

  await syntheticGaps(range100,envelope);
  await syntheticErrors(range100,envelope);
  await scenario('Clear synthetic observations and restore live data','ready',range100,200,pressLoad);
  await raceRequest({field:'split',pendingIndex:1,finalIndex:0,pausedUrl:origin+'/api/units?split=test',recoveredHistory:range100});
  await raceRequest({field:'unit',pendingIndex:1,finalIndex:0,pausedUrl:history('train',2,9,1,100),recoveredHistory:range100});
  // Hold the intermediate Sensor 8 request, then return to the student-selected window.
  await evaluate("document.querySelector('#sensor').focus()");
  await raceRequest({field:'sensor',choosePending:()=>key('ArrowUp'),chooseFinal:()=>key('ArrowDown'),
    pausedUrl:history('train',1,8,1,100),recoveredHistory:range100});

  if (attached) {
    out('lifecycle_not_owned',{port,reason:'Read-only attached run; existing listener left running'});
  } else {
    await control('stop');
    const mark=events.length;
    await pressLoad();
    const failed=await until(()=>events.slice(mark).find(entry=>entry.url===range100 && entry.failure),'genuine loopback refusal');
    assert.equal(failed.failure,'net::ERR_CONNECTION_REFUSED');
    assert.equal(failed.status,undefined);
    const down=await state('error');
    assertCleared(down,'error');
    out('outage',{url:range100,network:failed.failure,httpReceived:false,after:down,result:'PASS'});
    await control('start');
    const recovered=await scenario('Same Chrome tab after Python restarted','ready',range100,200,pressLoad);
    const restored=await checkPrompt(recovered);
    assert.equal(restored.points[0].value,envelope.data.points[0].value);
  }
  assert.deepEqual(external,[]);
  assert(events.every(event=>event.method==='GET'));
  const storage=await evaluate('({local:localStorage.length,session:sessionStorage.length})');
  assert.deepEqual(storage,{local:0,session:0});
  assert(!logs.some(log=>log.kind!=='network'||!['503','ERR_CONNECTION_REFUSED'].some(text=>log.text.includes(text))));
  out('security',{externalRequests:external.length,storage,console:logs,uncaughtExceptions:0});
  await montage([['BEFORE - Train Unit 1 Sensor 9, Cycles 1-100',baseline.photo],
    ['AFTER - Train Unit 1 Sensor 9, Cycles 1-100',primaryShot],
    ['AFTER - Train Unit 2 Sensor 5, Cycles 5-12',secondaryShot]]);
}

try {
  await run();
  out('result',{mode,status:'OK'});
} finally {
  if (socket?.readyState === WebSocket.OPEN) {
    await call('Browser.close').catch(()=>{});
    socket.close();
  }
  let exit = await Promise.race([browserExit,delay(3000).then(()=>null)]);
  if (!exit) {
    browser.kill();
    exit = await Promise.race([browserExit,delay(3000).then(()=>null)]);
  }
  if (exit) {
    assert.equal(dirname(await realpath(profile)).toLowerCase(),temp.toLowerCase());
    assert(basename(profile).startsWith('fd001-vis-'));
    await rm(profile,{recursive:true,force:true,maxRetries:4,retryDelay:250});
  }
  out('browser_exit',exit ?? {code:null});
  supervisor.stdin.end('quit\n');
  const supervisorStatus=await supervisorExit;
  assert.equal(supervisorStatus,0,'Python supervisor must exit cleanly');
  out('supervisor_exit',{exit_code:supervisorStatus});
}
