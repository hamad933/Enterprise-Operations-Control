import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tasks } from '../app/work-queue-data.js';
import {
  canActOnTask,
  closureEligibility,
  createWorkQueueState,
  evaluateTaskAuthority,
  reworkEligibility,
  requestClosure,
  runtimeTask,
  selectTask,
  setActionSite,
  setQueueFilter,
  setQueueSearch,
  startRework,
  visibleTasks
} from '../app/work-queue-state.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const base = createWorkQueueState();
assert.equal(base.operationalScopeId, 'central');
assert.equal(base.actionSiteId, 'hq');
assert.equal(base.selectedTaskId, 'TSK-2041');
assert.deepEqual(visibleTasks(base).map((task) => task.id), ['TSK-2041', 'TSK-2048', 'TSK-2052', 'TSK-2059', 'TSK-2063']);

const selected = selectTask(base, 'TSK-2048');
assert.equal(selected.selectedTaskId, 'TSK-2048');
assert.equal(selected.operationalScopeId, 'central');

const searched = setQueueSearch(base, 'PT-19/20');
assert.deepEqual(visibleTasks(searched).map((task) => task.id), ['TSK-2059']);

const evidenceFilter = setQueueFilter(base, 'evidence');
assert.deepEqual(visibleTasks(evidenceFilter).map((task) => task.id), ['TSK-2052']);

const urgentFilter = setQueueFilter(base, 'urgent');
assert.deepEqual(visibleTasks(urgentFilter).map((task) => task.id), ['TSK-2041', 'TSK-2048']);

// Authorized positive path: exact task authority + matching action site.
const authorizedBase = evaluateTaskAuthority(base, 'TSK-2041');
assert.equal(authorizedBase.allowed, true);
assert.equal(authorizedBase.code, 'AUTHORIZED');
assert.equal(authorizedBase.condition, 'AUTHORIZED_MATCHING_SITE');
assert.equal(canActOnTask(base, 'TSK-2041'), true);
assert.equal(closureEligibility(base, 'TSK-2041').code, 'AUTHORIZED');
const closureRequested = requestClosure(base, 'TSK-2041');
assert.notEqual(closureRequested, base);
const closureTask = runtimeTask(closureRequested, 'TSK-2041');
assert.equal(closureTask.closureState, 'REQUESTED');
assert.equal(closureTask.verificationState, 'PENDING');
assert.match(closureTask.closureLabel, /ليس إغلاقًا نهائيًا/);
assert.equal(closureTask.history.at(-1).code, 'CLOSURE_REQUESTED');
assert.equal(closureTask.history.some((entry) => entry.code === 'CLOSED'), false);

// Finding 1 regression: explicit task denial remains sticky even on a matching site.
const opsSite = setActionSite(base, 'ops');
assert.equal(opsSite.operationalScopeId, 'central');
const explicitDenied = evaluateTaskAuthority(opsSite, 'TSK-2048');
assert.equal(explicitDenied.allowed, false);
assert.equal(explicitDenied.code, 'AUTHORITY_DENIED');
assert.equal(explicitDenied.condition, 'EXPLICIT_TASK_DENIAL');
assert.match(explicitDenied.reason, /رفض صلاحية صريح/);
assert.match(explicitDenied.reason, /حتى عندما يطابق موقع الإجراء موقع المهمة/);
assert.doesNotMatch(explicitDenied.reason, /لا يطابق موقع المهمة/);
assert.match(explicitDenied.actionReason, /ليس بسبب اختلاف الموقع/);
assert.equal(canActOnTask(opsSite, 'TSK-2048'), false);
assert.equal(requestClosure(opsSite, 'TSK-2048'), opsSite);

// Otherwise-authorized task is denied only by an action-site mismatch.
const mismatchedAuthorized = evaluateTaskAuthority(opsSite, 'TSK-2041');
assert.equal(mismatchedAuthorized.allowed, false);
assert.equal(mismatchedAuthorized.code, 'AUTHORITY_DENIED');
assert.equal(mismatchedAuthorized.condition, 'ACTION_SITE_MISMATCH');
assert.match(mismatchedAuthorized.reason, /لا يطابق موقع المهمة/);
assert.match(mismatchedAuthorized.actionReason, /موقع الإجراء المحدد لا يطابق موقع المهمة/);
assert.equal(canActOnTask(opsSite, 'TSK-2041'), false);

// Restoring the matching site restores only authority the task itself owns.
const restoredHq = setActionSite(opsSite, 'hq');
assert.equal(evaluateTaskAuthority(restoredHq, 'TSK-2041').condition, 'AUTHORIZED_MATCHING_SITE');
assert.equal(evaluateTaskAuthority(restoredHq, 'TSK-2041').allowed, true);
const restoredOps = setActionSite(restoredHq, 'ops');
assert.equal(evaluateTaskAuthority(restoredOps, 'TSK-2048').condition, 'EXPLICIT_TASK_DENIAL');
assert.equal(evaluateTaskAuthority(restoredOps, 'TSK-2048').allowed, false);

