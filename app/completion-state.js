import { accessProfiles, assets, deviations, kpis, reviews, sites, surfaces } from './completion-data.js';

const has = (items, id) => items.some((item) => item.id === id);

export function createCompletionState(surfaceId = 'sites') {
  const safeSurface = surfaces.some((item) => item.id === surfaceId) ? surfaceId : 'sites';
  return {
    surfaceId: safeSurface,
    selectedSiteId: 'hq',
    selectedAssetId: 'AHU-07',
    selectedKpiId: 'KPI-HVAC-04',
    selectedDeviationId: 'DEV-203',
    selectedReviewId: 'REV-884',
    selectedProfileId: 'USR-001',
    auditFilter: 'all',
    searchTerm: '',
    runtime: { validated: [], decided: [], approved: [], accessChecks: {} }
  };
}

export function selectSurface(state, surfaceId) {
  return surfaces.some((item) => item.id === surfaceId) ? { ...state, surfaceId } : state;
}
export function selectSite(state, id) { return has(sites, id) ? { ...state, selectedSiteId: id } : state; }
export function selectAsset(state, id) { return has(assets, id) ? { ...state, selectedAssetId: id, selectedSiteId: assets.find((x) => x.id === id).siteId } : state; }
export function selectKpi(state, id) { return has(kpis, id) ? { ...state, selectedKpiId: id } : state; }
export function selectDeviation(state, id) { return has(deviations, id) ? { ...state, selectedDeviationId: id } : state; }
export function selectReview(state, id) { return has(reviews, id) ? { ...state, selectedReviewId: id } : state; }
export function selectProfile(state, id) { return has(accessProfiles, id) ? { ...state, selectedProfileId: id } : state; }
export function setSearch(state, value) { return { ...state, searchTerm: String(value ?? '').trim() }; }
export function setAuditFilter(state, value) { return { ...state, auditFilter: value || 'all' }; }

export function canActOnSite(state, siteId) {
  return siteId === 'hq';
}

export function evaluateAssetAuthority(state, assetId) {
  const asset = assets.find((item) => item.id === assetId);
  if (!asset) return { allowed: false, code: 'OUT_OF_SCOPE', reason: 'الأصل غير موجود ضمن البيانات الاصطناعية الحالية.' };
  if (!canActOnSite(state, asset.siteId)) return { allowed: false, code: 'AUTHORITY_DENIED', reason: 'الأصل مرئي ضمن النطاق، لكن سلطة الإجراء للمستخدم الحالي محصورة بالمقر الرئيسي.' };
  return { allowed: true, code: 'AUTHORIZED', reason: 'الأصل ضمن الموقع المخول للمستخدم الحالي؛ تبقى قيود الدليل والقرار مستقلة.' };
}

export function validateKpiDeviation(state, kpiId) {
  const kpi = kpis.find((item) => item.id === kpiId);
  if (!kpi || !kpi.deviation) return state;
  if (state.runtime.validated.includes(kpi.deviation)) return state;
  return { ...state, runtime: { ...state.runtime, validated: [...state.runtime.validated, kpi.deviation] } };
}

export function runtimeDeviation(state, deviationId) {
  const item = deviations.find((d) => d.id === deviationId);
  if (!item) return null;
  return {
    ...item,
    validation: state.runtime.validated.includes(item.id) && item.validation !== 'EVIDENCE_MISSING' ? 'VALIDATED' : item.validation,
    decision: state.runtime.decided.includes(item.id) ? 'DECIDED' : item.decision,
    outcome: state.runtime.decided.includes(item.id) ? 'اعتماد إجراء تصحيحي اصطناعي — مراقبة النتيجة مطلوبة' : item.outcome
  };
}

