# M4 local UI execution evidence

`WO-M4-WEB-001` · 2026-11-25 · Windows, PowerShell 7.6.9, Python 3.12.7. Browser QA used installed Chrome 158.0.8127.37 and Node v24.22.3. Commands ran from the repository root. PowerShell and Python timestamps include UTC+08:00. Chrome JSON uses UTC (`Z`).

GitHub `main` matched the dispatched SHA `26fcdb66d4cea2f1c826024dbd0729ed50f5510f`. `git pull --ff-only origin main` exited 0 and brought the clean local checkout from `892b3c434d0b9fdccbeaa82de553f823f9042fb2` to that baseline. The five intervening commits changed only `DECISIONS.md`, `ROADMAP.md`, and `WORK_ITEM.md`. The Worker verified M3 MAIN PASS and the accepted v1.0.1 FD001 contract.

## Source SHA-256

Equivalent PowerShell hash checks ran before implementation and after browser, integration and lifecycle checks. Both exited 0 with empty stderr. All three files match their approved hashes before and after.

```powershell
$files = 'FD001/train_FD001.txt','FD001/test_FD001.txt','FD001/RUL_FD001.txt'
Get-Date -Format o
foreach ($file in $files) {
    $sum = Get-FileHash -Algorithm SHA256 -LiteralPath $file -ErrorAction Stop
    Write-Output "$file $($sum.Hash.ToLowerInvariant())"
}
```

Before hash check stdout:

```text
2026-11-25T09:59:52.7558932+08:00
FD001/train_FD001.txt 963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8
FD001/test_FD001.txt 3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851
FD001/RUL_FD001.txt a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca
```

After stdout:

```text
2026-11-25T10:10:07.6753857+08:00
FD001/train_FD001.txt 963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8
FD001/test_FD001.txt 3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851
FD001/RUL_FD001.txt a19c8ec94931949d0485bdc35118206e9c81c4547b422efb9cf86f4ceddbceca
```

## Standalone startup and shutdown

Verified URL `http://127.0.0.1:8765/`. The live browser UAT used the process below. The readiness preflight `curl.exe --silent --show-error --output NUL --write-out '%{http_code} %{content_type}' http://127.0.0.1:8765/` exited 0 with stdout `200 text/html; charset=utf-8` and empty stderr.

```powershell
Get-Date -Format o
python -B -m web.api --port 8765
$code = $LASTEXITCODE
Get-Date -Format o
Write-Output "exit=$code"
exit $code
```

Preview stdout, with terminal control sequences removed:

```text
2026-11-25T10:03:26.3936944+08:00
FD001 API listening on http://127.0.0.1:8765 (ready)
FD001 API stopped
```

Ctrl+C reached the API and it printed its stop message. The PowerShell console wrapper exited 1 before it could print the child's result. The first lifecycle recheck exited 1 at its two-second socket-probe assertion before starting a child. An independent four-second probe returned Windows socket status 10061 and no listener appeared for this port. The final supervised check captured the direct Python exit code and confirmed refusal before and after the repeated launch. Both parent and child exited 0 with empty stderr.

```powershell
@'
import datetime
import http.client
import json
import signal
import socket
import subprocess
import sys

def now():
    return datetime.datetime.now().astimezone().isoformat()

def port_is_closed():
    with socket.socket() as probe:
        probe.settimeout(4)
        result = probe.connect_ex(("127.0.0.1", 8765))
        print("loopback_connect_ex", result, flush=True)
        return result == 10061

assert port_is_closed()
print("preview_port_closed", now(), flush=True)
print("launch", now(), flush=True)
process = subprocess.Popen([sys.executable, "-B", "-m", "web.api", "--port", "8765"],
                           creationflags=subprocess.CREATE_NEW_PROCESS_GROUP,
                           stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
line = process.stdout.readline().strip()
try:
    print("server_stdout:", line)
    assert line.endswith("(ready)")
    for target in ("/", "/api/health"):
        connection = http.client.HTTPConnection("127.0.0.1", 8765, timeout=5)
        try:
            connection.request("GET", target)
            response = connection.getresponse()
            data = response.read()
            print("GET", target, response.status, response.getheader("Content-Type"))
            assert response.status == 200
            if target == "/api/health":
                assert json.loads(data)["data"]["readiness"] == "ready"
        finally:
            connection.close()
finally:
    if process.poll() is None:
        process.send_signal(signal.CTRL_BREAK_EVENT)
    try:
        stdout, stderr = process.communicate(timeout=8)
    except subprocess.TimeoutExpired:
        process.kill()
        process.communicate()
        raise
    print("server_stdout:", stdout.strip())
    print("server_stderr:", stderr.strip() or "(empty)")
    print("child_exit", process.returncode)
assert process.returncode == 0 and stdout.strip() == "FD001 API stopped" and not stderr
assert port_is_closed()
print("port_closed", now())
'@ | python -B -
exit $LASTEXITCODE
```

