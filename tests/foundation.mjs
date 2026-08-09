import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { records, routeStageOrder } from '../app/data.js';
import {
  canActOnRecord,
  createAppState,
  routeForRecord,
  selectScope,
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

const centralRecordIds = ['hvac', 'leak', 'calibration', 'decision'];

function assertCentralSiteSelection(siteId, allowedRecordId = null) {
  const next = selectSite(defaultState, siteId);
  assert.equal(next.scopeId, 'central', `${siteId} must not narrow the operational scope`);
  assert.equal(next.selectedSiteId, siteId);
  assert.deepEqual(visibleRecords(next).map((record) => record.id), centralRecordIds);

  for (const record of Object.values(records)) {
    const shouldAllow = record.id === allowedRecordId;
    assert.equal(
      canActOnRecord(next, record),
      shouldAllow,
      `${siteId} authority mismatch for ${record.id}`
    );
  }

  return next;
}

const operationsSiteState = assertCentralSiteSelection('ops', 'leak');
const operationsSimulated = simulateAction(operationsSiteState, 'leak');
assert.notEqual(operationsSimulated, operationsSiteState);
assert.ok(operationsSimulated.simulatedRecordIds.includes('leak'));
assert.equal(simulateAction(operationsSiteState, 'hvac'), operationsSiteState);

const pumpSiteState = assertCentralSiteSelection('pump', 'calibration');
const pumpSimulated = simulateAction(pumpSiteState, 'calibration');
assert.notEqual(pumpSimulated, pumpSiteState);
assert.ok(pumpSimulated.simulatedRecordIds.includes('calibration'));
assert.equal(simulateAction(pumpSiteState, 'leak'), pumpSiteState);

const warehouseState = assertCentralSiteSelection('warehouse');
assert.equal(simulateAction(warehouseState, 'hvac'), warehouseState);
assert.equal(simulateAction(warehouseState, 'leak'), warehouseState);

const dcState = assertCentralSiteSelection('dc');
assert.equal(simulateAction(dcState, 'decision'), dcState);
assert.equal(simulateAction(dcState, 'calibration'), dcState);

const explicitOperationsScope = selectScope(defaultState, 'operations');
assert.equal(explicitOperationsScope.scopeId, 'operations');
assert.equal(explicitOperationsScope.selectedSiteId, 'ops');
assert.deepEqual(visibleRecords(explicitOperationsScope).map((record) => record.id), ['leak', 'decision']);
assert.equal(canActOnRecord(explicitOperationsScope, records.leak), true);
assert.equal(canActOnRecord(explicitOperationsScope, records.decision), false);

const explicitPumpScope = selectScope(explicitOperationsScope, 'northPump');
assert.equal(explicitPumpScope.scopeId, 'northPump');
assert.equal(explicitPumpScope.selectedSiteId, 'pump');
assert.deepEqual(visibleRecords(explicitPumpScope).map((record) => record.id), ['calibration']);

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
