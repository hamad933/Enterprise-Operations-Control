import { actionSites, queueFilters, S02_META, tasks } from './work-queue-data.js';
import {
  canActOnTask,
  closureEligibility,
  queueCounts,
  reworkEligibility,
  runtimeTask,
  visibleTasks
} from './work-queue-state.js';
import { icon } from './icons.js';

const byId = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[char]);

const ltr = (value) => `<bdi class="ltr" dir="ltr">${escapeHtml(value)}</bdi>`;

function stateTone(task) {
  if (task.evidenceState === 'EVIDENCE_MISSING' || task.verificationState === 'VERIFICATION_REJECTED') return 'danger';
  if (task.authorityCode === 'AUTHORITY_DENIED') return 'muted';
  if (task.closureState === 'REQUESTED' || task.authorityCode === 'DECISION_PENDING') return 'warning';
  if (task.priorityRank <= 2) return 'critical';
  return 'neutral';
}

function authorityLabel(state, task) {
  if (task.authorityCode === 'DECISION_PENDING') return 'DECISION_PENDING';
  if (task.authorityCode === 'AUTHORITY_DENIED') return 'AUTHORITY_DENIED';
  return canActOnTask(state, task) ? 'AUTHORIZED' : 'AUTHORITY_DENIED';
}

function primaryActionFor(state, task) {
  if (task.verificationState === 'VERIFICATION_REJECTED') {
    const eligibility = reworkEligibility(state, task);
    return {
      kind: 'rework',
      label: eligibility.allowed ? 'بدء إعادة العمل' : 'عرض فقط — لا توجد صلاحية إعادة العمل',
      disabled: !eligibility.allowed,
      code: eligibility.code
    };
  }

  const eligibility = closureEligibility(state, task);
  if (task.evidenceState === 'EVIDENCE_MISSING') {
    return { kind: 'none', label: 'استكمال الدليل مطلوب قبل الإغلاق', disabled: true, code: 'EVIDENCE_MISSING' };
  }
  if (task.authorityCode === 'DECISION_PENDING') {
    return { kind: 'none', label: 'بانتظار القرار', disabled: true, code: 'DECISION_PENDING' };
  }
  if (task.closureState === 'REQUESTED') {
    return { kind: 'none', label: 'طلب الإغلاق قيد التحقق', disabled: true, code: 'DECISION_PENDING' };
  }
  return {
    kind: 'closure',
    label: eligibility.allowed ? 'طلب الإغلاق' : 'عرض فقط — خارج صلاحية موقع الإجراء',
    disabled: !eligibility.allowed,
    code: eligibility.code
  };
}

export function renderShell(state) {
  byId('brandSymbol').innerHTML = icon('building', 22);
  document.querySelectorAll('[data-icon]').forEach((node) => {
    node.innerHTML = icon(node.dataset.icon, Number(node.dataset.iconSize || 18));
  });
  byId('syntheticNotice').textContent = S02_META.syntheticNotice;
  byId('actionSiteSelect').innerHTML = actionSites.map((site) => (
    `<option value="${site.id}" ${state.actionSiteId === site.id ? 'selected' : ''}>${escapeHtml(site.name)} — ${escapeHtml(site.scope)}</option>`
  )).join('');
}

export function renderFilters(state) {
  const visible = visibleTasks({ ...state, filterId: 'all', searchTerm: '' });
  byId('queueFilters').innerHTML = queueFilters.map((filter) => {
    let count = visible.length;
    if (filter.id !== 'all') {
      count = visibleTasks({ ...state, filterId: filter.id, searchTerm: '' }).length;
    }
    return `<button class="filter-btn ${state.filterId === filter.id ? 'active' : ''}" data-filter="${filter.id}" aria-pressed="${state.filterId === filter.id}">
      <span>${escapeHtml(filter.label)}</span><span class="filter-count">${count}</span>
    </button>`;
  }).join('');
}

export function renderSummary(state) {
  const counts = queueCounts(state);
  const selectedSite = actionSites.find((site) => site.id === state.actionSiteId);
  byId('scopeBoundary').innerHTML = `
    <strong>حد الصلاحية الحالي</strong>
    <span>النطاق التشغيلي: المنطقة الوسطى · موقع الإجراء المحدد: «${escapeHtml(selectedSite?.name ?? '')}».</span>
    <span>الظهور عبر المواقع لا يمنح صلاحية إجراء، وطلب الإغلاق لا يساوي إغلاقًا نهائيًا.</span>
  `;
  byId('queueSummary').innerHTML = `
    <div><strong>${counts.total}</strong><span>مهام مرئية</span></div>
    <div><strong>${counts.actionableHere}</strong><span>ضمن صلاحية الموقع</span></div>
    <div><strong>${counts.evidenceMissing}</strong><span>دليل ناقص</span></div>
    <div><strong>${counts.verificationRejected}</strong><span>تحقق مرفوض</span></div>
  `;
}