export function evaluateDecisionAuthority(state, deviationId) {
  const item = runtimeDeviation(state, deviationId);
  if (!item) return { allowed: false, code: 'OUT_OF_SCOPE', reason: 'الانحراف غير موجود.' };
  if (item.validation === 'EVIDENCE_MISSING') return { allowed: false, code: 'EVIDENCE_MISSING', reason: 'لا يمكن اتخاذ قرار قبل استكمال دليل التحقق المطلوب.' };
  if (item.authority === 'CONFLICT') return { allowed: false, code: 'CONFLICT', reason: 'تعارض السلطة يمنع الحسم حتى تُحل المسؤولية بشكل مستقل.' };
  if (item.authority === 'OUT_OF_SCOPE') return { allowed: false, code: 'OUT_OF_SCOPE', reason: 'الانحراف خارج موقع سلطة المستخدم الحالي.' };
  if (item.authority === 'AUTHORITY_DENIED') return { allowed: false, code: 'AUTHORITY_DENIED', reason: 'الرؤية متاحة، لكن سلطة القرار غير ممنوحة لهذا الموقع أو الدور.' };
  if (item.validation !== 'VALIDATED') return { allowed: false, code: 'DECISION_PENDING', reason: 'يجب تثبيت التحقق من الانحراف قبل القرار.' };
  return { allowed: true, code: 'AUTHORIZED', reason: 'التحقق مكتمل وسلطة القرار متاحة لهذه الحالة المحددة فقط.' };
}

export function decideDeviation(state, deviationId) {
  if (!evaluateDecisionAuthority(state, deviationId).allowed || state.runtime.decided.includes(deviationId)) return state;
  return { ...state, runtime: { ...state.runtime, decided: [...state.runtime.decided, deviationId] } };
}

export function evaluateReviewAuthority(state, reviewId) {
  const review = reviews.find((item) => item.id === reviewId);
  if (!review) return { allowed: false, code: 'OUT_OF_SCOPE', reason: 'المراجعة غير موجودة.' };
  if (review.authority !== 'AUTHORIZED') return { allowed: false, code: review.authority, reason: review.reason };
  if (review.state !== 'READY_FOR_APPROVAL') return { allowed: false, code: review.state, reason: 'الحالة ليست جاهزة للاعتماد النهائي.' };
  return { allowed: true, code: 'AUTHORIZED', reason: review.reason };
}

export function approveReview(state, reviewId) {
  if (!evaluateReviewAuthority(state, reviewId).allowed || state.runtime.approved.includes(reviewId)) return state;
  return { ...state, runtime: { ...state.runtime, approved: [...state.runtime.approved, reviewId] } };
}

export function runtimeReview(state, reviewId) {
  const review = reviews.find((item) => item.id === reviewId);
  if (!review) return null;
  return state.runtime.approved.includes(reviewId) ? { ...review, state: 'APPROVED', authority: 'AUTHORIZED' } : review;
}

export function evaluateProfileOperationalAuthority(profileId, siteId = 'hq') {
  const profile = accessProfiles.find((item) => item.id === profileId);
  if (!profile) return { allowed: false, code: 'OUT_OF_SCOPE', reason: 'ملف الوصول غير موجود.' };
  if (!profile.sitesVisible.includes(siteId)) return { allowed: false, code: 'OUT_OF_SCOPE', reason: 'الموقع خارج نطاق الرؤية لهذا الحساب.' };
  if (!profile.actionSites.includes(siteId)) {
    return {
      allowed: false,
      code: 'AUTHORITY_DENIED',
      reason: profile.admin
        ? 'حساب ADMIN يملك إدارة الوصول، لكنه لا يملك سلطة تشغيلية تلقائية على الموقع.'
        : 'الحساب يستطيع رؤية الموقع، لكن سلطة الإجراء غير ممنوحة.'
    };
  }
  return { allowed: true, code: 'AUTHORIZED', reason: 'سلطة الإجراء متاحة في الموقع المحدد فقط.' };
}

export function recordAccessCheck(state, profileId, siteId = 'hq') {
  const result = evaluateProfileOperationalAuthority(profileId, siteId);
  return {
    ...state,
    runtime: {
      ...state.runtime,
      accessChecks: { ...state.runtime.accessChecks, [profileId]: result }
    }
  };
}
