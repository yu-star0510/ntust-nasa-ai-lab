import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { createInterface } from 'node:readline';
import { once } from 'node:events';
import vm from 'node:vm';

const origin = 'http://127.0.0.1:8765';
const stamp = () => new Date().toISOString();
const out = (type, data) => console.log(JSON.stringify({type, time: stamp(), ...data}));
if (process.argv.includes('--gate-unit')) {
  const sandbox = vm.createContext({
    document:{getElementById:()=>({dataset:{},addEventListener(){}})},
    navigator:{}, fetch:()=>new Promise(()=>{}),
  });
  vm.runInContext(await readFile('web/ui.js','utf8'),sandbox);
  // All values, tokens, positions and digests in these gate-only fixtures are SYNTHETIC.
  const hash = 'a'.repeat(64);
  const file = 'FD001/train_FD001.txt';
  const selection = {split:'train',unit:1,sensor:7,start:1,end:2};
  const point = {cycle:1,value:0,sensor_name:'sensor_7',raw_reference:{
    dataset_split:'train',unit_id:1,cycle:1,column_name:'sensor_7',source_file:file,source_sha256:hash,
    physical_line_number:1,data_row_index:0,data_row_index_base:0,
    source_column_index:12,original_value:'0.00',reread_value:'0.00',reread_matches:true,
  }};
  const fixture = {selection,history:{dataset_split:'train',unit_id:1,sensor_name:'sensor_7',start:1,end:2,count:1,points:[point]},
    catalog:{dataset:'NASA_CMAPSS_FD001',source_type:'TRUSTED_LOCAL_FILES',contract_version:'1.0.1',
      splits:['train','test'],max_history_cycle_span:100,sensors:[{index:7,name:'sensor_7',source_column_index:12}],
      summary:{train:{rows:2,columns:26,unit_count:1,missing_total:0}}},
    health:{readiness:'ready',validation_status:'PASS',contract_version:'1.0.1',source_type:'TRUSTED_LOCAL_FILES',
      sources:{train:{hash_verified:true},test:{hash_verified:true},rul:{hash_verified:true}}},
    unitSource:{dataset_split:'train',unit_ids:[1],source_file:file,source_sha256:hash}};
  const cases = [
    ['numeric zero', true, ()=>{}],
    ['legal empty', true, f=>{f.history.points=[];f.history.count=0;}],
    ['null', false, f=>{f.history.points[0].value=null;}],
    ['undefined', false, f=>{delete f.history.points[0].value;}],
    ['NaN', false, f=>{f.history.points[0].value=NaN;}],
    ['Infinity', false, f=>{f.history.points[0].value=Infinity;}],
    ['negative Infinity', false, f=>{f.history.points[0].value=-Infinity;}],
    ['numeric string', false, f=>{f.history.points[0].value='0';}],
    ['wrong count', false, f=>{f.history.count=0;}],
    ['invalid raw row', false, f=>{f.history.points[0].raw_reference.data_row_index=-1;}],
    ['mismatched SHA-256', false, f=>{f.history.points[0].raw_reference.source_sha256='b'.repeat(64);}],
    ['nonascending Cycle', false, f=>{f.history.points.push(structuredClone(point));f.history.count=2;}],
    ['wrong reread', false, f=>{f.history.points[0].raw_reference.reread_value='1';}],
    ['untrusted metadata', false, f=>{f.health.sources.rul.hash_verified=false;}],
  ];
  for (const [name,accepted,mutate] of cases) {
    sandbox.fixture=structuredClone(fixture);
    mutate(sandbox.fixture);
    const run = ()=>vm.runInContext('validateHistory(fixture)',sandbox);
    if (accepted) assert.doesNotThrow(run); else assert.throws(run);
    out('gate_unit',{name,accepted,source:'SYNTHETIC',result:'PASS'});
  }
  out('gate_unit_result',{tests:cases.length,passed:cases.length});
  process.exit(0);
}

assert(process.argv.includes('--supervised'),'Start via python -B tests/test_m5_browser_uat.py in a Windows console');
const inputLines = createInterface({input:process.stdin});
async function control(command) {
  const reply = once(inputLines,'line');
  console.log(JSON.stringify({type:'control',command}));
  const [line] = await reply;
  const result = JSON.parse(line);
  assert(result.ok,result.error || 'API lifecycle control failed');
  return result;
}

