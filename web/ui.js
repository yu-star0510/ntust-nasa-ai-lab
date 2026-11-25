'use strict';

const elements = Object.fromEntries([
  'service', 'filters', 'split', 'unit', 'sensor', 'start', 'end', 'load',
  'range-limit', 'feedback', 'selection', 'count', 'chart', 'point-label',
  'reread-badge', 'source', 'rows',
].map(id => [id, document.getElementById(id)]));

const svgNS = 'http://www.w3.org/2000/svg';
const formatTick = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 8, useGrouping: false });
let catalog;
let unitsRequest;
let historyRequest;
let historyTimer;
let plotted = [];
let selectedIndex = 0;

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
  const query = new URLSearchParams({ split: split.value, unit: unit.value, sensor: sensor.value, ...window });
  elements.selection.textContent = `${splitLabel(split.value)} · Unit ${unit.value} · ${mapped.name} · Cycles ${window.start}–${window.end}`;
  feedback('Loading observations…', 'loading');
  const request = new AbortController();
  historyRequest = request;
  historyTimer = setTimeout(async () => {
    try {
      const data = await getData(`/api/history?${query}`, request.signal);
      if (historyRequest !== request) return;
      service('Local API ready', 'ready');
      feedback(data.count ? 'Observations loaded.' : 'No observations in this cycle range.', data.count ? 'ready' : 'empty');
      elements.count.textContent = `${data.count} ${data.count === 1 ? 'point' : 'points'}`;
      elements.count.hidden = false;
      if (data.count) renderResults(data);
    } catch (error) {
      if (historyRequest !== request) return;
      clearResults();
      apiError(error);
    }
  }, delay);
}

async function loadUnits() {
  cancelHistory();
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
    await getData('/api/health');
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
    dot.addEventListener('click', () => selectPoint(index));
    chart.append(dot);
    const row = document.createElement('tr');
    row.dataset.cycle = point.cycle;
    const cycleButton = document.createElement('button');
    cycleButton.type = 'button';
    cycleButton.textContent = point.cycle;
    cycleButton.setAttribute('aria-label', `Inspect Cycle ${point.cycle}`);
    cycleButton.addEventListener('click', () => selectPoint(index));
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

function selectPoint(index) {
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
}

elements.split.addEventListener('change', loadUnits);
for (const field of ['unit', 'sensor']) elements[field].addEventListener('change', () => scheduleHistory());
for (const field of ['start', 'end']) elements[field].addEventListener('input', () => scheduleHistory(240));
elements.filters.addEventListener('submit', event => {
  event.preventDefault();
  if (!catalog) initialize();
  else if (!elements.unit.value) loadUnits();
  else scheduleHistory();
});

initialize();
