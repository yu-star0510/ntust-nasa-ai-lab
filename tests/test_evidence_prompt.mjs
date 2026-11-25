import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('../web/ui.js', import.meta.url), 'utf8');

function explorer(clipboard = {}, platform = '') {
  const nodes = new Map();
  const requests = [];
  const element = id => {
    if (!nodes.has(id)) nodes.set(id, { dataset: {}, value: '', disabled: false, addEventListener() {} });
    return nodes.get(id);
  };
  const sandbox = vm.createContext({
    document: { getElementById: element },
    navigator: { clipboard, userAgentData: { platform } },
    fetch(path) {
      requests.push(path);
      return new Promise(() => {});
    },
  });
  vm.runInContext(source, sandbox);
  return { sandbox, element, requests, run: script => vm.runInContext(script, sandbox) };
}

// SYNTHETIC unit-test fixtures. These numbers and hashes are not FD001 observations.
function fixture(split = 'train', sensor = 7, cycles = [11, 13], end = 13) {
  const selection = { split, unit: 2, sensor, start: 11, end };
  const sensorName = `sensor_${sensor}`;
  const column = sensor + 5;
  const file = `FD001/${split}_FD001.txt`;
  const hash = split === 'train' ? 'a'.repeat(64) : 'b'.repeat(64);
  const points = cycles.map((cycle, index) => ({ cycle, value: 4 + index, sensor_name: sensorName,
    raw_reference: { dataset_split: split, unit_id: 2, cycle, column_name: sensorName,
      source_column_index: column, source_file: file, source_sha256: hash,
      original_value: `${4 + index}.00`, reread_value: `${4 + index}.00`, reread_matches: true,
      physical_line_number: 200 + index, data_row_index: 197 + index, data_row_index_base: 0 },
  }));
  return {
    selection,
    health: { readiness: 'ready', validation_status: 'PASS', contract_version: '1.0.1',
      source_type: 'TRUSTED_LOCAL_FILES', sources: Object.fromEntries(['train','test','rul'].map(key => [key, { hash_verified: true }])) },
    catalog: { dataset: 'NASA_CMAPSS_FD001', source_type: 'TRUSTED_LOCAL_FILES', contract_version: '1.0.1',
      splits: ['train', 'test'], sensors: [{ index: sensor, name: sensorName, source_column_index: column }],
      max_history_cycle_span: 100, summary: { train: { rows: 500, columns: 26, unit_count: 10, missing_total: 2 },
        test: { rows: 250, columns: 26, unit_count: 10, missing_total: 0 } } },
    unitSource: { dataset_split: split, unit_ids: [1, 2], source_file: file, source_sha256: hash },
    history: { dataset_split: split, unit_id: 2, sensor_name: sensorName, start: 11, end, count: points.length, points },
  };
}

function bind(app, context, focus) {
  app.sandbox.context = context;
  app.sandbox.focus = focus;
  for (const [key, value] of Object.entries(context.selection)) app.element(key).value = String(value);
  app.run('evidenceWindow = context; updatePrompt(focus)');
  return app.element('prompt-preview').textContent;
}

test('formats dynamic scope, classifications, source and RUL semantics', () => {
  const app = explorer();
  const train = bind(app, fixture());
  for (const required of ['DATA SOURCE','FIELD DEFINITIONS','RAW PROVENANCE','SAMPLE SCOPE','DATA QUALITY',
    'KNOWN / OBSERVATION','INFERENCE / DESCRIPTIVE ONLY','UNKNOWN / NOT EVIDENCED','UNKNOWN / INSUFFICIENT EVIDENCE',
    'Fault Occurrence','Fault Type','Fault Severity','Fault Occurrence Time','Health Status','Failure Time','Root Cause',
    'Diagnostic Threshold','Healthy Baseline','Failure Probability','Model-predicted RUL','Unsupported Physical Sensor Units',
    'INSTRUCTIONS TO EXTERNAL AI','run-to-failure','partial trajectory','ground-truth Test labels','/api/history supplies no RUL labels',
    'whitespace-delimited TXT','Sensor 7 (sensor_7) = Column 12','Source File: FD001/train_FD001.txt']) {
    assert.ok(train.includes(required), required);
  }
  const testPrompt = bind(app, fixture('test', 5));
  assert.match(testPrompt, /Test \(test\) \| Engine Unit 2 \| sensor_5/);
  assert.match(testPrompt, /Sensor 5 \(sensor_5\) = Column 10/);
  assert.match(testPrompt, /Source File: FD001\/test_FD001.txt/);
  assert.match(testPrompt, /Source SHA-256: b{64}/);
});

test('preserves all 100 actual observations and keeps focus distinct', () => {
  const app = explorer();
  const context = fixture('train', 7, Array.from({ length: 100 }, (_, index) => 11 + index), 110);
  const prompt = bind(app, context, 50);
  const lines = prompt.split('\n').filter(line => /^[0-9]+ \| /.test(line));
  assert.equal(lines.length, 100);
  assert.deepEqual(lines.map(line => Number(line.split(' | ')[0])), context.history.points.map(point => point.cycle));
  assert.match(prompt, /FOCUSED OBSERVATION\nSelected row \(the complete window is above\): 50 \| 43 \| 43.00/);
});

