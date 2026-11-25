'use strict';

const elements = Object.fromEntries([
  'service', 'filters', 'split', 'unit', 'sensor', 'start', 'end', 'load',
  'range-limit', 'feedback', 'selection', 'count', 'chart', 'point-label',
  'reread-badge', 'source', 'rows',
  'prompt-preview', 'prompt-scope', 'prompt-status', 'copy-prompt',
].map(id => [id, document.getElementById(id)]));

const svgNS = 'http://www.w3.org/2000/svg';
const formatTick = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8, useGrouping: false });
let catalog;
let health;
let unitSource;
let unitsRequest;
let historyRequest;
let historyTimer;
let plotted = [];
let selectedIndex = 0;
let evidenceWindow;
let readyPrompt;
let copyPending = false;

const evidenceVersion = '1.0.1';
const numericToken = /^[+-]?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$/;
// Windows normalizes native clipboard line breaks to CRLF. Keep the preview DOM identical.
const windowsClipboard = /^Win/i.test(navigator.userAgentData?.platform || navigator.platform || '');

function requireEvidence(condition) {
  if (!condition) throw new Error('FD001 evidence does not match the verified selection.');
}

function validateEvidence({ selection, catalog, health, unitSource, history, focusCycle }) {
  const { split, unit, sensor, start, end } = selection;
  const positive = value => Number.isSafeInteger(value) && value > 0;
  requireEvidence(['train', 'test'].includes(split) && positive(unit) && positive(sensor) && sensor <= 21);
  requireEvidence(positive(start) && positive(end) && end >= start && end - start < 100);
  requireEvidence(health?.readiness === 'ready' && health.validation_status === 'PASS'
    && health.contract_version === evidenceVersion && health.source_type === 'TRUSTED_LOCAL_FILES'
    && ['train', 'test', 'rul'].every(key => health.sources?.[key]?.hash_verified === true));
  requireEvidence(catalog?.dataset === 'NASA_CMAPSS_FD001' && catalog.source_type === health.source_type
    && catalog.contract_version === health.contract_version && catalog.splits?.includes(split)
    && catalog.max_history_cycle_span === 100);

  const sensorName = `sensor_${sensor}`;
  const column = sensor + 5;
  const mapping = catalog.sensors?.find(entry => entry.index === sensor);
  requireEvidence(mapping?.name === sensorName && mapping.source_column_index === column);
  const quality = catalog.summary?.[split];
  requireEvidence(positive(quality?.rows) && quality.columns === 26 && positive(quality.unit_count)
    && Number.isSafeInteger(quality.missing_total) && quality.missing_total >= 0
    && quality.missing_total <= quality.rows * quality.columns);

  const file = `FD001/${split}_FD001.txt`;
  const hash = unitSource?.source_sha256;
  requireEvidence(unitSource?.dataset_split === split && unitSource.source_file === file
    && typeof hash === 'string' && /^[a-f0-9]{64}$/.test(hash)
    && Array.isArray(unitSource.unit_ids) && unitSource.unit_ids.includes(unit));
  const points = history?.points;
  requireEvidence(history?.dataset_split === split && history.unit_id === unit && history.sensor_name === sensorName
    && history.start === start && history.end === end && Array.isArray(points)
    && points.length > 0 && points.length <= end - start + 1 && history.count === points.length);

  let previousCycle = 0;
  let previousLine = 0;
  let previousRow = -1;
  for (const point of points) {
    const { cycle, value, raw_reference: ref } = point;
    requireEvidence(positive(cycle) && cycle >= start && cycle <= end && cycle > previousCycle
      && Number.isFinite(value) && point.sensor_name === sensorName);
    requireEvidence(ref?.dataset_split === split && ref.unit_id === unit && ref.cycle === cycle
      && ref.column_name === sensorName && ref.source_column_index === column
      && ref.source_file === file && ref.source_sha256 === hash && ref.reread_matches === true);
    requireEvidence(Number.isSafeInteger(ref.data_row_index) && ref.data_row_index > previousRow
      && ref.data_row_index < quality.rows && ref.data_row_index_base === 0
      && positive(ref.physical_line_number) && ref.physical_line_number > previousLine
      && ref.physical_line_number > ref.data_row_index);
    requireEvidence(typeof ref.original_value === 'string' && numericToken.test(ref.original_value)
      && Number(ref.original_value) === value && ref.reread_value === ref.original_value);
    previousCycle = cycle;
    previousLine = ref.physical_line_number;
    previousRow = ref.data_row_index;
  }
  const focus = points.find(point => point.cycle === focusCycle);
  requireEvidence(focusCycle === undefined || focus);
  return { sensorName, column, quality, file, hash, points, focus };
}

