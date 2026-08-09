import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { records, routeStageOrder } from '../app/data.js';
import {
  canActOnRecord,
  createAppState,
  routeForRecord,
  selectSite,
  setFilter,
  setSearch,
  simulateAction,
  visibleRecords
} from '../app/state.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const defaultState = createAppState();
assert.equal(defaultState.scopeId, 'central');
assert.equal(defaultState.selectedSiteId, 'hq');
assert.deepEqual(Object.values(records).map((record) => record.work), ['WO-1048', 'CA-221', 'VR-312', 'DEC-118']);
assert.deepEqual(records.hvac.route.map((stage) => stage.key), routeStageOrder);

const warehouseState = selectSite(defaultState, 'warehouse');
assert.equal(warehouseState.scopeId, 'central');
assert.equal(warehouseState.selectedSiteId, 'warehouse');
assert.equal(visibleRecords(warehouseState).length, 4);
assert.equal(canActOnRecord(warehouseState, records.hvac), false);
assert.equal(simulateAction(warehouseState, 'hvac'), warehouseState);

const dcState = selectSite(defaultState, 'dc');
assert.equal(dcState.scopeId, 'central');
assert.equal(dcState.selectedSiteId, 'dc');
assert.equal(visibleRecords(dcState).length, 4);
assert.equal(canActOnRecord(dcState, records.decision), false);

const operationsState = selectSite(defaultState, 'ops');
assert.equal(operationsState.scopeId, 'operations');
assert.equal(operationsState.selectedSiteId, 'ops');
assert.equal(visibleRecords(operationsState)[0].id, 'leak');
assert.equal(canActOnRecord(operationsState, records.leak), true);

const criticalState = setFilter(defaultState, 'critical');
assert.deepEqual(visibleRecords(criticalState).map((record) => record.id), ['hvac']);
const searchState = setSearch(defaultState, 'VR-312');
assert.deepEqual(visibleRecords(searchState).map((record) => record.id), ['calibration']);

const simulated = simulateAction(defaultState, 'hvac');
assert.notEqual(simulated, defaultState);
assert.ok(simulated.simulatedRecordIds.includes('hvac'));
const simulatedRoute = routeForRecord(simulated, 'hvac');
assert.equal(simulatedRoute.find((stage) => stage.key === 'action').state, 'done');
assert.equal(simulatedRoute.find((stage) => stage.key === 'outcome').state, 'pending');

for (const relativePath of ['app/index.html', 'app/app.js', 'app/render.js', 'app/icons.js']) {
  const content = fs.readFileSync(path.join(root, relativePath), 'utf8');
  for (const glyph of ['☰', '♧', '▣', '⌖', '⌁', '▥', '⚙', '☷', '◆', '◌', '•••']) {
    assert.equal(content.includes(glyph), false, `${relativePath} contains placeholder glyph ${glyph}`);
  }
}

const html = fs.readFileSync(path.join(root, 'app/index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app/app.js'), 'utf8');
assert.match(html, /role="dialog"[^>]+aria-modal="true"/);
assert.match(html, /id="appShell"/);
assert.match(app, /appShell\.inert = enabled/);
assert.match(app, /if \(event\.key === 'Tab'\) trapDialogTab\(event\)/);
assert.match(app, /if \(event\.key === 'Escape'\)/);
assert.match(app, /lastFocused\.focus\(\)/);

console.log('RP02 foundation tests: PASS');
