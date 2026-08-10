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

export function canActOnTask(state, taskOrId) {
  const task = runtimeTask(state, taskOrId);
  if (!task) return false;
  return task.authorityCode === 'AUTHORIZED' && task.siteId === state.actionSiteId;
}

export function closureEligibility(state, taskOrId) {
  const task = runtimeTask(state, taskOrId);
  if (!task) return { allowed: false, code: 'OUT_OF_SCOPE', reason: 'المهمة غير موجودة ضمن هذا السطح.' };
  if (task.authorityCode === 'DECISION_PENDING') {
    return { allowed: false, code: 'DECISION_PENDING', reason: 'قرار التنفيذ لم يصدر بعد.' };
  }
  if (!canActOnTask(state, task)) {
    return { allowed: false, code: 'AUTHORITY_DENIED', reason: 'الرؤية ضمن النطاق لا تمنح صلاحية الإجراء على موقع مختلف.' };
  }
  if (task.evidenceState === 'EVIDENCE_MISSING') {
    return { allowed: false, code: 'EVIDENCE_MISSING', reason: 'لا يمكن طلب الإغلاق قبل استكمال الأدلة المطلوبة.' };
  }
  if (task.verificationState === 'VERIFICATION_REJECTED') {
    return { allowed: false, code: 'VERIFICATION_REJECTED', reason: 'المهمة تحتاج إلى إعادة عمل قبل أي طلب إغلاق جديد.' };
  }
  if (task.closureState === 'REQUESTED') {
    return { allowed: false, code: 'DECISION_PENDING', reason: 'طلب الإغلاق أُرسل بالفعل وينتظر تحققًا مستقلًا.' };
  }
  return { allowed: true, code: 'AUTHORIZED', reason: 'شروط طلب الإغلاق متحققة لهذا الموقع، لكن الإغلاق النهائي يبقى خارج سلطة المنفذ.' };
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
  if (!task) return { allowed: false, code: 'OUT_OF_SCOPE' };
  if (!canActOnTask(state, task)) return { allowed: false, code: 'AUTHORITY_DENIED' };
  if (task.verificationState !== 'VERIFICATION_REJECTED') return { allowed: false, code: 'OUT_OF_SCOPE' };
  return { allowed: true, code: 'AUTHORIZED' };
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
        verificationState: 'REWORK_ACTIVE',
        verificationLabel: 'إعادة العمل نشطة بعد رفض التحقق',
        closureState: 'OPEN',
        closureLabel: 'أعيد فتحها ضمن lineage محفوظ',
        nextAction: 'تنفيذ إعادة العمل',
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