function formatEvidencePrompt(context) {
  const { split, unit, sensor, start, end } = context.selection;
  const { sensorName, column, quality, file, hash, points, focus } = validateEvidence(context);
  const row = ({ cycle, value, raw_reference: ref }) => [cycle, value, ref.original_value,
    ref.physical_line_number, ref.data_row_index, ref.source_column_index, ref.reread_matches].join(' | ');
  const values = points.map(point => point.value);
  const first = points[0];
  const last = points.at(-1);
  const mean = values.reduce((sum, value) => sum + value, 0) / points.length;
  const delta = last.value - first.value;
  requireEvidence(Number.isFinite(mean) && Number.isFinite(delta));
  const describe = value => Number(value.toPrecision(12));

  return [
    'DATA SOURCE',
    'Dataset: NASA C-MAPSS FD001',
    `Contract: FD001 Data Contract v${evidenceVersion} (accepted)`,
    `Selection: ${splitLabel(split)} (${split}) | Engine Unit ${unit} | ${sensorName} | requested cycles ${start}-${end} inclusive`,
    `Source File: ${file}`,
    `Source SHA-256: ${hash}`,
    'Verification: M3 verified the source hashes; all listed raw references match the selected window and reread token.',
    '',
    'FIELD DEFINITIONS',
    'Original format: whitespace-delimited TXT.',
    'Column 1: Engine Unit; Column 2: Cycle; Columns 3-5: Operational Settings 1-3; Columns 6-26: Sensors 1-21.',
    `Sensor N uses 1-based source column N+5. Sensor ${sensor} (${sensorName}) = Column ${column}.`,
    'Physical Line Number is 1-based; Data Row Index is 0-based among nonblank rows. These are source positions, independent of Cycle.',
    '',
    'SAMPLE SCOPE',
    `Requested Cycle Start / End: ${start}-${end} inclusive`,
    `Actual Observed Cycle Range: ${first.cycle}-${last.cycle}`,
    `Actual Observation Count: ${points.length}`,
    'Every observed Cycle and value is listed in RAW PROVENANCE. An unobserved Cycle has no row; it is not a null measurement.',
    '',
    'RAW PROVENANCE',
    'All rows refer to the Source File and SHA-256 above.',
    'Cycle | Numeric Value | Original Token | Physical Line Number | Data Row Index | Source Column Index | Reread Matches',
    ...points.map(row),
    ...(focus ? ['', 'FOCUSED OBSERVATION', `Selected row (the complete window is above): ${row(focus)}`] : []),
    '',
    'DATA QUALITY',
    'Split-level Verified Quality (from /api/catalog for the entire selected split)',
    `Row Count: ${quality.rows} | Column Count: ${quality.columns} | Unit Count: ${quality.unit_count} | Missing Value Count: ${quality.missing_total}`,
    'Selected-window Descriptive Statistics (only the values in RAW PROVENANCE)',
    `Observed Count: ${points.length} | Minimum: ${Math.min(...values)} | Maximum: ${Math.max(...values)}`,
    `Arithmetic Mean: ${describe(mean)} (sum of observed values divided by ${points.length} actual observations)`,
    points.length > 1
      ? `Endpoint Delta: ${describe(delta)} (last, Cycle ${last.cycle}: ${last.value} minus first, Cycle ${first.cycle}: ${first.value})`
      : 'Endpoint Delta: not evaluated (one observation; no distinct endpoints).',
    'Derived decimals are displayed to at most 12 significant digits. Physical sensor units are undocumented here.',
    '',
    'EVIDENCE CLASSIFICATION',
    'KNOWN / OBSERVATION',
    'The recorded Cycle, Unit, sensor, numeric reading, original token, source indexes and SHA-256 are listed above.',
    'INFERENCE / DESCRIPTIVE ONLY',
    'Min/max are the smallest/largest listed values. Mean and endpoint delta follow the formulas above. These calculations establish no monotonic change, degradation, health standard, diagnostic threshold, or failure indicator.',
    'UNKNOWN / NOT EVIDENCED',
    'Treat each as UNKNOWN / INSUFFICIENT EVIDENCE: Fault Occurrence, Fault Type, Fault Severity, Fault Occurrence Time, Health Status, Failure Time, Root Cause, Diagnostic Threshold, Healthy Baseline, Failure Probability, Model-predicted RUL, and Unsupported Physical Sensor Units.',
    '',
    'TRAIN / TEST / RUL SEMANTICS',
    'Train follows the run-to-failure recording convention; its 26 original columns contain neither per-Cycle RUL ground truth nor a fault-class field.',
    'Test is a partial trajectory. The last observed Test Cycle is not the failure Cycle.',
    'RUL_FD001.txt contains separate ground-truth Test labels at the last observed Test Cycle; these labels differ from model predictions. /api/history supplies no RUL labels.',
    'The selected window supplies no Train derived RUL, Test RUL, or predicted RUL. Do not calculate or report them from these observations.',
    '',
    'INSTRUCTIONS TO EXTERNAL AI',
    '1. Use only the supplied verified observations. Cite any claim with its original source provenance.',
    '2. Separate KNOWN / OBSERVATION, INFERENCE / DESCRIPTIVE ONLY, and UNKNOWN / INSUFFICIENT EVIDENCE.',
    '3. Preserve source file, SHA-256, original token and index conventions.',
    '4. Never invent observations or sensor units for missing or undocumented data.',
    '5. Never infer fault occurrence, type, severity, failure timing, root cause, or health status without independent evidence.',
    '6. Never invent a diagnostic threshold or healthy baseline.',
    '7. Never infer RUL, time to failure, or failure probability.',
    '8. Keep derived RUL, ground-truth labels, and model predictions distinct.',
    '9. State UNKNOWN / INSUFFICIENT EVIDENCE whenever verification is unavailable.',
  ].join('\n');
}