Complete safe stdout:

```text
loopback_connect_ex 10061
preview_port_closed 2026-11-25T10:09:54.229966+08:00
launch 2026-11-25T10:09:54.229966+08:00
server_stdout: FD001 API listening on http://127.0.0.1:8765 (ready)
GET / 200 text/html; charset=utf-8
GET /api/health 200 application/json; charset=utf-8
server_stdout: FD001 API stopped
server_stderr: (empty)
child_exit 0
loopback_connect_ex 10061
port_closed 2026-11-25T10:09:58.183178+08:00
```

## Real Chrome UAT and source crosschecks

The first Chrome driver attempt exited 1 after it sent raw Enter without the character event and Cycle 10 failed to replace the displayed Cycle 1. Chrome itself exited 0. The driver was corrected to send native keyDown/keyUp and Space on the table button with an explicit selection check. The final run exited 0, Chrome exited 0, and stderr was empty. It verified eight observations and used an isolated synthetic interception for one 503. All successful observation responses came from the live API. A visible in-app browser also confirmed selector changes and reload. Execute this command with the documented local server running in a separate console.

```powershell
@'
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

const origin = 'http://127.0.0.1:8765';
const stamp = () => new Date().toISOString();
const out = (type, data) => console.log(JSON.stringify({type, time: stamp(), ...data}));
const temp = await realpath(tmpdir());
const profile = await mkdtemp(join(temp, 'fd001-m4-'));
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
  const result = await call('Runtime.evaluate',{expression, returnByValue:true});
  assert(!result.exceptionDetails, 'Browser evaluation should succeed');
  return result.result.value;
};
const snapshot = () => evaluate("({controls:['split','unit','sensor','start','end'].map(k=>document.getElementById(k)?.value), status:document.querySelector('#feedback')?.dataset.state, message:document.querySelector('#feedback')?.textContent, selection:document.querySelector('#selection')?.textContent, dots:document.querySelectorAll('#chart circle').length, rows:document.querySelectorAll('#rows tr').length, source:document.querySelector('#source dd')!==null})");
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
  out('scenario',{name,before,after,network:summary(mark)});
  return hit;
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
    out('source',{url:hit.url,http:hit.status,actual:expected,chart:{x:+dom.dot[2],y:+dom.dot[3]},match:true});
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
  await sample(first,'train',1,7,[1,10,20]);
  await evaluate("window.scrollTo(0,0); document.querySelector('.table-wrap').scrollTop=0");
  await clickPoint(4);
  out('pointer',{cycle:4,selected:await evaluate("document.querySelector('#point-label').textContent")});
  assert(await evaluate("document.querySelector('#rows .selected').getBoundingClientRect().bottom < innerHeight"));
  const picture = await call('Page.captureScreenshot',{format:'png',fromSurface:true});
  await writeFile('reports/M4_BROWSER_SCREENSHOT.png',Buffer.from(picture.data,'base64'));
  out('screenshot',{file:'reports/M4_BROWSER_SCREENSHOT.png',width:1440,height:1020});

  const test = await scenario('Train to Test','ready',history('test',1,7,1,20),200,()=>select('split',1));
  await sample(test,'test',1,7,[1]);
  await scenario('Test to Train','ready',initial,200,()=>select('split',0));
  const train2 = await scenario('Unit 1 to Unit 2','ready',history('train',2,7,1,20),200,()=>select('unit',1));
  await sample(train2,'train',2,7,[1]);
  await scenario('Sensor 7 to Sensor 5','ready',history('train',2,5,1,20),200,()=>select('sensor',4));
  const changed = await scenario('Cycles 1–20 to 5–12','ready',history('train',2,5,5,12),200,()=>windowInput(5,12));
  await sample(changed,'train',2,5,[5,12]);
  await scenario('Train Unit 2 to Unit 1','ready',history('train',1,5,5,12),200,()=>select('unit',0));
  const boundary = await scenario('Last observed boundary','ready',history('train',1,5,192,193),200,()=>windowInput(192,193));
  assert.equal((await snapshot()).rows,1);
  await sample(boundary,'train',1,5,[192]);
  await scenario('Empty window','empty',history('train',1,5,193,194),200,()=>windowInput(193,194));
  await scenario('Reversed window','invalid',null,null,()=>windowInput(20,10));
  await scenario('Over 100 cycles','invalid',null,null,()=>windowInput(1,101));
  await scenario('Exactly 100 cycles','ready',history('train',1,5,1,100),200,()=>windowInput(1,100));
  assert.equal((await snapshot()).rows,100);
  await scenario('Reload page','ready',initial,200,()=>call('Page.reload',{ignoreCache:true}));

  await call('Fetch.enable',{patterns:[{urlPattern:history('train',1,8,1,20),requestStage:'Request'}]});
  const beforeRace = events.length;
  await evaluate("document.querySelector('#sensor').focus()");
  await key('ArrowDown');
  await until(()=>paused.find(p=>p.request.url===history('train',1,8,1,20)),'delayed Sensor 8');
  assert.equal((await snapshot()).status,'loading');
  assert.equal((await snapshot()).dots,0);
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
  assert(!logs.some(log => log.kind !== 'network' || !log.text.includes('503')));
  out('console',{errors:logs,uncaughtExceptions:0});
  out('result',{status:'OK'});
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
    assert(basename(profile).startsWith('fd001-m4-'));
    await rm(profile,{recursive:true,force:true,maxRetries:4,retryDelay:250});
  }
  out('browser_exit',exit ?? {code:null});
}
'@ | node --input-type=module
exit $LASTEXITCODE
```

