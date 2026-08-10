import { actionSites, queueFilters, tasks } from './work-queue-data.js';

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

export function createWorkQueueState() {
  return {
    operationalScopeId: 'central',
    actionSiteId: 'hq',
    filterId: 'all',
    searchTerm: '',
    selectedTaskId: 'TSK-2041',
    runtime: {}
  };
}

export function setQueueFilter(state, filterId) {
  if (!queueFilters.some((item) => item.id === filterId)) return state;
  return { ...state, filterId };
}

export function setQueueSearch(state, searchTerm) {
  return { ...state, searchTerm: String(searchTerm ?? '').trim() };
}

export function setActionSite(state, siteId) {
  if (!actionSites.some((site) => site.id === siteId)) return state;
  return { ...state, actionSiteId: siteId };
}

export function selectTask(state, taskId) {
  if (!hasOwn(tasks, taskId)) return state;
  return { ...state, selectedTaskId: taskId };
}

export function runtimeTask(state, taskOrId) {
  const task = typeof taskOrId === 'string' ? tasks[taskOrId] : taskOrId;
  if (!task) return null;
  const runtime = state.runtime[task.id];
  return runtime ? { ...task, ...runtime } : task;
}

export function evaluateTaskAuthority(state, taskOrId) {
  const task = runtimeTask(state, taskOrId);
  if (!task) {
    return {
      allowed: false,
      code: 'OUT_OF_SCOPE',
      condition: 'OUT_OF_SCOPE',
      reason: 'المهمة غير موجودة ضمن هذا السطح.',
      actionReason: 'لا يمكن تنفيذ إجراء على مهمة غير موجودة ضمن نطاق S02.'
    };
  }

  const selectedSite = actionSites.find((site) => site.id === state.actionSiteId);

  if (task.authorityCode === 'DECISION_PENDING') {
    return {
      allowed: false,
      code: 'DECISION_PENDING',
      condition: 'DECISION_PENDING',
      reason: 'صلاحية التنفيذ متوقفة لأن قرار نافذة العمل ما يزال معلّقًا؛ لا يمنح تطابق الموقع سلطة لتجاوز القرار.',
      actionReason: 'الإجراء غير متاح حتى يصدر القرار المطلوب.'
    };
  }

  if (task.authorityCode === 'AUTHORITY_DENIED') {
    return {
      allowed: false,
      code: 'AUTHORITY_DENIED',
      condition: 'EXPLICIT_TASK_DENIAL',
      reason: 'المهمة تحمل رفض صلاحية صريحًا على مستوى المهمة. هذا الرفض يبقى نافذًا حتى عندما يطابق موقع الإجراء موقع المهمة.',
      actionReason: 'الإجراء مرفوض بصلاحية صريحة على مستوى المهمة، وليس بسبب اختلاف الموقع.'
    };
  }

  if (task.authorityCode !== 'AUTHORIZED') {
    return {
      allowed: false,
      code: 'AUTHORITY_DENIED',
      condition: 'TASK_AUTHORITY_NOT_GRANTED',
      reason: 'لم تُمنح لهذه المهمة صلاحية إجراء قابلة للتنفيذ داخل S02.',
      actionReason: 'الإجراء غير متاح لأن المهمة لا تحمل صلاحية تنفيذ.'
    };
  }

  if (task.siteId !== state.actionSiteId) {
    return {
      allowed: false,
      code: 'AUTHORITY_DENIED',
      condition: 'ACTION_SITE_MISMATCH',
      reason: `المهمة مصرح بها في أصلها، لكن موقع الإجراء المحدد «${selectedSite?.name ?? 'غير محدد'}» لا يطابق موقع المهمة «${task.site}». الرؤية عبر المواقع لا تمنح صلاحية إجراء.`,
      actionReason: 'الإجراء غير متاح لأن موقع الإجراء المحدد لا يطابق موقع المهمة.'
    };
  }

  return {
    allowed: true,
    code: 'AUTHORIZED',
    condition: 'AUTHORIZED_MATCHING_SITE',
    reason: `المهمة تحمل صلاحية إجراء، وموقع الإجراء المحدد «${selectedSite?.name ?? task.site}» يطابق موقع المهمة. تبقى قيود الدليل والتحقق والإغلاق مستقلة.`,
    actionReason: 'صلاحية الموقع متحققة؛ تُطبّق بعد ذلك قيود الدليل والتحقق والإغلاق.'
  };
}

export function canActOnTask(state, taskOrId) {
  return evaluateTaskAuthority(state, taskOrId).allowed;
}

export function closureEligibility(state, taskOrId) {
  const task = runtimeTask(state, taskOrId);
  if (!task) return { allowed: false, code: 'OUT_OF_SCOPE', condition: 'OUT_OF_SCOPE', reason: 'المهمة غير موجودة ضمن هذا السطح.' };

  const authority = evaluateTaskAuthority(state, task);
  if (!authority.allowed) return authority;

  if (task.evidenceState === 'EVIDENCE_MISSING') {
    return { allowed: false, code: 'EVIDENCE_MISSING', condition: 'EVIDENCE_MISSING', reason: 'لا يمكن طلب الإغلاق قبل استكمال الأدلة المطلوبة.' };
  }
  if (task.verificationState === 'VERIFICATION_REJECTED') {
    return { allowed: false, code: 'VERIFICATION_REJECTED', condition: 'VERIFICATION_REJECTED', reason: 'نتيجة التحقق مرفوضة؛ يجب بدء إعادة العمل قبل أي طلب إغلاق جديد.' };
  }
  if (task.verificationState === 'REWORK_ACTIVE') {
    return {
      allowed: false,
      code: 'REWORK_ACTIVE',
      condition: 'REWORK_ACTIVE_REQUIRES_REFRESHED_EVIDENCE',
      reason: 'إعادة العمل نشطة. الدليل السابق محفوظ كسجل تاريخي ولا يثبت اكتمال إعادة العمل؛ اكتمال إعادة العمل وتجديد دليل ما بعد التنفيذ يحدثان خارج تفاعل S02 المحدود قبل أي طلب إغلاق جديد.'
    };
  }
  if (task.closureState === 'REQUESTED') {
    return { allowed: false, code: 'DECISION_PENDING', condition: 'CLOSURE_ALREADY_REQUESTED', reason: 'طلب الإغلاق أُرسل بالفعل وينتظر تحققًا مستقلًا.' };
  }
  return {
    allowed: true,
    code: 'AUTHORIZED',
    condition: 'CLOSURE_REQUEST_ALLOWED',
    reason: 'شروط طلب الإغلاق متحققة لهذا الموقع، لكن الإغلاق النهائي يبقى خارج سلطة المنفذ.'
  };
}