test('distinguishes gaps, split quality and descriptive statistics', () => {
  const app = explorer();
  const prompt = bind(app, fixture());
  assert.match(prompt, /Row Count: 500 \| Column Count: 26 \| Unit Count: 10 \| Missing Value Count: 2/);
  assert.match(prompt, /Observed Count: 2 \| Minimum: 4 \| Maximum: 5/);
  assert.match(prompt, /Arithmetic Mean: 4\.5 \(sum of observed values divided by 2 actual observations\)/);
  assert.match(prompt, /Endpoint Delta: 1 \(last, Cycle 13: 5 minus first, Cycle 11: 4\)/);
  assert.match(prompt, /11 \| 4 \| 4\.00 \| 200 \| 197 \| 12 \| true/);
  assert.doesNotMatch(prompt, /^12 \| /m);
  assert.match(prompt, /unobserved Cycle has no row/);
});

test('does not report a singleton delta as a trend', () => {
  const prompt = bind(explorer(), fixture('train', 7, [11], 11));
  assert.match(prompt, /Actual Observation Count: 1/);
  assert.match(prompt, /Arithmetic Mean: 4 \(sum of observed values divided by 1 actual observations\)/);
  assert.match(prompt, /Endpoint Delta: not evaluated/);
  assert.doesNotMatch(prompt, /Endpoint Delta: 0/);
});

test('rejects incompatible scope, malformed raw provenance and unverified API state', () => {
  const app = explorer();
  const edits = [
    f => { f.health.sources.rul.hash_verified = false; },
    f => { f.catalog.contract_version = '0.0.0'; },
    f => { f.catalog.sensors[0].source_column_index = 10; },
    f => { f.catalog.summary.train.missing_total = -1; },
    f => { f.unitSource.dataset_split = 'test'; },
    f => { f.history.unit_id = 1; },
    f => { f.history.start = 1; },
    f => { f.history.count = 1; },
    f => { f.history.points.reverse(); },
    f => { f.history.points[0].value = null; },
    f => { f.history.points[0].raw_reference.original_value = ''; },
    f => { f.history.points[0].raw_reference.source_file = '../train_FD001.txt'; },
    f => { f.history.points[0].raw_reference.source_sha256 = 'c'.repeat(64); },
    f => { f.history.points[0].raw_reference.reread_matches = false; },
    f => { f.history.points[0].raw_reference.data_row_index_base = 1; },
    f => { f.history.points[0].raw_reference.physical_line_number = 196; },
  ];
  for (const edit of edits) {
    const context = fixture();
    edit(context);
    assert.equal(bind(app, context), '');
    assert.equal(app.element('copy-prompt').disabled, true);
    assert.equal(app.element('prompt-status').dataset.state, 'error');
  }
});

test('empty, over-limit, invalid and stale windows cannot be copied', async () => {
  const calls = [];
  const app = explorer({ writeText: text => calls.push(text) });
  for (const context of [fixture('train', 7, []), fixture('train', 7, [11], 10), fixture('train', 7, [11], 111)]) {
    assert.equal(bind(app, context), '');
  }
  assert.ok(bind(app, fixture()));
  app.element('unit').value = '1';
  await app.run('copyPrompt()');
  assert.equal(app.element('prompt-preview').textContent, '');
  assert.deepEqual(calls, []);
});

test('503 and invalid feedback remove preview and disable copying', () => {
  const app = explorer();
  assert.ok(bind(app, fixture()));
  app.run("apiError({status:503,code:'DATA_NOT_READY',message:'SYNTHETIC unavailable'})");
  assert.equal(app.element('prompt-status').dataset.state, 'error');
  assert.equal(app.element('prompt-preview').textContent, '');
  assert.ok(app.element('copy-prompt').disabled);
  app.run("feedback('invalid window', 'invalid')");
  assert.equal(app.element('prompt-status').dataset.state, 'invalid');
});

test('copies the exact preview only on request with no network or persistence', async () => {
  const calls = [];
  const app = explorer({ async writeText(text) { calls.push(text); } });
  const prompt = bind(app, fixture());
  assert.deepEqual(calls, []);
  await app.run('copyPrompt()');
  assert.deepEqual(calls, [prompt]);
  assert.equal(app.element('prompt-status').dataset.state, 'copied');
  assert.deepEqual(app.requests, ['/api/health']);
  assert.doesNotMatch(source, /\b(?:localStorage|sessionStorage|indexedDB|sendBeacon|XMLHttpRequest)\b/);
});

test('denied and missing clipboard APIs report failure without changing the preview', async () => {
  for (const clipboard of [{ async writeText() { throw new Error('SYNTHETIC denial'); } }, undefined]) {
    const app = explorer(clipboard);
    const prompt = bind(app, fixture());
    await app.run('copyPrompt()');
    assert.equal(app.element('prompt-status').dataset.state, 'copy-failed');
    assert.equal(app.element('prompt-preview').textContent, prompt);
  }
});

test('a late clipboard completion cannot mark a different focused window copied', async () => {
  let finish;
  const app = explorer({ writeText: () => new Promise(resolve => { finish = resolve; }) });
  const context = fixture();
  const original = bind(app, context);
  const writing = app.run('copyPrompt()');
  assert.equal(app.element('prompt-status').dataset.state, 'copying');
  const updated = bind(app, context, 13);
  assert.notEqual(updated, original);
  assert.ok(app.element('copy-prompt').disabled);
  finish();
  await writing;
  assert.equal(app.element('prompt-status').dataset.state, 'valid');
  assert.equal(app.element('copy-prompt').disabled, false);
});

test('Windows preview and clipboard input use identical CRLF line endings', async () => {
  let written;
  const app = explorer({ async writeText(text) { written = text; } }, 'Windows');
  const prompt = bind(app, fixture());
  assert.ok(prompt.includes('\r\n'));
  assert.doesNotMatch(prompt, /(?<!\r)\n/);
  await app.run('copyPrompt()');
  assert.equal(written, prompt);
  assert.equal(app.element('prompt-status').dataset.state, 'copied');
});
