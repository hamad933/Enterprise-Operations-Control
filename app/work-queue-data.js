export const S02_META = Object.freeze({
  product: 'RP02 — Enterprise Operations',
  surface: 'S02 — قائمة الأعمال والمهمة المركزة',
  syntheticNotice: 'جميع سجلات الأعمال والأدلة المعروضة اصطناعية لأغراض المراجعة فقط — لا توجد بيانات تشغيل حية أو عمليات رفع فعلية.'
});

export const actionSites = Object.freeze([
  { id: 'hq', name: 'المقر الرئيسي', scope: 'المنطقة الوسطى' },
  { id: 'ops', name: 'مجمع العمليات', scope: 'المنطقة الوسطى' },
  { id: 'pump', name: 'محطة الضخ الشمالية', scope: 'المنطقة الوسطى' }
]);

export const queueFilters = Object.freeze([
  { id: 'all', label: 'الكل' },
  { id: 'assigned', label: 'مسند إليّ' },
  { id: 'urgent', label: 'أولوية عالية' },
  { id: 'evidence', label: 'الدليل ناقص' },
  { id: 'verification', label: 'التحقق / إعادة العمل' },
  { id: 'closure', label: 'جاهز لطلب الإغلاق' }
]);

const history = (...items) => Object.freeze(items);

