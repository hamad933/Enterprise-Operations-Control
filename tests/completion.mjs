import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { accessProfiles, assets, auditEvents, deviations, kpis, reviews, sites, surfaces } from '../app/completion-data.js';
import {
  approveReview,
  createCompletionState,
  decideDeviation,
  evaluateAssetAuthority,
  evaluateDecisionAuthority,
  evaluateProfileOperationalAuthority,
  evaluateReviewAuthority,
  runtimeDeviation,
  runtimeReview,
  selectAsset,
  selectDeviation,
  selectKpi,
  selectProfile,
  selectReview,
  validateKpiDeviation
} from '../app/completion-state.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

assert.deepEqual(surfaces.map((surface) => surface.code), ['S03', 'S04', 'S05', 'S06', 'S07', 'S08']);
assert.deepEqual(surfaces.map((surface) => surface.id), ['sites', 'performance', 'decisions', 'reviews', 'reports', 'administration']);
assert.equal(sites.length >= 4, true);
assert.equal(assets.length >= 4, true);
assert.equal(auditEvents.length >= 5, true);

for (const kpi of kpis) {
  for (const field of ['source', 'scope', 'period', 'owner', 'target', 'threshold', 'current', 'evidence', 'lineage']) {
    assert.ok(String(kpi[field] ?? '').length > 0, `${kpi.id} missing ${field}`);
  }
}

let state = createCompletionState('sites');
assert.equal(state.surfaceId, 'sites');
assert.equal(evaluateAssetAuthority(state, 'AHU-07').code, 'AUTHORIZED');
assert.equal(evaluateAssetAuthority(state, 'UTIL-04').code, 'AUTHORITY_DENIED');
state = selectAsset(state, 'UTIL-04');
assert.equal(state.selectedSiteId, 'ops');
assert.equal(evaluateAssetAuthority(state, 'UTIL-04').allowed, false);

state = createCompletionState('performance');
state = selectKpi(state, 'KPI-HVAC-04');
const beforeValidation = state;
state = validateKpiDeviation(state, 'KPI-HVAC-04');
assert.notEqual(state, beforeValidation);
assert.ok(state.runtime.validated.includes('DEV-203'));
assert.equal(state.runtime.decided.includes('DEV-203'), false, 'KPI validation must not create a decision');
assert.equal(runtimeDeviation(state, 'DEV-203').decision, 'DECISION_PENDING');

state = createCompletionState('decisions');
state = selectDeviation(state, 'DEV-203');
assert.equal(evaluateDecisionAuthority(state, 'DEV-203').code, 'AUTHORIZED');
const decided = decideDeviation(state, 'DEV-203');
assert.equal(runtimeDeviation(decided, 'DEV-203').decision, 'DECIDED');
assert.equal(runtimeDeviation(decided, 'DEV-203').outcome.includes('مراقبة النتيجة'), true);
assert.equal(evaluateDecisionAuthority(state, 'DEV-118').code, 'AUTHORITY_DENIED');
assert.equal(decideDeviation(state, 'DEV-118'), state);
assert.equal(evaluateDecisionAuthority(state, 'DEV-054').code, 'EVIDENCE_MISSING');
assert.equal(evaluateDecisionAuthority(state, 'DEV-244').code, 'CONFLICT');
assert.equal(deviations.find((item) => item.id === 'DEV-054').overdue, true);

state = createCompletionState('reviews');
state = selectReview(state, 'REV-901');
assert.equal(evaluateReviewAuthority(state, 'REV-901').code, 'AUTHORITY_DENIED');
assert.equal(approveReview(state, 'REV-901'), state);
state = selectReview(state, 'REV-884');
assert.equal(evaluateReviewAuthority(state, 'REV-884').code, 'AUTHORIZED');
const approved = approveReview(state, 'REV-884');
assert.equal(runtimeReview(approved, 'REV-884').state, 'APPROVED');
assert.equal(runtimeReview(approved, 'REV-901').state, 'PENDING_VERIFICATION');
assert.equal(evaluateReviewAuthority(state, 'REV-812').code, 'OUT_OF_SCOPE');
assert.equal(reviews.find((item) => item.id === 'REV-812').state, 'VERIFICATION_REJECTED');

state = createCompletionState('administration');
state = selectProfile(state, 'USR-099');
const adminProfile = accessProfiles.find((item) => item.id === 'USR-099');
assert.equal(adminProfile.appClass, 'ADMIN');
assert.equal(adminProfile.actionSites.length, 0);
const adminAuthority = evaluateProfileOperationalAuthority('USR-099', 'hq');
assert.equal(adminAuthority.code, 'AUTHORITY_DENIED');
assert.match(adminAuthority.reason, /ADMIN/);
assert.equal(evaluateProfileOperationalAuthority('USR-001', 'hq').code, 'AUTHORIZED');
assert.equal(evaluateProfileOperationalAuthority('USR-001', 'ops').code, 'AUTHORITY_DENIED');

const html = fs.readFileSync(path.join(root, 'app/operations.html'), 'utf8');
const render = fs.readFileSync(path.join(root, 'app/completion-render.js'), 'utf8');
const script = fs.readFileSync(path.join(root, 'app/completion.js'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app/app.js'), 'utf8');
const workQueue = fs.readFileSync(path.join(root, 'app/work-queue.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/completion.css'), 'utf8');

assert.match(html, /<html lang="ar" dir="rtl">/);
assert.match(html, /id="completionNav"/);
assert.match(html, /id="completionRoot"/);
assert.match(render, /Source/);
assert.match(render, /Threshold/);
assert.match(render, /Evidence \/ lineage/);
assert.match(render, /DECISION_NOT_CREATED/);
assert.match(render, /Admin presentation|ADMIN/);
assert.match(script, /validateKpiDeviation/);
assert.match(script, /decideDeviation/);
assert.match(app, /operations\.html\?surface=sites/);
assert.match(workQueue, /operations\.html\?surface=reviews/);
assert.match(css, /@media\(max-width:900px\)/);
assert.match(css, /@media\(max-width:620px\)/);

for (const file of [
  'app/completion-data.js', 'app/completion-state.js', 'app/completion-render.js', 'app/completion.js', 'app/operations.html'
]) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(content.includes('http://'), false, `${file} must not introduce HTTP calls`);
  assert.equal(content.includes('https://'), false, `${file} must not introduce HTTPS calls`);
}

console.log('RP02 completion state tests: PASS');