Complete safe stdout. `before` and `after` are actual browser DOM readings. Network and Console are live Chrome events.

```text
{"type":"browser","time":"2026-11-25T02:08:33.811Z","product":"Chrome/158.0.8127.37","protocol":"1.3","node":"v24.22.3"}
{"type":"scenario","time":"2026-11-25T02:08:34.061Z","name":"Initial navigation","before":{"controls":[null,null,null,null,null],"dots":0,"rows":0,"source":false},"after":{"controls":["train","1","7","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_7 · Cycles 1–20","dots":20,"rows":20,"source":true},"network":[{"url":"http://127.0.0.1:8765/","method":"GET","status":200,"mime":"text/html"},{"url":"http://127.0.0.1:8765/style.css","method":"GET","status":200,"mime":"text/css"},{"url":"http://127.0.0.1:8765/ui.js","method":"GET","status":200,"mime":"text/javascript"},{"url":"http://127.0.0.1:8765/api/health","method":"GET","status":200,"mime":"application/json"},{"url":"http://127.0.0.1:8765/api/catalog","method":"GET","status":200,"mime":"application/json"},{"url":"http://127.0.0.1:8765/api/units?split=train","method":"GET","status":200,"mime":"application/json"},{"url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=7&start=1&end=20","method":"GET","status":200,"mime":"application/json"}]}
{"type":"source","time":"2026-11-25T02:08:34.073Z","url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=7&start=1&end=20","http":200,"actual":{"dataset_split":"train","unit_id":1,"cycle":1,"sensor_name":"sensor_7","sensor_value":554.36,"source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":1,"data_row_index":0,"source_column_index":12,"original_value":"554.36","reread_matches":true},"chart":{"x":89,"y":94.12008476571336},"match":true}
{"type":"source","time":"2026-11-25T02:08:34.077Z","url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=7&start=1&end=20","http":200,"actual":{"dataset_split":"train","unit_id":1,"cycle":10,"sensor_name":"sensor_7","sensor_value":553.59,"source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":10,"data_row_index":9,"source_column_index":12,"original_value":"553.59","reread_matches":true},"chart":{"x":388.36842105263156,"y":192.02448787379353},"match":true}
{"type":"source","time":"2026-11-25T02:08:34.080Z","url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=7&start=1&end=20","http":200,"actual":{"dataset_split":"train","unit_id":1,"cycle":20,"sensor_name":"sensor_7","sensor_value":554.81,"source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":20,"data_row_index":19,"source_column_index":12,"original_value":"554.81","reread_matches":true},"chart":{"x":721,"y":36.90322580645301},"match":true}
{"type":"pointer","time":"2026-11-25T02:08:34.085Z","cycle":4,"selected":"Cycle 4 · sensor_7"}
{"type":"screenshot","time":"2026-11-25T02:08:34.143Z","file":"reports/M4_BROWSER_SCREENSHOT.png","width":1440,"height":1020}
{"type":"scenario","time":"2026-11-25T02:08:34.248Z","name":"Train to Test","before":{"controls":["train","1","7","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_7 · Cycles 1–20","dots":20,"rows":20,"source":true},"after":{"controls":["test","1","7","1","20"],"status":"ready","message":"Observations loaded.","selection":"Test · Unit 1 · sensor_7 · Cycles 1–20","dots":20,"rows":20,"source":true},"network":[{"url":"http://127.0.0.1:8765/api/units?split=test","method":"GET","status":200,"mime":"application/json"},{"url":"http://127.0.0.1:8765/api/history?split=test&unit=1&sensor=7&start=1&end=20","method":"GET","status":200,"mime":"application/json"}]}
{"type":"source","time":"2026-11-25T02:08:34.260Z","url":"http://127.0.0.1:8765/api/history?split=test&unit=1&sensor=7&start=1&end=20","http":200,"actual":{"dataset_split":"test","unit_id":1,"cycle":1,"sensor_name":"sensor_7","sensor_value":553.9,"source_file":"FD001/test_FD001.txt","source_sha256":"3cda7109ce17bafb5443f2ac926cfcf88154b941b8c4cf95eb55d1ddd6f52851","physical_line_number":1,"data_row_index":0,"source_column_index":12,"original_value":"553.90","reread_matches":true},"chart":{"x":89,"y":159.4838709677444},"match":true}
{"type":"scenario","time":"2026-11-25T02:08:34.359Z","name":"Test to Train","before":{"controls":["test","1","7","1","20"],"status":"ready","message":"Observations loaded.","selection":"Test · Unit 1 · sensor_7 · Cycles 1–20","dots":20,"rows":20,"source":true},"after":{"controls":["train","1","7","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_7 · Cycles 1–20","dots":20,"rows":20,"source":true},"network":[{"url":"http://127.0.0.1:8765/api/units?split=train","method":"GET","status":200,"mime":"application/json"},{"url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=7&start=1&end=20","method":"GET","status":200,"mime":"application/json"}]}
{"type":"scenario","time":"2026-11-25T02:08:34.468Z","name":"Unit 1 to Unit 2","before":{"controls":["train","1","7","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_7 · Cycles 1–20","dots":20,"rows":20,"source":true},"after":{"controls":["train","2","7","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 2 · sensor_7 · Cycles 1–20","dots":20,"rows":20,"source":true},"network":[{"url":"http://127.0.0.1:8765/api/history?split=train&unit=2&sensor=7&start=1&end=20","method":"GET","status":200,"mime":"application/json"}]}
{"type":"source","time":"2026-11-25T02:08:34.473Z","url":"http://127.0.0.1:8765/api/history?split=train&unit=2&sensor=7&start=1&end=20","http":200,"actual":{"dataset_split":"train","unit_id":2,"cycle":1,"sensor_name":"sensor_7","sensor_value":554.53,"source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":193,"data_row_index":192,"source_column_index":12,"original_value":"554.53","reread_matches":true},"chart":{"x":89,"y":113.84761527805591},"match":true}
{"type":"scenario","time":"2026-11-25T02:08:34.623Z","name":"Sensor 7 to Sensor 5","before":{"controls":["train","2","7","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 2 · sensor_7 · Cycles 1–20","dots":20,"rows":20,"source":true},"after":{"controls":["train","2","5","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 2 · sensor_5 · Cycles 1–20","dots":20,"rows":20,"source":true},"network":[{"url":"http://127.0.0.1:8765/api/history?split=train&unit=2&sensor=2&start=1&end=20","method":"GET","failure":"net::ERR_ABORTED"},{"url":"http://127.0.0.1:8765/api/history?split=train&unit=2&sensor=5&start=1&end=20","method":"GET","status":200,"mime":"application/json"}]}
{"type":"scenario","time":"2026-11-25T02:08:35.011Z","name":"Cycles 1–20 to 5–12","before":{"controls":["train","2","5","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 2 · sensor_5 · Cycles 1–20","dots":20,"rows":20,"source":true},"after":{"controls":["train","2","5","5","12"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 2 · sensor_5 · Cycles 5–12","dots":8,"rows":8,"source":true},"network":[{"url":"http://127.0.0.1:8765/api/history?split=train&unit=2&sensor=5&start=5&end=12","method":"GET","status":200,"mime":"application/json"}]}
{"type":"source","time":"2026-11-25T02:08:35.021Z","url":"http://127.0.0.1:8765/api/history?split=train&unit=2&sensor=5&start=5&end=12","http":200,"actual":{"dataset_split":"train","unit_id":2,"cycle":5,"sensor_name":"sensor_5","sensor_value":14.62,"source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":197,"data_row_index":196,"source_column_index":10,"original_value":"14.62","reread_matches":true},"chart":{"x":89,"y":124},"match":true}
{"type":"source","time":"2026-11-25T02:08:35.026Z","url":"http://127.0.0.1:8765/api/history?split=train&unit=2&sensor=5&start=5&end=12","http":200,"actual":{"dataset_split":"train","unit_id":2,"cycle":12,"sensor_name":"sensor_5","sensor_value":14.62,"source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":204,"data_row_index":203,"source_column_index":10,"original_value":"14.62","reread_matches":true},"chart":{"x":721,"y":124},"match":true}
{"type":"scenario","time":"2026-11-25T02:08:35.167Z","name":"Train Unit 2 to Unit 1","before":{"controls":["train","2","5","5","12"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 2 · sensor_5 · Cycles 5–12","dots":8,"rows":8,"source":true},"after":{"controls":["train","1","5","5","12"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_5 · Cycles 5–12","dots":8,"rows":8,"source":true},"network":[{"url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=5&start=5&end=12","method":"GET","status":200,"mime":"application/json"}]}
{"type":"scenario","time":"2026-11-25T02:08:35.465Z","name":"Last observed boundary","before":{"controls":["train","1","5","5","12"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_5 · Cycles 5–12","dots":8,"rows":8,"source":true},"after":{"controls":["train","1","5","192","193"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_5 · Cycles 192–193","dots":1,"rows":1,"source":true},"network":[{"url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=5&start=192&end=193","method":"GET","status":200,"mime":"application/json"}]}
{"type":"source","time":"2026-11-25T02:08:35.469Z","url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=5&start=192&end=193","http":200,"actual":{"dataset_split":"train","unit_id":1,"cycle":192,"sensor_name":"sensor_5","sensor_value":14.62,"source_file":"FD001/train_FD001.txt","source_sha256":"963b5e22825b34d8b21c69e1aeb4af3e647050eb672ee8834ba4b5d91d2de0f8","physical_line_number":192,"data_row_index":191,"source_column_index":10,"original_value":"14.62","reread_matches":true},"chart":{"x":89,"y":124},"match":true}
{"type":"scenario","time":"2026-11-25T02:08:35.764Z","name":"Empty window","before":{"controls":["train","1","5","192","193"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_5 · Cycles 192–193","dots":1,"rows":1,"source":true},"after":{"controls":["train","1","5","193","194"],"status":"empty","message":"No observations in this cycle range.","selection":"Train · Unit 1 · sensor_5 · Cycles 193–194","dots":0,"rows":0,"source":false},"network":[{"url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=5&start=193&end=194","method":"GET","status":200,"mime":"application/json"}]}
{"type":"scenario","time":"2026-11-25T02:08:35.768Z","name":"Reversed window","before":{"controls":["train","1","5","193","194"],"status":"empty","message":"No observations in this cycle range.","selection":"Train · Unit 1 · sensor_5 · Cycles 193–194","dots":0,"rows":0,"source":false},"after":{"controls":["train","1","5","20","10"],"status":"invalid","message":"Invalid range. Start cycle must be less than or equal to end cycle.","selection":"Choose a valid observation window.","dots":0,"rows":0,"source":false},"network":[]}
{"type":"scenario","time":"2026-11-25T02:08:35.772Z","name":"Over 100 cycles","before":{"controls":["train","1","5","20","10"],"status":"invalid","message":"Invalid range. Start cycle must be less than or equal to end cycle.","selection":"Choose a valid observation window.","dots":0,"rows":0,"source":false},"after":{"controls":["train","1","5","1","101"],"status":"invalid","message":"Invalid range. Choose at most 100 inclusive cycles.","selection":"Choose a valid observation window.","dots":0,"rows":0,"source":false},"network":[]}
{"type":"scenario","time":"2026-11-25T02:08:36.162Z","name":"Exactly 100 cycles","before":{"controls":["train","1","5","1","101"],"status":"invalid","message":"Invalid range. Choose at most 100 inclusive cycles.","selection":"Choose a valid observation window.","dots":0,"rows":0,"source":false},"after":{"controls":["train","1","5","1","100"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_5 · Cycles 1–100","dots":100,"rows":100,"source":true},"network":[{"url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=5&start=1&end=100","method":"GET","status":200,"mime":"application/json"}]}
{"type":"scenario","time":"2026-11-25T02:08:36.311Z","name":"Reload page","before":{"controls":["train","1","5","1","100"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_5 · Cycles 1–100","dots":100,"rows":100,"source":true},"after":{"controls":["train","1","7","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_7 · Cycles 1–20","dots":20,"rows":20,"source":true},"network":[{"url":"http://127.0.0.1:8765/","method":"GET","status":200,"mime":"text/html"},{"url":"http://127.0.0.1:8765/style.css","method":"GET","status":200,"mime":"text/css"},{"url":"http://127.0.0.1:8765/ui.js","method":"GET","status":200,"mime":"text/javascript"},{"url":"http://127.0.0.1:8765/api/health","method":"GET","status":200,"mime":"application/json"},{"url":"http://127.0.0.1:8765/api/catalog","method":"GET","status":200,"mime":"application/json"},{"url":"http://127.0.0.1:8765/api/units?split=train","method":"GET","status":200,"mime":"application/json"},{"url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=7&start=1&end=20","method":"GET","status":200,"mime":"application/json"}]}
{"type":"scenario","time":"2026-11-25T02:08:36.451Z","name":"Rapid Sensor 8 to Sensor 9 while earlier request is paused","before":{"controls":["train","1","8","1","20"],"status":"loading","message":"Loading observations…","selection":"Train · Unit 1 · sensor_8 · Cycles 1–20","dots":0,"rows":0,"source":false},"after":{"controls":["train","1","9","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_9 · Cycles 1–20","dots":20,"rows":20,"source":true},"network":[{"url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=9&start=1&end=20","method":"GET","status":200,"mime":"application/json"}]}
{"type":"race","time":"2026-11-25T02:08:36.453Z","earlier":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=8&start=1&end=20","result":"net::ERR_ABORTED","current":"Train · Unit 1 · sensor_9 · Cycles 1–20"}
{"type":"scenario","time":"2026-11-25T02:08:36.513Z","name":"SYNTHETIC isolated 503 injection into live page","before":{"controls":["train","1","9","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_9 · Cycles 1–20","dots":20,"rows":20,"source":true},"after":{"controls":["train","1","9","1","20"],"status":"error","message":"Data unavailable (HTTP 503 · DATA_NOT_READY). SYNTHETIC UAT source fault injection","selection":"Train · Unit 1 · sensor_9 · Cycles 1–20","dots":0,"rows":0,"source":false},"network":[{"url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=9&start=1&end=20","method":"GET","status":503,"mime":"application/json"}]}
{"type":"scenario","time":"2026-11-25T02:08:36.656Z","name":"Recover after 503","before":{"controls":["train","1","9","1","20"],"status":"error","message":"Data unavailable (HTTP 503 · DATA_NOT_READY). SYNTHETIC UAT source fault injection","selection":"Train · Unit 1 · sensor_9 · Cycles 1–20","dots":0,"rows":0,"source":false},"after":{"controls":["train","1","9","1","20"],"status":"ready","message":"Observations loaded.","selection":"Train · Unit 1 · sensor_9 · Cycles 1–20","dots":20,"rows":20,"source":true},"network":[{"url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=9&start=1&end=20","method":"GET","status":200,"mime":"application/json"}]}
{"type":"console","time":"2026-11-25T02:08:36.656Z","errors":[{"kind":"network","text":"Failed to load resource: the server responded with a status of 503 (Service Unavailable)","url":"http://127.0.0.1:8765/api/history?split=train&unit=1&sensor=9&start=1&end=20"}],"uncaughtExceptions":0}
{"type":"result","time":"2026-11-25T02:08:36.656Z","status":"OK"}
{"type":"browser_exit","time":"2026-11-25T02:08:36.970Z","code":0,"signal":null}
```