// Evidence and decision restrictions remain independent from site authority.
assert.equal(closureEligibility(base, 'TSK-2052').code, 'EVIDENCE_MISSING');
assert.equal(requestClosure(base, 'TSK-2052'), base);
assert.equal(tasks['TSK-2052'].closureState, 'OPEN');
assert.equal(closureEligibility(base, 'TSK-2063').code, 'DECISION_PENDING');
assert.equal(requestClosure(base, 'TSK-2063'), base);

// Finding 2 regression: rejected verification -> rework, but no immediate closure.
const pumpSite = setActionSite(base, 'pump');
assert.equal(pumpSite.operationalScopeId, 'central');
assert.equal(pumpSite.actionSiteId, 'pump');
assert.equal(canActOnTask(pumpSite, 'TSK-2059'), true);
const rejectedEligibility = closureEligibility(pumpSite, 'TSK-2059');
assert.equal(rejectedEligibility.allowed, false);
assert.equal(rejectedEligibility.code, 'VERIFICATION_REJECTED');
assert.equal(reworkEligibility(pumpSite, 'TSK-2059').code, 'AUTHORIZED');

const preReworkTask = runtimeTask(pumpSite, 'TSK-2059');
const preReworkHistory = preReworkTask.history.map((entry) => ({ ...entry }));
const rework = startRework(pumpSite, 'TSK-2059');
const reworkTask = runtimeTask(rework, 'TSK-2059');
assert.equal(reworkTask.verificationState, 'REWORK_ACTIVE');
assert.equal(reworkTask.closureState, 'OPEN');
assert.equal(reworkTask.evidenceState, 'EVIDENCE_REFRESH_REQUIRED');
assert.match(reworkTask.evidenceLabel, /الدليل السابق محفوظ تاريخيًا/);
assert.match(reworkTask.lineage, /RW-02/);
assert.match(reworkTask.lineage, /CL-01/);
assert.deepEqual(reworkTask.history.slice(0, preReworkHistory.length), preReworkHistory);
assert.equal(reworkTask.history.some((entry) => entry.code === 'VERIFICATION_REJECTED'), true);
assert.equal(reworkTask.history.at(-1).code, 'REWORK_STARTED');

const activeReworkEligibility = closureEligibility(rework, 'TSK-2059');
assert.equal(activeReworkEligibility.allowed, false);
assert.equal(activeReworkEligibility.code, 'REWORK_ACTIVE');
assert.equal(activeReworkEligibility.condition, 'REWORK_ACTIVE_REQUIRES_REFRESHED_EVIDENCE');
assert.match(activeReworkEligibility.reason, /الدليل السابق محفوظ كسجل تاريخي/);
assert.equal(requestClosure(rework, 'TSK-2059'), rework, 'REWORK_ACTIVE cannot immediately request closure');

// Even if stale pre-rejection COMPLETE evidence were reintroduced, REWORK_ACTIVE still blocks closure.
const staleEvidenceRework = {
  ...rework,
  runtime: {
    ...rework.runtime,
    'TSK-2059': {
      ...rework.runtime['TSK-2059'],
      evidenceState: 'COMPLETE',
      evidenceLabel: '4/4 أدلة ما قبل رفض التحقق'
    }
  }
};
assert.equal(closureEligibility(staleEvidenceRework, 'TSK-2059').allowed, false);
assert.equal(closureEligibility(staleEvidenceRework, 'TSK-2059').code, 'REWORK_ACTIVE');
assert.equal(requestClosure(staleEvidenceRework, 'TSK-2059'), staleEvidenceRework);

const html = fs.readFileSync(path.join(root, 'app/work-queue.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app/work-queue.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/work-queue.css'), 'utf8');
const render = fs.readFileSync(path.join(root, 'app/work-queue-render.js'), 'utf8');

assert.match(html, /<html lang="ar" dir="rtl">/);
assert.match(html, /id="actionSiteSelect"/);
assert.match(html, /id="queueList"/);
assert.match(html, /id="focusTask"/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /<bdi dir="ltr">TSK-2041<\/bdi>/);
assert.match(html, /href="\.\/index\.html"/);
assert.match(app, /requestClosure/);
assert.match(app, /startRework/);
assert.match(render, /evaluateTaskAuthority/);
assert.doesNotMatch(render, /task\.authorityReason/);
assert.match(render, /action\.reason/);
assert.match(css, /@media\(max-width:980px\)/);
assert.match(css, /@media\(max-width:760px\)/);
assert.match(css, /\.s02-layout \{[\s\S]*grid-template-columns/);

for (const file of ['app/work-queue.html', 'app/work-queue.js', 'app/work-queue-data.js', 'app/work-queue-state.js', 'app/work-queue-render.js']) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(content.includes('http://'), false, `${file} must not introduce external HTTP calls`);
  assert.equal(content.includes('https://'), false, `${file} must not introduce external HTTPS calls`);
}

console.log('RP02 S02 tests: PASS');