function currentSelection() {
  const { split, unit, sensor, start, end } = elements;
  return { split: split.value, unit: Number(unit.value), sensor: Number(sensor.value),
    start: Number(start.value), end: Number(end.value) };
}

function selectionMatches(selection) {
  const current = currentSelection();
  return Object.keys(current).every(key => selection[key] === current[key]);
}

function promptStatus(state, message) {
  elements['prompt-status'].dataset.state = state;
  elements['prompt-status'].textContent = message;
}

function clearPrompt(state = 'loading', message = 'Waiting for verified observations…') {
  readyPrompt = undefined;
  elements['copy-prompt'].disabled = true;
  elements['prompt-preview'].textContent = '';
  elements['prompt-scope'].textContent = 'Waiting for a verified observation window';
  promptStatus(state, message);
}

function updatePrompt(focusCycle) {
  clearPrompt();
  if (!evidenceWindow || !selectionMatches(evidenceWindow.selection)) return;
  const { selection, history } = evidenceWindow;
  try {
    const formatted = formatEvidencePrompt({ ...evidenceWindow, focusCycle });
    const text = windowsClipboard ? formatted.replace(/\n/g, '\r\n') : formatted;
    readyPrompt = { text, selection };
    const preview = elements['prompt-preview'];
    preview.textContent = text;
    preview.scrollTop = 0;
    const count = `${history.count} ${history.count === 1 ? 'observation' : 'observations'}`;
    const focus = focusCycle === undefined ? '' : ` · Focus Cycle ${focusCycle}`;
    elements['prompt-scope'].textContent = `${splitLabel(selection.split)} · Unit ${selection.unit} · ${history.sensor_name} · Cycles ${selection.start}–${selection.end} · ${count}${focus}`;
    elements['copy-prompt'].disabled = copyPending;
    promptStatus('valid', 'Verified window ready. Copy is local and requires your action.');
  } catch {
    clearPrompt('error', 'Prompt unavailable. The API evidence did not match the verified selection.');
  }
}

async function copyPrompt() {
  const snapshot = readyPrompt;
  if (copyPending || !snapshot || elements['copy-prompt'].disabled) return;
  if (!selectionMatches(snapshot.selection) || elements['prompt-preview'].textContent !== snapshot.text) {
    clearPrompt('error', 'Prompt unavailable. Reload the observation window.');
    return;
  }
  copyPending = true;
  elements['copy-prompt'].disabled = true;
  promptStatus('copying', 'Copying prompt…');
  try {
    await navigator.clipboard.writeText(snapshot.text);
    if (readyPrompt === snapshot) promptStatus('copied', 'Copied to clipboard.');
  } catch {
    if (readyPrompt === snapshot) promptStatus('copy-failed', 'Copy failed. Select and copy the preview manually.');
  } finally {
    copyPending = false;
    if (readyPrompt && !selectionMatches(readyPrompt.selection)) clearPrompt();
    elements['copy-prompt'].disabled = !readyPrompt;
  }
}