## Automated regression

`node --check web/ui.js` exited 0 with no output. The full suite passed **64/64** tests: 7 M1, 22 M2 core, 11 M2 evidence, 19 M3 API and 5 M4 UI/static-route tests. Unittest writes case results and summary to stderr. The timestamps and exit indicator are stdout.

```powershell
Get-Date -Format o
python -B -m unittest discover -s tests -v
$code = $LASTEXITCODE
Get-Date -Format o
Write-Output "exit=$code"
exit $code
```

```text
2026-11-25T10:05:34.3242028+08:00
test_basic_display_matches_source_rows (test_m1_profile.TestM1SyntheticProfile.test_basic_display_matches_source_rows) ... ok
test_column_count_names_and_widths_match_source (test_m1_profile.TestM1SyntheticProfile.test_column_count_names_and_widths_match_source) ... ok
test_csv_loading_and_actual_row_count (test_m1_profile.TestM1SyntheticProfile.test_csv_loading_and_actual_row_count) ... ok
test_exact_duplicates_match_independent_count (test_m1_profile.TestM1SyntheticProfile.test_exact_duplicates_match_independent_count) ... ok
test_missing_values_match_independent_count (test_m1_profile.TestM1SyntheticProfile.test_missing_values_match_independent_count) ... ok
test_sensor_trend_source_mapping (test_m1_profile.TestM1SyntheticProfile.test_sensor_trend_source_mapping) ... ok
test_sha256_integrity_uses_actual_bytes (test_m1_profile.TestM1SyntheticProfile.test_sha256_integrity_uses_actual_bytes) ... ok
test_bounded_verification_summary_executes_all_evidence_checks (test_m2_evidence_classification.TestM2EvidenceClassification.test_bounded_verification_summary_executes_all_evidence_checks) ... ok
test_each_sensor_observation_has_raw_row_column_and_token_evidence (test_m2_evidence_classification.TestM2EvidenceClassification.test_each_sensor_observation_has_raw_row_column_and_token_evidence) ... ok
test_public_samples_are_small_deterministic_and_non_diagnostic (test_m2_evidence_classification.TestM2EvidenceClassification.test_public_samples_are_small_deterministic_and_non_diagnostic) ... ok
test_selector_rejects_invalid_or_ambiguous_requests (test_m2_evidence_classification.TestM2EvidenceClassification.test_selector_rejects_invalid_or_ambiguous_requests) ... ok
test_semantic_matrix_prevents_observed_derived_and_prediction_conflation (test_m2_evidence_classification.TestM2EvidenceClassification.test_semantic_matrix_prevents_observed_derived_and_prediction_conflation) ... ok
test_test_rul_label_is_freshly_reread_ground_truth_at_last_cycle (test_m2_evidence_classification.TestM2EvidenceClassification.test_test_rul_label_is_freshly_reread_ground_truth_at_last_cycle) ... ok
test_test_window_not_ending_at_last_cycle_does_not_receive_rul_label (test_m2_evidence_classification.TestM2EvidenceClassification.test_test_window_not_ending_at_last_cycle_does_not_receive_rul_label) ... ok
test_train_and_test_parameterized_windows_use_actual_isolated_cycles (test_m2_evidence_classification.TestM2EvidenceClassification.test_train_and_test_parameterized_windows_use_actual_isolated_cycles) ... ok
test_train_rul_is_explicitly_derived_and_not_an_original_label (test_m2_evidence_classification.TestM2EvidenceClassification.test_train_rul_is_explicitly_derived_and_not_an_original_label) ... ok
test_unknown_records_cover_required_epistemic_limits (test_m2_evidence_classification.TestM2EvidenceClassification.test_unknown_records_cover_required_epistemic_limits) ... ok
test_window_inference_recomputes_exact_arithmetic_without_monotonic_claim (test_m2_evidence_classification.TestM2EvidenceClassification.test_window_inference_recomputes_exact_arithmetic_without_monotonic_claim) ... ok
test_input_directory_outside_project_is_rejected (test_m2_fd001.TestM2PhaseA.test_input_directory_outside_project_is_rejected) ... ok
test_phase_a_gate_is_computed_from_validation_results (test_m2_fd001.TestM2PhaseA.test_phase_a_gate_is_computed_from_validation_results) ... ok
test_raw_reference_rereads_actual_source_positions (test_m2_fd001.TestM2PhaseA.test_raw_reference_rereads_actual_source_positions) ... ok
test_rul_has_one_nonnegative_finite_value_per_row (test_m2_fd001.TestM2PhaseA.test_rul_has_one_nonnegative_finite_value_per_row) ... ok
test_rul_reference_freshly_rereads_source (test_m2_fd001.TestM2PhaseA.test_rul_reference_freshly_rereads_source) ... ok
test_rul_reference_rejects_incorrect_physical_line (test_m2_fd001.TestM2PhaseA.test_rul_reference_rejects_incorrect_physical_line) ... ok
test_rul_reference_rejects_mismatched_value (test_m2_fd001.TestM2PhaseA.test_rul_reference_rejects_mismatched_value) ... ok
test_source_paths_are_project_relative_for_default_and_explicit_inputs (test_m2_fd001.TestM2PhaseA.test_source_paths_are_project_relative_for_default_and_explicit_inputs) ... ok
test_sources_exist_readable_and_hashes_use_actual_bytes (test_m2_fd001.TestM2PhaseA.test_sources_exist_readable_and_hashes_use_actual_bytes) ... ok
test_test_units_map_to_rul_rows_by_verified_order (test_m2_fd001.TestM2PhaseA.test_test_units_map_to_rul_rows_by_verified_order) ... ok
test_train_and_test_have_26_mapped_columns (test_m2_fd001.TestM2PhaseA.test_train_and_test_have_26_mapped_columns) ... ok
test_unit_cycle_integrity (test_m2_fd001.TestM2PhaseA.test_unit_cycle_integrity) ... ok
test_contract_json_and_markdown_are_consistent (test_m2_fd001.TestM2PhaseB.test_contract_json_and_markdown_are_consistent) ... ok
test_contract_rejects_invalid_identity_structure_or_validation_status (test_m2_fd001.TestM2PhaseB.test_contract_rejects_invalid_identity_structure_or_validation_status) ... ok
test_contract_rejects_unaccepted_or_missing_acceptance_state (test_m2_fd001.TestM2PhaseB.test_contract_rejects_unaccepted_or_missing_acceptance_state) ... ok
test_interface_error_behavior (test_m2_fd001.TestM2PhaseB.test_interface_error_behavior) ... ok
test_phase_b_gate_uses_phase_a_and_contract_validation (test_m2_fd001.TestM2PhaseB.test_phase_b_gate_uses_phase_a_and_contract_validation) ... ok
test_quality_statistics_recompute_from_actual_values (test_m2_fd001.TestM2PhaseB.test_quality_statistics_recompute_from_actual_values) ... ok
test_repository_source_paths_match_for_default_and_explicit_inputs (test_m2_fd001.TestM2PhaseB.test_repository_source_paths_match_for_default_and_explicit_inputs) ... ok
test_rul_label_mapping_matches_local_rul_row (test_m2_fd001.TestM2PhaseB.test_rul_label_mapping_matches_local_rul_row) ... ok
test_sensor_trend_is_sorted_and_source_traceable (test_m2_fd001.TestM2PhaseB.test_sensor_trend_is_sorted_and_source_traceable) ... ok
test_train_test_and_unit_isolation (test_m2_fd001.TestM2PhaseB.test_train_test_and_unit_isolation) ... ok
test_catalog_fields_and_safe_summary (test_m3_api.TestM3API.test_catalog_fields_and_safe_summary) ... ok
test_cycle_boundary_singleton_and_empty_windows (test_m3_api.TestM3API.test_cycle_boundary_singleton_and_empty_windows) ... ok
test_failure_to_load_repository_fails_all_routes_closed (test_m3_api.TestM3API.test_failure_to_load_repository_fails_all_routes_closed) ... ok
test_hash_mismatch_fails_all_routes_closed (test_m3_api.TestM3API.test_hash_mismatch_fails_all_routes_closed) ... ok
test_health_ready_and_all_sources_verified (test_m3_api.TestM3API.test_health_ready_and_all_sources_verified) ... ok
test_invalid_and_unknown_units (test_m3_api.TestM3API.test_invalid_and_unknown_units) ... ok
test_invalid_sensor_boundaries (test_m3_api.TestM3API.test_invalid_sensor_boundaries) ... ok
test_invalid_source_path_and_failed_reread_fail_closed (test_m3_api.TestM3API.test_invalid_source_path_and_failed_reread_fail_closed) ... ok
test_invalid_split (test_m3_api.TestM3API.test_invalid_split) ... ok
test_json_null_policy (test_m3_api.TestM3API.test_json_null_policy) ... ok
test_loopback_only_and_rejects_external_host (test_m3_api.TestM3API.test_loopback_only_and_rejects_external_host) ... ok
test_missing_extra_duplicate_and_malformed_parameters (test_m3_api.TestM3API.test_missing_extra_duplicate_and_malformed_parameters) ... ok
test_missing_source_at_startup_and_during_service (test_m3_api.TestM3API.test_missing_source_at_startup_and_during_service) ... ok
test_required_history_and_full_provenance_against_raw_file (test_m3_api.TestM3API.test_required_history_and_full_provenance_against_raw_file) ... ok
test_reversed_zero_and_excessive_cycle_ranges (test_m3_api.TestM3API.test_reversed_zero_and_excessive_cycle_ranges) ... ok
test_split_and_unit_isolation_against_raw_files (test_m3_api.TestM3API.test_split_and_unit_isolation_against_raw_files) ... ok
test_unaccepted_and_tampered_contract_fails_all_routes_closed (test_m3_api.TestM3API.test_unaccepted_and_tampered_contract_fails_all_routes_closed) ... ok
test_units_sorted_and_scoped_to_verified_source (test_m3_api.TestM3API.test_units_sorted_and_scoped_to_verified_source) ... ok
test_unsupported_methods_and_unknown_endpoint (test_m3_api.TestM3API.test_unsupported_methods_and_unknown_endpoint) ... ok
test_page_has_same_origin_assets_and_labels (test_m4_ui.TestM4UI.test_page_has_same_origin_assets_and_labels) ... ok
test_static_allowlist_rejects_raw_download_paths_and_queries (test_m4_ui.TestM4UI.test_static_allowlist_rejects_raw_download_paths_and_queries) ... ok
test_static_assets_exact_media_types_and_safety_headers (test_m4_ui.TestM4UI.test_static_assets_exact_media_types_and_safety_headers) ... ok
test_static_routes_preserve_http_method_and_host_restrictions (test_m4_ui.TestM4UI.test_static_routes_preserve_http_method_and_host_restrictions) ... ok
test_ui_shell_can_report_api_unavailable (test_m4_ui.TestM4UI.test_ui_shell_can_report_api_unavailable) ... ok

----------------------------------------------------------------------
Ran 64 tests in 25.433s

OK
2026-11-25T10:06:00.3250285+08:00
exit=0
```