export const tasks = Object.freeze({
  'TSK-2041': Object.freeze({
    id: 'TSK-2041',
    title: 'استبدال محمل وحدة مناولة الهواء',
    siteId: 'hq',
    site: 'المقر الرئيسي',
    scope: 'مبنى الخدمات الرئيسي',
    asset: 'AHU-07',
    priority: 'حرجة',
    priorityRank: 1,
    status: 'قيد التنفيذ',
    assignee: 'سارة الحربي',
    ownership: 'فريق الصيانة الميكانيكية',
    assignedToCurrentUser: true,
    authorityCode: 'AUTHORIZED',
    authorityReason: 'موقع الإجراء المحدد يطابق موقع المهمة، ودور المنفذ يجيز طلب الإغلاق فقط بعد اكتمال الدليل.',
    evidenceState: 'COMPLETE',
    evidenceLabel: '3/3 أدلة متاحة',
    verificationState: 'NOT_REQUESTED',
    verificationLabel: 'لم يبدأ التحقق المستقل',
    closureState: 'OPEN',
    closureLabel: 'لم يُطلب الإغلاق',
    nextAction: 'طلب الإغلاق',
    evidence: ['صورة المحمل بعد الاستبدال', 'قراءة اهتزاز بعد التشغيل', 'سجل اختبار تشغيل لمدة 20 دقيقة'],
    closureRule: 'طلب الإغلاق ينقل المهمة إلى تحقق مستقل ولا يغلقها نهائيًا.',
    lineage: 'المهمة الأصلية — لا توجد إعادة فتح سابقة',
    history: history(
      { code: 'REQUESTED', label: 'إنشاء الطلب', actor: 'مركز التشغيل', time: '08:10' },
      { code: 'VALIDATED', label: 'التحقق من النطاق والصلاحية', actor: 'منسق النطاق', time: '08:18' },
      { code: 'ASSIGNED', label: 'الإسناد', actor: 'مشرف الصيانة', time: '08:24' },
      { code: 'EXECUTED', label: 'تنفيذ العمل وإرفاق الدليل', actor: 'سارة الحربي', time: '09:06' }
    )
  }),
  'TSK-2048': Object.freeze({
    id: 'TSK-2048',
    title: 'إصلاح وصلة خط تغذية المياه',
    siteId: 'ops',
    site: 'مجمع العمليات',
    scope: 'ممر الخدمات — القطاع B',
    asset: 'UTIL-04',
    priority: 'عالية',
    priorityRank: 2,
    status: 'بانتظار التنفيذ',
    assignee: 'فريق المرافق',
    ownership: 'فريق المرافق',
    assignedToCurrentUser: false,
    authorityCode: 'AUTHORITY_DENIED',
    authorityReason: 'المهمة مرئية ضمن النطاق التشغيلي، لكن موقع الإجراء المحدد لا يطابق موقع المهمة. الرؤية لا تمنح صلاحية تنفيذ.',
    evidenceState: 'PENDING',
    evidenceLabel: 'دليل التنفيذ غير متاح بعد',
    verificationState: 'NOT_READY',
    verificationLabel: 'غير جاهز للتحقق',
    closureState: 'OPEN',
    closureLabel: 'مفتوحة',
    nextAction: 'بدء التنفيذ',
    evidence: ['صورة موقع التسرب قبل التنفيذ', 'قراءة ضغط ما قبل الإصلاح'],
    closureRule: 'لا يمكن طلب الإغلاق قبل التنفيذ وإرفاق دليل ما بعد الإصلاح.',
    lineage: 'المهمة الأصلية',
    history: history(
      { code: 'REQUESTED', label: 'إنشاء الطلب', actor: 'مركز التشغيل', time: '08:32' },
      { code: 'VALIDATED', label: 'تأكيد النطاق', actor: 'منسق النطاق', time: '08:38' },
      { code: 'ASSIGNED', label: 'الإسناد إلى فريق المرافق', actor: 'مشرف المرافق', time: '08:47' }
    )
  }),
  'TSK-2052': Object.freeze({
    id: 'TSK-2052',
    title: 'إعادة ضبط صمام التحكم بالضغط',
    siteId: 'hq',
    site: 'المقر الرئيسي',
    scope: 'غرفة الميكانيكا — الطابق 2',
    asset: 'PCV-18',
    priority: 'عالية',
    priorityRank: 3,
    status: 'الدليل ناقص',
    assignee: 'سارة الحربي',
    ownership: 'فريق المرافق الميكانيكية',
    assignedToCurrentUser: true,
    authorityCode: 'AUTHORIZED',
    authorityReason: 'صلاحية التنفيذ متاحة للموقع المحدد، لكن شرط الدليل يمنع طلب الإغلاق.',
    evidenceState: 'EVIDENCE_MISSING',
    evidenceLabel: 'EVIDENCE_MISSING — قراءة ما بعد الضبط مفقودة',
    verificationState: 'NOT_READY',
    verificationLabel: 'لا يمكن إرسالها للتحقق',
    closureState: 'OPEN',
    closureLabel: 'مفتوحة بسبب نقص الدليل',
    nextAction: 'استكمال الدليل',
    evidence: ['صورة موضع الصمام', 'قيمة الضبط المسجلة', 'قراءة ما بعد الضبط — مفقودة'],
    closureRule: 'غياب أي دليل مطلوب يبقي المهمة مفتوحة ولا يسمح بإظهارها كمغلقة.',
    lineage: 'المهمة الأصلية',
    history: history(
      { code: 'REQUESTED', label: 'إنشاء الطلب', actor: 'مركز التشغيل', time: '07:45' },
      { code: 'ASSIGNED', label: 'الإسناد', actor: 'مشرف المرافق', time: '07:52' },
      { code: 'EXECUTED', label: 'تنفيذ الضبط', actor: 'سارة الحربي', time: '08:40' },
      { code: 'EVIDENCE_MISSING', label: 'رصد نقص الدليل', actor: 'فحص ما قبل الإغلاق', time: '08:44' }
    )
  }),
  'TSK-2059': Object.freeze({
    id: 'TSK-2059',
    title: 'إعادة معايرة حساسَي الضغط',
    siteId: 'pump',
    site: 'محطة الضخ الشمالية',
    scope: 'لوحة القياس الرئيسية',
    asset: 'PT-19/20',
    priority: 'متوسطة',
    priorityRank: 4,
    status: 'إعادة عمل مطلوبة',
    assignee: 'فريق المعايرة',
    ownership: 'فريق المعايرة',
    assignedToCurrentUser: false,
    authorityCode: 'AUTHORIZED',
    authorityReason: 'بدء إعادة العمل يتطلب أن يكون موقع الإجراء المحدد هو محطة الضخ الشمالية.',
    evidenceState: 'COMPLETE',
    evidenceLabel: '4/4 أدلة متاحة',
    verificationState: 'VERIFICATION_REJECTED',
    verificationLabel: 'VERIFICATION_REJECTED — فرق القراءة أعلى من الحد',
    closureState: 'REWORK_REQUIRED',
    closureLabel: 'غير محلولة — إعادة عمل مطلوبة',
    nextAction: 'بدء إعادة العمل',
    evidence: ['شهادة المعايرة', 'قراءات مرجعية', 'قراءات تشغيلية', 'محضر نتيجة التحقق المرفوضة'],
    closureRule: 'رفض التحقق يعيد المهمة إلى مسار إعادة العمل ويحافظ على سجل الرفض السابق.',
    lineage: 'إعادة العمل RW-02 ← طلب الإغلاق CL-01 ← المهمة TSK-2017',
    history: history(
      { code: 'CLOSURE_REQUESTED', label: 'طلب الإغلاق', actor: 'فريق المعايرة', time: 'أمس 15:22' },
      { code: 'VERIFICATION_REJECTED', label: 'رفض التحقق المستقل', actor: 'فريق ضمان القياس', time: 'أمس 16:05' },
      { code: 'REWORK_CREATED', label: 'إنشاء إعادة العمل RW-02', actor: 'النظام التجريبي', time: 'أمس 16:06' }
    )
  }),
  'TSK-2063': Object.freeze({
    id: 'TSK-2063',
    title: 'تعديل نافذة صيانة لوحة التوزيع',
    siteId: 'hq',
    site: 'المقر الرئيسي',
    scope: 'غرفة الكهرباء E-03',
    asset: 'MDB-03',
    priority: 'متوسطة',
    priorityRank: 5,
    status: 'قرار معلّق',
    assignee: 'منسق الكهرباء',
    ownership: 'فريق الكهرباء',
    assignedToCurrentUser: false,
    authorityCode: 'DECISION_PENDING',
    authorityReason: 'التنفيذ متوقف حتى صدور قرار نافذة الصيانة؛ لا يجوز تجاوز القرار المعلّق.',
    evidenceState: 'COMPLETE',
    evidenceLabel: 'أدلة التقييم متاحة',
    verificationState: 'NOT_READY',
    verificationLabel: 'التحقق لاحق للتنفيذ',
    closureState: 'OPEN',
    closureLabel: 'مفتوحة',
    nextAction: 'انتظار القرار',
    evidence: ['تقييم الحمل', 'خطة العزل', 'مراجعة تأثير الخدمة'],
    closureRule: 'لا يبدأ التنفيذ ولا الإغلاق قبل حسم القرار المعلّق.',
    lineage: 'المهمة الأصلية',
    history: history(
      { code: 'REQUESTED', label: 'إنشاء الطلب', actor: 'فريق الكهرباء', time: '09:10' },
      { code: 'VALIDATED', label: 'تأكيد النطاق', actor: 'منسق النطاق', time: '09:18' },
      { code: 'DECISION_PENDING', label: 'إحالة قرار نافذة الصيانة', actor: 'منسق الكهرباء', time: '09:21' }
    )
  })
});