async function getData(path, signal) {
  const response = await fetch(path, { signal, cache: 'no-store' });
  const body = await response.json();
  if (!response.ok || body.status !== 'ok') {
    const error = new Error(body.error?.message || 'The API rejected the request.');
    error.status = response.status;
    error.code = body.error?.code;
    throw error;
  }
  return body.data;
}

function service(text, state) {
  elements.service.textContent = text;
  elements.service.dataset.state = state;
}

function feedback(text, state) {
  elements.feedback.textContent = text;
  elements.feedback.dataset.state = state;
  if (state === 'loading') clearPrompt();
  if (state === 'empty') clearPrompt('empty', 'No observations to include in a prompt.');
  if (state === 'invalid') clearPrompt('invalid', 'Choose a valid cycle range to generate a prompt.');
  if (state === 'error') clearPrompt('error', 'Prompt unavailable. Check the local API status.');
}

function apiError(error) {
  const status = error.status ? ` (HTTP ${error.status}${error.code ? ` · ${error.code}` : ''})` : '';
  if (error.status === 503) {
    service('Local data unavailable', 'error');
    feedback(`Data unavailable${status}. ${error.message}`, 'error');
  } else if (error.status) {
    feedback(`API error${status}. ${error.message}`, 'error');
  } else {
    service('Local API unreachable', 'error');
    feedback('Could not read the local API. Check the server, then retry.', 'error');
  }
}

function fillSelect(select, options) {
  select.replaceChildren(...options.map(([value, label]) => new Option(label, value)));
}

function splitLabel(split) {
  return split === 'train' ? 'Train' : 'Test';
}

function clearResults() {
  plotted = [];
  evidenceWindow = undefined;
  clearPrompt();
  selectedIndex = 0;
  elements.chart.replaceChildren();
  elements.rows.replaceChildren();
  elements.source.replaceChildren();
  elements['point-label'].textContent = 'No point selected';
  elements['reread-badge'].hidden = true;
  elements.count.hidden = true;
}

function cancelHistory() {
  clearTimeout(historyTimer);
  historyRequest?.abort();
  historyRequest = undefined;
  clearResults();
}

function cycleWindow() {
  const { start, end } = elements;
  const positive = /^[0-9]{1,10}$/;
  const values = [start.value, end.value];
  const valid = values.map(value => positive.test(value) && Number(value) > 0);
  start.setAttribute('aria-invalid', String(!valid[0]));
  end.setAttribute('aria-invalid', String(!valid[1]));
  if (!valid.every(Boolean)) return 'Enter positive whole numbers for both cycles.';
  const [first, last] = values.map(Number);
  if (first > last || last - first + 1 > catalog.max_history_cycle_span) {
    start.setAttribute('aria-invalid', 'true');
    end.setAttribute('aria-invalid', 'true');
    return first > last ? 'Start cycle must be less than or equal to end cycle.'
      : `Choose at most ${catalog.max_history_cycle_span} inclusive cycles.`;
  }
  return { start: first, end: last };
}

function scheduleHistory(delay = 0) {
  cancelHistory();
  const window = cycleWindow();
  const { split, unit, sensor } = elements;
  if (typeof window === 'string') {
    elements.selection.textContent = 'Choose a valid observation window.';
    feedback(`Invalid range. ${window}`, 'invalid');
    return;
  }
  if (!unit.value) return;
  const mapped = catalog.sensors.find(entry => String(entry.index) === sensor.value);
  const selection = currentSelection();
  const query = new URLSearchParams(selection);
  elements.selection.textContent = `${splitLabel(split.value)} · Unit ${unit.value} · ${mapped.name} · Cycles ${window.start}–${window.end}`;
  feedback('Loading observations…', 'loading');
  const request = new AbortController();
  historyRequest = request;
  historyTimer = setTimeout(async () => {
    try {
      const data = await getData(`/api/history?${query}`, request.signal);
      if (historyRequest !== request || !selectionMatches(selection)) return;
      service('Local API ready', 'ready');
      feedback(data.count ? 'Observations loaded.' : 'No observations in this cycle range.', data.count ? 'ready' : 'empty');
      elements.count.textContent = `${data.count} ${data.count === 1 ? 'point' : 'points'}`;
      elements.count.hidden = false;
      if (data.count) {
        evidenceWindow = { selection, catalog, health, unitSource, history: data };
        renderResults(data);
      }
    } catch (error) {
      if (historyRequest !== request) return;
      clearResults();
      apiError(error);
    }
  }, delay);
}