## Git staging and disclosure checks

Scope covers three UI assets, one M4 integration-test file and four M4 evidence artifacts, plus minimal edits to `.gitignore`, `WORK_ITEM.md`, `web/api.py` and `web/README.md`. The server uses a fixed static allowlist and a same-origin Content Security Policy. Integration tests cover unauthorised files, traversal, unsupported methods and foreign hosts. The Worker visually checked the screenshot for browser-profile information, absolute paths and full dataset output. The final commit and independent remote scope verification are part of the Worker return.

Staging checks ran `git --no-optional-locks status --short --branch --untracked-files=all`, `git diff --cached --check`, `git diff --cached --name-only`, `git ls-files`, and `git check-ignore`. The staged names were compared with the twelve-file allowlist. The staged text was also checked for private paths, credentials and complete original rows. Selected stdout below. The check exited 0.

```text
## main...origin/main
M  .gitignore
M  WORK_ITEM.md
A  reports/M4_BROWSER_SCREENSHOT.png
A  reports/M4_BROWSER_UAT.md
A  reports/M4_UI_API_SOURCE_CROSSCHECK.md
A  reports/M4_UI_EXECUTION_EVIDENCE.md
A  tests/test_m4_ui.py
M  web/README.md
M  web/api.py
A  web/index.html
A  web/style.css
A  web/ui.js
cached_diff_check_exit=0
FD001/train_FD001.txt
FD001/test_FD001.txt
FD001/RUL_FD001.txt
synthetic_sensor.csv
scope_and_protected_files_check_exit=0
staged_disclosure_check_exit=0
```
