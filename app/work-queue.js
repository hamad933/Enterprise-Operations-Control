import './portfolio-runtime.js';
import { S02_META } from './work-queue-data.js';
import { renderAll, renderShell } from './work-queue-render.js';
import {
  createWorkQueueState,
  requestClosure,
  selectTask,
  setActionSite,
  setQueueFilter,
  setQueueSearch,
  startRework
} from './work-queue-state.js';

const byId = (id) => document.getElementById(id);

let state = createWorkQueueState();
let toastTimer = null;

function showToast(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function applyState(nextState, message = '') {
  state = nextState;
  byId('queueSearch').value = state.searchTerm;
  renderAll(state);
  if (message) showToast(message);
}

function routePlaceholder(text) {
  if (text.includes('المواقع')) return './operations.html?surface=sites';
  if (text.includes('التحقق')) return './operations.html?surface=reviews';
  if (text.includes('القرارات')) return './operations.html?surface=decisions';
  if (text.includes('التقارير')) return './operations.html?surface=reports';
  if (text.includes('الإعدادات') || text.includes('المزيد')) return './operations.html?surface=administration';
  return null;
}

function initialize() {
  renderShell(state);
  renderAll(state);
  document.documentElement.dataset.surface = S02_META.surface;
}

document.addEventListener('click', (event) => {
  const filter = event.target.closest('[data-filter]');
  if (filter) {
    applyState(setQueueFilter(state, filter.dataset.filter));
    return;
  }

  const taskButton = event.target.closest('[data-task]');
  if (taskButton) {
    applyState(selectTask(state, taskButton.dataset.task));
    return;
  }

  const placeholder = event.target.closest('[data-placeholder]');
  if (placeholder) {
    const target = routePlaceholder(placeholder.dataset.placeholder);
    if (target) {
      window.location.href = target;
      return;
    }
    showToast(`${placeholder.dataset.placeholder}. لا توجد مساحة أخرى مرتبطة بهذا التحكم.`);
  }
});

byId('queueSearch').addEventListener('input', (event) => {
  state = setQueueSearch(state, event.target.value);
  renderAll(state);
});

byId('actionSiteSelect').addEventListener('change', (event) => {
  applyState(
    setActionSite(state, event.target.value),
    'تم تغيير موقع الإجراء فقط. بقي النطاق التشغيلي المرئي كما هو، وأُعيد تقييم صلاحية المهمة المحددة.'
  );
});

byId('focusPrimaryAction').addEventListener('click', (event) => {
  const taskId = event.currentTarget.dataset.taskId;
  const action = event.currentTarget.dataset.action;
  const before = state;

  if (action === 'closure') {
    state = requestClosure(state, taskId);
  } else if (action === 'rework') {
    state = startRework(state, taskId);
  }

  if (state === before) {
    showToast('لم يُنفّذ الإجراء لأن شرط الصلاحية أو الدليل أو التحقق غير متحقق.');
    return;
  }

  renderAll(state);
  if (action === 'closure') {
    showToast('تمت محاكاة طلب الإغلاق. المهمة الآن بانتظار تحقق مستقل ولم تُغلق نهائيًا.');
  } else {
    showToast('تمت محاكاة بدء إعادة العمل مع الحفاظ على lineage وسجل رفض التحقق السابق.');
  }
});

initialize();