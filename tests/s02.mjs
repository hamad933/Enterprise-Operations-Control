import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { tasks } from '../app/work-queue-data.js';
import {
  canActOnTask,
  closureEligibility,
  createWorkQueueState,
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

assert.equal(canActOnTask(base, 'TSK-2048'), false);
assert.equal(closureEligibility(base, 'TSK-2048').code, 'AUTHORITY_DENIED');
assert.equal(requestClosure(base, 'TSK-2048'), base);

assert.equal(closureEligibility(base, 'TSK-2052').code, 'EVIDENCE_MISSING');
assert.equal(requestClosure(base, 'TSK-2052'), base);
assert.equal(tasks['TSK-2052'].closureState, 'OPEN');

assert.equal(closureEligibility(base, 'TSK-2063').code, 'DECISION_PENDING');
assert.equal(requestClosure(base, 'TSK-2063'), base);

const pumpSite = setActionSite(base, 'pump');
assert.equal(pumpSite.operationalScopeId, 'central');
assert.equal(pumpSite.actionSiteId, 'pump');
assert.equal(canActOnTask(pumpSite, 'TSK-2059'), true);
assert.equal(closureEligibility(pumpSite, 'TSK-2059').code, 'VERIFICATION_REJECTED');
assert.equal(reworkEligibility(pumpSite, 'TSK-2059').code, 'AUTHORIZED');

const rework = startRework(pumpSite, 'TSK-2059');
const reworkTask = runtimeTask(rework, 'TSK-2059');
assert.equal(reworkTask.verificationState, 'REWORK_ACTIVE');
assert.equal(reworkTask.closureState, 'OPEN');
assert.match(reworkTask.lineage, /RW-02/);
assert.equal(reworkTask.history.some((entry) => entry.code === 'VERIFICATION_REJECTED'), true);
assert.equal(reworkTask.history.at(-1).code, 'REWORK_STARTED');

const opsSite = setActionSite(base, 'ops');
assert.equal(opsSite.operationalScopeId, 'central');
assert.equal(canActOnTask(opsSite, 'TSK-2048'), false, 'task-level AUTHORITY_DENIED remains denied even when the site matches');

const html = fs.readFileSync(path.join(root, 'app/work-queue.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app/work-queue.js'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/work-queue.css'), 'utf8');

assert.match(html, /<html lang="ar" dir="rtl">/);
assert.match(html, /id="actionSiteSelect"/);
assert.match(html, /id="queueList"/);
assert.match(html, /id="focusTask"/);
assert.match(html, /aria-live="polite"/);
assert.match(html, /<bdi dir="ltr">TSK-2041<\/bdi>/);
assert.match(html, /href="\.\/index\.html"/);
assert.match(app, /requestClosure/);
assert.match(app, /startRework/);
assert.match(css, /@media\(max-width:980px\)/);
assert.match(css, /@media\(max-width:760px\)/);
assert.match(css, /\.s02-layout \{[\s\S]*grid-template-columns/);

for (const file of ['app/work-queue.html', 'app/work-queue.js', 'app/work-queue-data.js', 'app/work-queue-state.js', 'app/work-queue-render.js']) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  assert.equal(content.includes('http://'), false, `${file} must not introduce external HTTP calls`);
  assert.equal(content.includes('https://'), false, `${file} must not introduce external HTTPS calls`);
}

console.log('RP02 S02 tests: PASS');