const temp = await realpath(tmpdir());
const profile = await mkdtemp(join(temp, 'fd001-m5-'));
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
const snapshot = () => evaluate("({controls:['split','unit','sensor','start','end'].map(k=>document.getElementById(k)?.value), status:document.querySelector('#feedback')?.dataset.state, message:document.querySelector('#feedback')?.textContent, selection:document.querySelector('#selection')?.textContent, dots:document.querySelectorAll('#chart circle').length, rows:document.querySelectorAll('#rows tr').length, source:document.querySelector('#source dd')!==null,promptState:document.querySelector('#prompt-status')?.dataset.state,previewLength:document.querySelector('#prompt-preview')?.textContent.length,copyDisabled:document.querySelector('#copy-prompt')?.disabled,promptScope:document.querySelector('#prompt-scope')?.textContent})");
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
    await checkPrompt(hit);
  } else {
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

async function invalidHistoryChecks(initial, envelope) {
  const cases = [
    ['original null 554.36 to null', p=>{p.data.points[0].value=null;}],
    ['undefined value', p=>{delete p.data.points[0].value;}],
    ['Infinity', p=>{p.data.points[0].value='M5_INFINITY';}],
    ['negative Infinity', p=>{p.data.points[0].value='M5_NEGATIVE_INFINITY';}],
    ['numeric string', p=>{p.data.points[0].value='554.36';}],
    ['wrong token', p=>{p.data.points[0].raw_reference.original_value='0';}],
    ['wrong source column', p=>{p.data.points[0].raw_reference.source_column_index=10;}],
    ['wrong count', p=>{p.data.count++;}],
    ['wrong hash', p=>{p.data.points[0].raw_reference.source_sha256='b'.repeat(64);}],
    ['wrong point Cycle', p=>{p.data.points[0].cycle=99;}],
  ];
  for (const [name,mutate] of cases) {
    const mock=structuredClone(envelope);
    mutate(mock);
    const payload=JSON.stringify(mock).replace('"M5_INFINITY"','1e309').replace('"M5_NEGATIVE_INFINITY"','-1e309');
    const result=await injectHistory(initial,200,payload,'error');
    assertCleared(result.after,'error');
    assert.match(result.after.message,/CLIENT_HISTORY_VALIDATION_FAILED/);
    assert(!result.after.message.includes('503'));
    out('synthetic_history',{name,http:result.hit.status,url:result.hit.url,before:result.before,after:result.after,result:'PASS'});
  }
}

async function apiErrors() {
  const good = history('train',1,7,1,20);
  const cases = [
    ['GET',good.replace('start=1&end=20','start=20&end=1'),400,'INVALID_CYCLE_RANGE'],
    ['GET',good.replace('start=1','start=0'),400,'INVALID_CYCLE_RANGE'],
    ['GET',good.replace('start=1','start=-1'),400,'INVALID_PARAMETER'],
    ['GET',good.replace('start=1','start=1.5'),400,'INVALID_PARAMETER'],
    ['GET',good.replace('end=20','end=101'),400,'INVALID_CYCLE_RANGE'],
    ['GET',good.replace('sensor=7','sensor=0'),400,'INVALID_SENSOR'],
    ['GET',good.replace('sensor=7','sensor=22'),400,'INVALID_SENSOR'],
    ['GET',good.replace('split=train','split=bad'),400,'INVALID_PARAMETER'],
    ['GET',good.replace('unit=1','unit=9999'),404,'UNKNOWN_UNIT'],
    ['GET',good.replace('&unit=1',''),400,'INVALID_PARAMETER'],
    ['GET',good+'&unit=2',400,'INVALID_PARAMETER'],
    ['GET',good+'&unknown=1',400,'INVALID_PARAMETER'],
    ['GET',origin+'/api/not-a-route',404,'UNKNOWN_ENDPOINT'],
    ['GET',origin+'/FD001/train_FD001.txt',404,'UNKNOWN_ENDPOINT'],
    ['POST',origin+'/api/health',405,'METHOD_NOT_ALLOWED'],
    ['PUT',origin+'/api/health',405,'METHOD_NOT_ALLOWED'],
    ['HEAD',origin+'/api/health',405,null],
  ];
  for (const [method,url,status,code] of cases) {
    const response=await fetch(url,{method});
    assert.equal(response.status,status);
    const text=await response.text();
    const body=code ? JSON.parse(text) : undefined;
    if (code) assert.equal(body.error.code,code); else assert.equal(text,'');
    if (status===405) assert.equal(response.headers.get('allow'),'GET');
    out('direct_http',{method,url,http:status,code:body?.error.code || 'HEAD has no body',result:'PASS'});
  }
}

async function raceRequest({field, pendingIndex, finalIndex, pausedUrl, recoveredHistory}) {
  await call('Fetch.enable',{patterns:[{urlPattern:pausedUrl,requestStage:'Request'}]});
  const mark=events.length;
  try {
    await select(field,pendingIndex);
    await until(()=>paused.find(p=>p.request.url===pausedUrl),'paused '+field);
    assertCleared(await snapshot(),'loading');
    await scenario('Rapid '+field+' switch','ready',recoveredHistory,200,()=>select(field,finalIndex));
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
  await writeFile('reports/M5_BROWSER_SCREENSHOT.png',Buffer.from(data,'base64'));
  out('screenshot',{file:'reports/M5_BROWSER_SCREENSHOT.png',states:states.map(([label])=>label)});
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
    out('source',{url:hit.url,http:hit.status,actual:expected,promptRow,windowCount:data.count,svg:{x:+dom.dot[2],y:+dom.dot[3]},match:true});
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
try {
  const portFile = join(profile,'DevToolsActivePort');
  const port = await until(() => readFile(portFile,'utf8').then(x=>x.split(/\s+/)[0]).catch(()=>false),'Chrome DevTools port');
  const targets = await (await fetch('http://127.0.0.1:'+port+'/json/list')).json();
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
  const first = await scenario('Initial navigation','ready',initial,200,()=>call('Page.navigate',{url:origin+'/'}));
  assert.deepEqual([(await snapshot()).dots,(await snapshot()).rows],[20,20]);
  for (const route of ['/', '/style.css', '/ui.js', '/api/health', '/api/catalog', '/api/units?split=train']) {
    await response(origin+route,200,0);
  }
  const catalogHit = await response(origin+'/api/catalog',200,0);
  verifiedCatalog = JSON.parse((await call('Network.getResponseBody',{requestId:catalogHit.id})).body).data;
  await checkPrompt(first);
  const initialText=await preview();
  for (const text of ['KNOWN / OBSERVATION','INFERENCE / DESCRIPTIVE ONLY','UNKNOWN / INSUFFICIENT EVIDENCE',
    'Failure Probability','/api/history supplies no RUL labels','Columns 6-26: Sensors 1-21',
    'Split-level Verified Quality','Selected-window Descriptive Statistics','Never infer RUL']) assert(initialText.includes(text));
  const health=await response(origin+'/api/health',200,0);
  const healthBody=JSON.parse((await call('Network.getResponseBody',{requestId:health.id})).body);
  assert(Object.values(healthBody.data.sources).every(entry=>entry.hash_verified===true));
  out('browser_health',{url:health.url,http:health.status,body:healthBody});
  const normalShot=await capture();
  const original=JSON.parse((await call('Network.getResponseBody',{requestId:first.id})).body);
  assert.equal(original.data.points[0].value,554.36);
  await invalidHistoryChecks(initial,original);
  const rejectedShot=await capture();
  await scenario('Restore live response after synthetic validation','ready',initial,200,pressLoad);
  const single=history('train',1,7,1,1);
  const singleHit=await scenario('Select actual singleton for isolated zero control','ready',single,200,()=>windowInput(1,1));
  const zeroBody=JSON.parse((await call('Network.getResponseBody',{requestId:singleHit.id})).body);
  const zero=zeroBody.data.points[0];
  zero.value=0;
  zero.raw_reference.original_value='0.00';
  zero.raw_reference.reread_value='0.00';
  const zeroRun=await injectHistory(single,200,JSON.stringify(zeroBody),'ready');
  assert.equal(zeroRun.after.dots,1);
  assert.equal(zeroRun.after.promptState,'valid');
  assert.equal(await evaluate("document.querySelector('#chart circle').dataset.value"),'0');
  assert((await preview()).includes('1 | 0 | 0.00 | 1 | 0 | 12 | true'));
  out('synthetic_zero',{url:single,http:zeroRun.hit.status,actual:zeroRun.after,value:0,source:'SYNTHETIC',result:'PASS'});
  const core=await scenario('Return to original live window','ready',initial,200,()=>windowInput(1,20));
  await sample(core,'train',1,7,[1,10,20]);
  await evaluate("window.scrollTo(0,0); document.querySelector('.table-wrap').scrollTop=0");
  await clickPoint(4);
  assert((await preview()).includes('Selected row (the complete window is above): 4 | '));
  out('pointer',{cycle:4,selected:await evaluate("document.querySelector('#point-label').textContent"),
    promptScope:(await snapshot()).promptScope,rows:promptRows(await preview()).length});
  await clipboardChecks();
  await evaluate('window.scrollTo(0,0)');

  const test = await scenario('Train to Test','ready',history('test',1,7,1,20),200,()=>select('split',1));
  assert(test.status===200);
  const testWindow = await scenario('Test cycles 6-8','ready',history('test',1,7,6,8),200,()=>windowInput(6,8));
  await sample(testWindow,'test',1,7,[6,8]);
  await scenario('Test to Train','ready',history('train',1,7,6,8),200,()=>select('split',0));
  await scenario('Return to initial cycle window','ready',initial,200,()=>windowInput(1,20));
  const train2 = await scenario('Unit 1 to Unit 2','ready',history('train',2,7,1,20),200,()=>select('unit',1));
  await sample(train2,'train',2,7,[1]);
  await scenario('Sensor 7 to Sensor 5','ready',history('train',2,5,1,20),200,()=>select('sensor',4));
  const changed = await scenario('Cycles 1–20 to 5–12','ready',history('train',2,5,5,12),200,()=>windowInput(5,12));
  await sample(changed,'train',2,5,[5,12]);
  await scenario('Train Unit 2 to Unit 1','ready',history('train',1,5,5,12),200,()=>select('unit',0));
  const boundary = await scenario('Last observed boundary','ready',history('train',1,5,192,193),200,()=>windowInput(192,193));
  assert.equal((await snapshot()).rows,1);
  await sample(boundary,'train',1,5,[192]);
  const singleton = await scenario('Singleton Cycle 192','ready',history('train',1,5,192,192),200,()=>windowInput(192,192));
  assert(singleton.status===200);
  assert((await preview()).includes('Endpoint Delta: not evaluated'));
  await scenario('Empty window','empty',history('train',1,5,193,194),200,()=>windowInput(193,194));
  await scenario('Reversed window','invalid',null,null,()=>windowInput(20,10));
  await scenario('Zero Cycle','invalid',null,null,()=>windowInput(0,10));
  await scenario('Negative Cycle','invalid',null,null,()=>windowInput(-1,10));
  await scenario('Fractional Cycle','invalid',null,null,()=>windowInput('1.5',10));
  await scenario('Malformed Cycle','invalid',null,null,()=>windowInput('bad',10));
  await scenario('Over 100 cycles','invalid',null,null,()=>windowInput(1,101));
  await scenario('Exactly 100 cycles','ready',history('train',1,5,1,100),200,()=>windowInput(1,100));
  assert.equal((await snapshot()).rows,100);
  await scenario('Reload page','ready',initial,200,()=>call('Page.reload',{ignoreCache:true}));
  await raceRequest({field:'split',pendingIndex:1,finalIndex:0,pausedUrl:origin+'/api/units?split=test',recoveredHistory:initial});
  await raceRequest({field:'unit',pendingIndex:1,finalIndex:0,pausedUrl:history('train',2,7,1,20),recoveredHistory:initial});

  await call('Fetch.enable',{patterns:[{urlPattern:history('train',1,8,1,20),requestStage:'Request'}]});
  const beforeRace = events.length;
  await evaluate("document.querySelector('#sensor').focus()");
  await key('ArrowDown');
  await until(()=>paused.find(p=>p.request.url===history('train',1,8,1,20)),'delayed Sensor 8');
  assert.equal((await snapshot()).status,'loading');
  assert.equal((await snapshot()).dots,0);
  assert.equal((await snapshot()).previewLength,0);
  assert.equal((await snapshot()).copyDisabled,true);
  await scenario('Rapid Sensor 8 to Sensor 9 while earlier request is paused','ready',history('train',1,9,1,20),200,()=>key('ArrowDown'));
  await call('Fetch.disable');
  const canceled = await until(()=>events.slice(beforeRace).find(e=>e.url===history('train',1,8,1,20)&&e.failure),'canceled older request');
  assert.equal((await snapshot()).controls[2],'9');
  out('race',{earlier:canceled.url,result:canceled.failure,current:(await snapshot()).selection});

  const faultUrl = history('train',1,9,1,20);
  await call('Fetch.enable',{patterns:[{urlPattern:faultUrl, requestStage:'Request'}]});
  let faultPromise;
  intercept = p => {
    const body = JSON.stringify({status:'error',error:{code:'DATA_NOT_READY',message:'SYNTHETIC UAT source fault injection',details:{}}});
    faultPromise = call('Fetch.fulfillRequest',{requestId:p.requestId,responseCode:503,
      responseHeaders:[{name:'Content-Type',value:'application/json'}],body:Buffer.from(body).toString('base64')});
  };
  const fault = await scenario('SYNTHETIC isolated 503 injection into live page','error',faultUrl,503,
    ()=>evaluate("document.querySelector('#load').focus()").then(()=>key('Enter')));
  await faultPromise;
  const faultBody = await call('Network.getResponseBody',{requestId:fault.id});
  assert.equal(JSON.parse(faultBody.body).error.code,'DATA_NOT_READY');
  assert.match((await snapshot()).message,/Data unavailable.*503.*DATA_NOT_READY/);
  intercept = undefined;
  await call('Fetch.disable');
  await scenario('Recover after 503','ready',faultUrl,200,()=>key('Enter'));
  await scenario('Select required Train Unit 1 Sensor 7 before genuine outage','ready',initial,200,()=>select('sensor',6));
  const beforeOutage=await snapshot();
  assert.equal(beforeOutage.promptState,'valid');
  const stopped=await control('stop');
  const outageMark=events.length;
  await pressLoad();
  const failed=await until(()=>events.slice(outageMark).find(row=>row.url===initial && row.failure),'genuine browser connection refusal');
  assert.equal(failed.failure,'net::ERR_CONNECTION_REFUSED');
  assert.equal(failed.status,undefined);
  const outage=await state('error');
  assertCleared(outage,'error');
  assert.match(outage.message,/Could not read the local API/);
  out('genuine_outage',{action:'native Enter on Load window, same Chrome page',url:failed.url,network:failed.failure,
    httpStatusReceived:false,before:beforeOutage,after:outage,server:stopped,result:'PASS'});
  const outageShot=await capture();
  const restored=await control('start');
  const hit=await scenario('Recover in same Chrome page after real API restart','ready',initial,200,pressLoad);
  const recovered=await checkPrompt(hit);
  assert.equal(recovered.points[0].value,554.36);
  assert.equal(await evaluate("document.querySelector('#source [data-field=\"sensor_value\"]').textContent"),'554.36');
  out('genuine_recovery',{pid:restored.pid,url:hit.url,http:hit.status,recoveredFirstValue:recovered.points[0].value,
    after:await snapshot(),result:'PASS'});
  await apiErrors();
  assert(!logs.some(log => log.kind !== 'network'
    || (!log.text.includes('503') && !log.text.includes('ERR_CONNECTION_REFUSED'))));
  assert.deepEqual(external,[]);
  assert(events.every(event=>event.method==='GET'));
  const storage = await evaluate("({local:localStorage.length,session:sessionStorage.length})");
  assert.deepEqual(storage,{local:0,session:0});
  out('safety',{pageExternalRequests:external.length,httpMethods:['GET'],storage,copyHttpRequests:0});
  out('console',{errors:logs,uncaughtExceptions:0});
  await montage([['LIVE - verified observations',normalShot],
    ['SYNTHETIC NULL - client rejected HTTP 200',rejectedShot],
    ['REAL OUTAGE - Python stopped; browser connection refused',outageShot]]);
  out('result',{status:'OK'});
} finally {
  inputLines.close();
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
    assert(basename(profile).startsWith('fd001-m5-'));
    await rm(profile,{recursive:true,force:true,maxRetries:4,retryDelay:250});
  }
  out('browser_exit',exit ?? {code:null});
}