async function loadUnits() {
  cancelHistory();
  unitSource = undefined;
  unitsRequest?.abort();
  const request = new AbortController();
  unitsRequest = request;
  const split = elements.split.value;
  fillSelect(elements.unit, []);
  elements.unit.disabled = true;
  elements.load.disabled = true;
  elements.load.textContent = 'Load window';
  elements.selection.textContent = `${splitLabel(split)} · Selecting an engine unit`;
  feedback(`Loading ${splitLabel(split)} engine units…`, 'loading');
  try {
    const data = await getData(`/api/units?${new URLSearchParams({ split })}`, request.signal);
    if (unitsRequest !== request) return;
    unitSource = data;
    fillSelect(elements.unit, data.unit_ids.map(id => [id, `Unit ${id}`]));
    elements.unit.disabled = false;
    elements.load.disabled = false;
    if (data.unit_ids.length) scheduleHistory();
    else feedback('No engine units in this split.', 'empty');
  } catch (error) {
    if (unitsRequest !== request) return;
    apiError(error);
    elements.load.disabled = false;
    elements.load.textContent = 'Retry connection';
  }
}

async function initialize() {
  elements.load.disabled = true;
  service('Checking local API', 'loading');
  feedback('Loading dataset catalog…', 'loading');
  try {
    health = await getData('/api/health');
    catalog = await getData('/api/catalog');
    service('Local API ready', 'ready');
    fillSelect(elements.split, catalog.splits.map(split => [split, splitLabel(split)]));
    fillSelect(elements.sensor, catalog.sensors.map(sensor => [sensor.index, `Sensor ${sensor.index}`]));
    if (catalog.sensors.some(sensor => sensor.index === 7)) elements.sensor.value = '7';
    elements['range-limit'].textContent = `max ${catalog.max_history_cycle_span} inclusive`;
    for (const field of ['split', 'sensor', 'start', 'end']) elements[field].disabled = false;
    await loadUnits();
  } catch (error) {
    apiError(error);
    elements.load.disabled = false;
    elements.load.textContent = 'Retry connection';
  }
}