function appendHistory(task, entry) {
  return [...task.history, entry];
}

export function requestClosure(state, taskId) {
  const task = runtimeTask(state, taskId);
  const eligibility = closureEligibility(state, task);
  if (!task || !eligibility.allowed) return state;

  return {
    ...state,
    runtime: {
      ...state.runtime,
      [task.id]: {
        ...state.runtime[task.id],
        status: 'بانتظار التحقق المستقل',
        closureState: 'REQUESTED',
        closureLabel: 'تم إرسال طلب الإغلاق — ليس إغلاقًا نهائيًا',
        verificationState: 'PENDING',
        verificationLabel: 'بانتظار تحقق مستقل',
        nextAction: 'انتظار التحقق',
        history: appendHistory(task, {
          code: 'CLOSURE_REQUESTED',
          label: 'طلب الإغلاق — محاكاة واجهة فقط',
          actor: 'المستخدم التجريبي الحالي',
          time: 'الآن'
        })
      }
    }
  };
}

export function reworkEligibility(state, taskOrId) {
  const task = runtimeTask(state, taskOrId);
  if (!task) return { allowed: false, code: 'OUT_OF_SCOPE', condition: 'OUT_OF_SCOPE' };

  const authority = evaluateTaskAuthority(state, task);
  if (!authority.allowed) return authority;
  if (task.verificationState !== 'VERIFICATION_REJECTED') {
    return { allowed: false, code: 'OUT_OF_SCOPE', condition: 'REWORK_NOT_REQUIRED' };
  }
  return { allowed: true, code: 'AUTHORIZED', condition: 'REWORK_ALLOWED' };
}

export function startRework(state, taskId) {
  const task = runtimeTask(state, taskId);
  const eligibility = reworkEligibility(state, task);
  if (!task || !eligibility.allowed) return state;

  return {
    ...state,
    runtime: {
      ...state.runtime,
      [task.id]: {
        ...state.runtime[task.id],
        status: 'إعادة العمل نشطة',
        evidenceState: 'EVIDENCE_REFRESH_REQUIRED',
        evidenceLabel: 'الدليل السابق محفوظ تاريخيًا — يلزم دليل ما بعد إعادة العمل',
        verificationState: 'REWORK_ACTIVE',
        verificationLabel: 'إعادة العمل نشطة بعد رفض التحقق',
        closureState: 'OPEN',
        closureLabel: 'مفتوحة — طلب الإغلاق معطل أثناء إعادة العمل',
        closureRule: 'إعادة العمل النشطة لا يمكنها طلب الإغلاق. اكتمال إعادة العمل وتجديد الدليل يحدثان خارج تفاعل S02 المحدود، ثم يلزم طلب إغلاق جديد وتحقق مستقل.',
        nextAction: 'تنفيذ إعادة العمل وتجديد الدليل',
        history: appendHistory(task, {
          code: 'REWORK_STARTED',
          label: 'بدء إعادة العمل RW-02 — محاكاة واجهة فقط',
          actor: 'المستخدم التجريبي الحالي',
          time: 'الآن'
        })
      }
    }
  };
}

export function visibleTasks(state) {
  const query = state.searchTerm.toLocaleLowerCase('ar');
  return Object.values(tasks)
    .map((task) => runtimeTask(state, task))
    .filter((task) => {
      const filterMatches = state.filterId === 'all'
        || (state.filterId === 'assigned' && task.assignedToCurrentUser)
        || (state.filterId === 'urgent' && task.priorityRank <= 2)
        || (state.filterId === 'evidence' && task.evidenceState === 'EVIDENCE_MISSING')
        || (state.filterId === 'verification' && ['VERIFICATION_REJECTED', 'REWORK_ACTIVE', 'PENDING'].includes(task.verificationState))
        || (state.filterId === 'closure' && closureEligibility(state, task).allowed);

      const haystack = [
        task.id,
        task.title,
        task.site,
        task.scope,
        task.asset,
        task.status,
        task.assignee,
        task.ownership,
        task.evidenceState,
        task.verificationState,
        task.closureState
      ].join(' ').toLocaleLowerCase('ar');

      return filterMatches && (!query || haystack.includes(query));
    })
    .sort((a, b) => a.priorityRank - b.priorityRank);
}

export function queueCounts(state) {
  const all = Object.values(tasks).map((task) => runtimeTask(state, task));
  return {
    total: all.length,
    actionableHere: all.filter((task) => canActOnTask(state, task)).length,
    evidenceMissing: all.filter((task) => task.evidenceState === 'EVIDENCE_MISSING').length,
    verificationRejected: all.filter((task) => task.verificationState === 'VERIFICATION_REJECTED').length
  };
}
