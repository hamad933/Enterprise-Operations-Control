import { kpis, surfaces } from './completion-data.js';
import { renderAll, renderRoot } from './completion-render.js';
import {
  approveReview,
  createCompletionState,
  decideDeviation,
  recordAccessCheck,
  selectAsset,
  selectDeviation,
  selectKpi,
  selectProfile,
  selectReview,
  selectSite,
  setAuditFilter,
  setSearch,
  validateKpiDeviation
} from './completion-state.js';

const params = new URLSearchParams(window.location.search);
const requestedSurface = params.get('surface') || 'sites';
const mode = ['normal', 'loading', 'empty', 'partial', 'error', 'readonly'].includes(params.get('state')) ? params.get('state') : 'normal';
const surfaceId = surfaces.some((item) => item.id === requestedSurface) ? requestedSurface : 'sites';
let state = createCompletionState(surfaceId);
let toastTimer = null;

const byId = (id) => document.getElementById(id);

function showToast(message) {
  const toast = byId('completionToast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3000);
}

function applyState(nextState, message = '') {
  state = nextState;
  renderRoot(state, mode);
  if (message) showToast(message);
}

byId('completionSearch').addEventListener('input', (event) => {
  state = setSearch(state, event.target.value);
  renderRoot(state, mode);
});

document.addEventListener('click', (event) => {
  const site = event.target.closest('[data-site]');
  if (site) {
    applyState(selectSite(state, site.dataset.site));
    return;
  }

  const asset = event.target.closest('[data-asset]');
  if (asset) {
    applyState(selectAsset(state, asset.dataset.asset));
    return;
  }

  const kpi = event.target.closest('[data-kpi]');
  if (kpi) {
    applyState(selectKpi(state, kpi.dataset.kpi));
    return;
  }

  const deviation = event.target.closest('[data-deviation]');
  if (deviation) {
    applyState(selectDeviation(state, deviation.dataset.deviation));
    return;
  }

  const review = event.target.closest('[data-review]');
  if (review) {
    applyState(selectReview(state, review.dataset.review));
    return;
  }

  const profile = event.target.closest('[data-profile]');
  if (profile) {
    applyState(selectProfile(state, profile.dataset.profile));
    return;
  }

  const auditFilter = event.target.closest('[data-audit-filter]');
  if (auditFilter) {
    applyState(setAuditFilter(state, auditFilter.dataset.auditFilter));
    return;
  }

  const action = event.target.closest('[data-action]');
  if (!action || action.disabled || mode === 'readonly') return;

  if (action.dataset.action === 'validate-kpi') {
    const selected = kpis.find((item) => item.id === action.dataset.kpiId);
    const next = validateKpiDeviation(state, action.dataset.kpiId);
    applyState(next, selected?.deviation
      ? `تمت محاكاة تثبيت التحقق من ${selected.deviation}. لم يُنشأ قرار أو إجراء تلقائي.`
      : 'لا يوجد انحراف مرتبط بهذا KPI.');
    return;
  }

  if (action.dataset.action === 'decide') {
    const before = state;
    const next = decideDeviation(state, action.dataset.deviationId);
    applyState(next, next === before
      ? 'لم يُسجّل القرار لأن شرط الدليل أو السلطة أو التحقق غير متحقق.'
      : 'تم تسجيل قرار اصطناعي داخل الذاكرة فقط؛ الإجراء التصحيحي والنتيجة يظلان منفصلين.');
    return;
  }

  if (action.dataset.action === 'approve-review') {
    const before = state;
    const next = approveReview(state, action.dataset.reviewId);
    applyState(next, next === before
      ? 'الاعتماد غير متاح ضمن دور أو حالة المراجعة الحالية.'
      : 'تمت محاكاة الاعتماد لهذه المراجعة فقط مع إبقاء سجل الأدوار والـ lineage.');
    return;
  }

  if (action.dataset.action === 'check-access') {
    const next = recordAccessCheck(state, action.dataset.profileId, 'hq');
    applyState(next, 'تم تقييم سلطة المقر الرئيسي بصورة مستقلة عن فئة التطبيق.');
    return;
  }

  if (action.dataset.action === 'asset-context') {
    showToast('تم فتح سياق المراجعة محليًا فقط؛ لا يوجد تنفيذ فعلي أو تكامل خارجي.');
  }
});

renderAll(state, mode);