function svg(tag, attrs, label) {
  const node = document.createElementNS(svgNS, tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  if (label !== undefined) node.textContent = label;
  return node;
}

function renderResults(data) {
  const points = data.points;
  const values = points.map(point => point.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const padding = (max - min) * .12 || Math.max(Math.abs(min) * .005, .01);
  const lower = min - padding;
  const upper = max + padding;
  const box = { left: 89, right: 721, top: 16, bottom: 232 };
  const x = cycle => data.start === data.end ? (box.left + box.right) / 2
    : box.left + (cycle - data.start) / (data.end - data.start) * (box.right - box.left);
  const y = value => box.bottom - (value - lower) / (upper - lower) * (box.bottom - box.top);
  const chart = svg('svg', { viewBox: '0 0 740 276', role: 'group', 'aria-label': `${data.sensor_name} observations by cycle` });

  for (let index = 0; index <= 4; index++) {
    const value = lower + (upper - lower) * index / 4;
    chart.append(svg('line', { x1: box.left, x2: box.right, y1: y(value), y2: y(value), class: 'gridline' }),
      svg('text', { x: box.left - 9, y: y(value) + 4, 'text-anchor': 'end', class: 'axis-label' }, formatTick.format(value)));
  }
  chart.append(svg('path', { d: `M ${box.left} ${box.top} V ${box.bottom} H ${box.right}`, class: 'axis', fill: 'none' }),
    svg('text', { x: 17, y: 125, transform: 'rotate(-90 17 125)', 'text-anchor': 'middle', class: 'axis-title' }, 'Sensor value'),
    svg('text', { x: (box.left + box.right) / 2, y: 272, 'text-anchor': 'middle', class: 'axis-title' }, 'Cycle'));
  const tickCount = Math.min(6, data.end - data.start);
  for (let index = 0; index <= tickCount; index++) {
    const cycle = data.start + Math.round((data.end - data.start) * index / (tickCount || 1));
    chart.append(svg('text', { x: x(cycle), y: box.bottom + 20, 'text-anchor': 'middle', class: 'axis-label' }, formatTick.format(cycle)));
  }

  plotted = points.map((point, index) => {
    const dot = svg('circle', {
      cx: x(point.cycle), cy: y(point.value), r: 4.5, class: 'point', 'data-cycle': point.cycle,
      'data-value': point.value, 'aria-hidden': 'true',
    });
    dot.append(svg('title', {}, `Cycle ${point.cycle} · ${point.value}`));
    dot.addEventListener('click', () => selectPoint(index, true));
    chart.append(dot);
    const row = document.createElement('tr');
    row.dataset.cycle = point.cycle;
    const cycleButton = document.createElement('button');
    cycleButton.type = 'button';
    cycleButton.textContent = point.cycle;
    cycleButton.setAttribute('aria-label', `Inspect Cycle ${point.cycle}`);
    cycleButton.addEventListener('click', () => selectPoint(index, true));
    row.insertCell().append(cycleButton);
    const ref = point.raw_reference;
    for (const value of [point.value, ref.original_value, ref.physical_line_number, ref.data_row_index, ref.source_column_index]) {
      row.insertCell().textContent = value;
    }
    return { point, dot, row, cycleButton };
  });
  elements.rows.replaceChildren(...plotted.map(entry => entry.row));
  elements.chart.replaceChildren(chart);
  selectPoint(0);
}

function selectPoint(index, focused = false) {
  selectedIndex = index;
  for (const [position, entry] of plotted.entries()) {
    const selected = position === selectedIndex;
    entry.dot.classList.toggle('selected', selected);
    entry.dot.setAttribute('r', selected ? 6 : 4.5);
    entry.row.classList.toggle('selected', selected);
    entry.cycleButton.setAttribute('aria-pressed', String(selected));
  }
  const { point } = plotted[selectedIndex];
  const ref = point.raw_reference;
  elements['point-label'].textContent = `Cycle ${ref.cycle} · ${point.sensor_name}`;
  elements['reread-badge'].textContent = ref.reread_matches ? 'Reread matched' : 'Reread mismatch';
  elements['reread-badge'].hidden = false;
  const list = document.createElement('dl');
  const fields = [
    ['Split', 'dataset_split', ref.dataset_split], ['Unit', 'unit_id', ref.unit_id],
    ['Cycle', 'cycle', ref.cycle], ['Sensor', 'sensor_name', point.sensor_name],
    ['Sensor value', 'sensor_value', point.value], ['Original token', 'original_value', ref.original_value],
    ['Physical line (1-based)', 'physical_line_number', ref.physical_line_number],
    ['Data row (0-based)', 'data_row_index', ref.data_row_index],
    ['Source column', 'source_column_index', ref.source_column_index],
    ['Reread matches', 'reread_matches', ref.reread_matches],
    ['Source file', 'source_file', ref.source_file, true], ['SHA-256', 'source_sha256', ref.source_sha256, true],
  ];
  for (const [label, name, value, wide] of fields) {
    const entry = document.createElement('div');
    if (wide) entry.className = 'wide';
    const term = document.createElement('dt');
    const detail = document.createElement('dd');
    term.textContent = label;
    detail.dataset.field = name;
    detail.textContent = value;
    entry.append(term, detail);
    list.append(entry);
  }
  elements.source.replaceChildren(list);
  updatePrompt(focused ? point.cycle : undefined);
}

elements.split.addEventListener('change', loadUnits);
elements['copy-prompt'].addEventListener('click', copyPrompt);
elements['prompt-preview'].addEventListener('keydown', event => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
    event.preventDefault();
    document.getSelection()?.selectAllChildren(elements['prompt-preview']);
  }
});
for (const field of ['unit', 'sensor']) elements[field].addEventListener('change', () => scheduleHistory());
for (const field of ['start', 'end']) elements[field].addEventListener('input', () => scheduleHistory(240));
elements.filters.addEventListener('submit', event => {
  event.preventDefault();
  if (!catalog) initialize();
  else if (!elements.unit.value) loadUnits();
  else scheduleHistory();
});

initialize();