export function renderQueue(state) {
  const list = visibleTasks(state);
  byId('queueList').innerHTML = list.map((task) => {
    const selected = task.id === state.selectedTaskId;
    const authority = authorityLabel(state, task);
    return `
      <button class="queue-row ${selected ? 'selected' : ''}" data-task="${task.id}" aria-pressed="${selected}" style="--task-tone:${stateTone(task)}">
        <span class="queue-priority"><strong>${task.priorityRank}</strong><small>${escapeHtml(task.priority)}</small></span>
        <span class="queue-main">
          <span class="queue-title">${escapeHtml(task.title)}</span>
          <span class="queue-meta">${ltr(task.id)} · ${ltr(task.asset)} · ${escapeHtml(task.site)}</span>
          <span class="queue-scope">${escapeHtml(task.scope)}</span>
        </span>
        <span class="queue-state">
          <span class="status-badge tone-${stateTone(task)}">${escapeHtml(task.status)}</span>
          <span class="queue-owner">${escapeHtml(task.assignee)}</span>
        </span>
        <span class="queue-evidence">
          <strong>${escapeHtml(task.evidenceLabel)}</strong>
          <small>${escapeHtml(task.verificationLabel)}</small>
        </span>
        <span class="queue-authority">
          <bdi class="technical-state ${authority === 'AUTHORIZED' ? 'ok' : 'denied'}" dir="ltr">${authority}</bdi>
          <small>${escapeHtml(task.closureLabel)}</small>
        </span>
        <span class="queue-open" aria-hidden="true">${icon('arrow', 17)}</span>
      </button>
    `;
  }).join('');

  byId('queueEmpty').hidden = list.length > 0;
  byId('visibleQueueCount').textContent = list.length
    ? `عرض ${list.length} من ${Object.keys(tasks).length} مهام اصطناعية.`
    : 'لا توجد مهام مطابقة للبحث والمرشحات الحالية.';
}

function historyMarkup(task) {
  return task.history.map((entry, index) => `
    <li>
      <span class="history-index">${String(index + 1).padStart(2, '0')}</span>
      <span class="history-copy">
        <strong>${escapeHtml(entry.label)}</strong>
        <small>${ltr(entry.code)} · ${escapeHtml(entry.actor)} · ${escapeHtml(entry.time)}</small>
      </span>
    </li>
  `).join('');
}

export function renderFocus(state) {
  const task = runtimeTask(state, state.selectedTaskId);
  if (!task) return;

  const action = primaryActionFor(state, task);
  const authority = authorityLabel(state, task);
  const selectedSite = actionSites.find((site) => site.id === state.actionSiteId);

  byId('focusTaskId').innerHTML = ltr(task.id);
  byId('focusTitle').textContent = task.title;
  byId('focusContext').innerHTML = `${escapeHtml(task.site)} · ${escapeHtml(task.scope)} · ${ltr(task.asset)}`;
  byId('focusStatus').textContent = task.status;

  byId('focusAuthority').className = `authority-aperture ${authority === 'AUTHORIZED' ? 'authority-allowed' : 'authority-denied'}`;
  byId('focusAuthority').innerHTML = `
    <span class="aperture-label">Authority Aperture</span>
    <strong><bdi dir="ltr">${authority}</bdi></strong>
    <p>${escapeHtml(task.authorityReason)}</p>
    <div class="authority-facts">
      <span>موقع المهمة: <b>${escapeHtml(task.site)}</b></span>
      <span>موقع الإجراء: <b>${escapeHtml(selectedSite?.name ?? '')}</b></span>
    </div>
  `;

  byId('focusEvidence').innerHTML = `
    <div class="focus-section-head"><h3>الأدلة</h3><bdi dir="ltr" class="technical-state ${task.evidenceState === 'EVIDENCE_MISSING' ? 'denied' : 'ok'}">${escapeHtml(task.evidenceState)}</bdi></div>
    <ul class="evidence-list">${task.evidence.map((item, index) => `<li class="${item.includes('مفقودة') ? 'missing' : ''}"><span>${index + 1}</span><strong>${escapeHtml(item)}</strong></li>`).join('')}</ul>
  `;

  byId('focusClosure').innerHTML = `
    <div class="focus-section-head"><h3>التحقق والإغلاق</h3><bdi dir="ltr" class="technical-state">${escapeHtml(task.closureState)}</bdi></div>
    <div class="closure-grid">
      <div><span>التحقق</span><strong>${escapeHtml(task.verificationLabel)}</strong></div>
      <div><span>الإغلاق</span><strong>${escapeHtml(task.closureLabel)}</strong></div>
    </div>
    <p class="invariant-note">${escapeHtml(task.closureRule)}</p>
  `;

  byId('focusHistory').innerHTML = `
    <div class="focus-section-head"><h3>المسار والسجل</h3><span class="lineage">${escapeHtml(task.lineage)}</span></div>
    <ol class="history-list">${historyMarkup(task)}</ol>
  `;

  const primary = byId('focusPrimaryAction');
  primary.disabled = action.disabled;
  primary.dataset.action = action.kind;
  primary.dataset.taskId = task.id;
  primary.textContent = action.label;
  primary.setAttribute('aria-label', `${action.label} للمهمة ${task.id}`);

  byId('focusActionCode').innerHTML = `<bdi dir="ltr">${escapeHtml(action.code)}</bdi>`;
  byId('focusActionNote').textContent = action.disabled
    ? 'لم تُنفّذ أي معاملة. التحكم يعكس شرط الصلاحية أو الدليل أو التحقق فقط.'
    : 'محاكاة داخل الذاكرة فقط. لا يوجد backend أو حفظ دائم أو إغلاق نهائي تلقائي.';
}

export function renderAll(state) {
  renderFilters(state);
  renderSummary(state);
  renderQueue(state);
  renderFocus(state);
}
