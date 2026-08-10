export const APP_META = Object.freeze({
  product: 'RP02 — Enterprise Operations',
  surface: 'S01 — مركز الانتباه التنفيذي',
  syntheticNotice: 'بيانات تشغيلية اصطناعية لأغراض العرض والمراجعة فقط — ليست بيانات تشغيل حية.'
});

export const scopes = Object.freeze({
  central: {
    id: 'central',
    name: 'المنطقة الوسطى',
    subtitle: 'عرض متعدد المواقع دون منح صلاحية إجراء تلقائية',
    defaultSiteId: 'hq',
    pulse: { total: 23, critical: 4, verification: 7, actionable: 6 },
    records: ['hvac', 'leak', 'calibration', 'decision']
  },
  hq: {
    id: 'hq',
    name: 'نطاق المقر الرئيسي',
    subtitle: 'مبنى الخدمات الرئيسي',
    defaultSiteId: 'hq',
    pulse: { total: 8, critical: 2, verification: 2, actionable: 3 },
    records: ['hvac', 'decision']
  },
  operations: {
    id: 'operations',
    name: 'نطاق مجمع العمليات',
    subtitle: 'مبنى العمليات والمرافق',
    defaultSiteId: 'ops',
    pulse: { total: 6, critical: 1, verification: 1, actionable: 2 },
    records: ['leak', 'decision']
  },
  northPump: {
    id: 'northPump',
    name: 'نطاق محطة الضخ الشمالية',
    subtitle: 'محطة تشغيل وضخ المياه',
    defaultSiteId: 'pump',
    pulse: { total: 5, critical: 0, verification: 3, actionable: 1 },
    records: ['calibration']
  }
});

export const sites = Object.freeze([
  { id: 'hq', scopeId: 'hq', name: 'المقر الرئيسي', sub: 'مبنى الخدمات الرئيسي', state: 'حرج', count: 3, accent: '#c92b2b', summary: '2 حرجة · 1 قرار معلّق' },
  { id: 'ops', scopeId: 'operations', name: 'مجمع العمليات', sub: 'مبنى العمليات', state: 'تنبيه', count: 2, accent: '#e97713', summary: 'تسرب نشط · إجراء مطلوب' },
  { id: 'pump', scopeId: 'northPump', name: 'محطة الضخ الشمالية', sub: 'خط المياه الرئيسي', state: 'يتطلب تحققًا', count: 1, accent: '#bd8400', summary: 'إعادة معايرة بانتظار التحقق' },
  { id: 'warehouse', scopeId: 'central', name: 'المستودع المركزي', sub: 'مستودع المواد', state: 'تنبيه', count: 2, accent: '#e97713', summary: 'ملاحظتان تشغيليتان' },
  { id: 'dc', scopeId: 'central', name: 'مركز البيانات', sub: 'غرفة التحكم', state: 'طبيعي', count: 0, accent: '#21845a', summary: 'لا توجد أولوية حرجة' }
]);

const route = (site, signal, evidence, verification, decision, action, outcome) => ([
  { key: 'site', label: 'الموقع', ...site },
  { key: 'signal', label: 'الإشارة', ...signal },
  { key: 'evidence', label: 'الأدلة', ...evidence },
  { key: 'verification', label: 'التحقق', ...verification },
  { key: 'decision', label: 'القرار', ...decision },
  { key: 'action', label: 'الإجراء', ...action },
  { key: 'outcome', label: 'النتيجة', ...outcome }
]);

export const records = Object.freeze({
  hvac: {
    id: 'hvac', priority: 1, severity: 'critical', severityLabel: 'حرجة', filter: 'critical', accent: '#c92b2b',
    title: 'توقف وحدة مناولة الهواء', work: 'WO-1048', deviation: 'DEV-203', asset: 'AHU-07',
    site: 'المقر الرئيسي', siteId: 'hq', location: 'مبنى الخدمات الرئيسي', reason: 'ارتفاع حرارة متكرر وتجاوز حد الاهتزاز المسجل.',
    owner: 'فريق الصيانة الميكانيكية', ownerShort: 'الصيانة الميكانيكية', updated: 'منذ 8 دقائق',
    status: 'إيقاف جزئي للحماية', state: 'يتطلب إجراء', action: 'فتح تنفيذ الإصلاح',
    description: 'توقف كامل لوحدة AHU-07 لمدة 45 دقيقة بعد ارتفاع متكرر في درجة الحرارة وتجاوز حد الاهتزاز المسجل في المحمل.',
    impact: 'راحة حرارية متأثرة في منطقة واحدة', capacity: 'كفاءة تهوية منخفضة مؤقتًا',
    evidence: ['سجل اهتزاز آخر 30 دقيقة', 'صورتان من فحص المحمل', 'قراءة حرارة موثقة 86°C'],
    verification: '2 من 5 نقاط تحقق مكتملة. التحقق النهائي غير مكتمل ولا يمكن اعتبار الحالة مغلقة.',
    authority: 'فتح تنفيذ الإصلاح مسموح عند تطابق الموقع المحدد مع موقع السجل. الإغلاق النهائي يتطلب تحققًا مستقلًا بعد التنفيذ.',
    decision: 'إصلاح فوري ضمن صلاحية التشغيل الحالية',
    route: route(
      { value: 'AHU-07 — المقر الرئيسي', state: 'done', stateLabel: 'محدد' },
      { value: 'حرارة واهتزاز خارج الحد', state: 'active', stateLabel: 'نشطة' },
      { value: '3 عناصر موثقة', state: 'done', stateLabel: 'متاحة' },
      { value: '2/5 نقاط مكتملة', state: 'pending', stateLabel: 'قيد التحقق' },
      { value: 'إصلاح فوري', state: 'done', stateLabel: 'مسموح' },
      { value: 'فتح تنفيذ الإصلاح', state: 'pending', stateLabel: 'جاهز' },
      { value: 'تأكيد الإصلاح ثم المراقبة', state: 'blocked', stateLabel: 'لاحقًا' }
    )
  },
  leak: {
    id: 'leak', priority: 2, severity: 'high', severityLabel: 'عالية', filter: 'high', accent: '#e97713',
    title: 'تسرب مياه في خط التغذية', work: 'CA-221', deviation: 'DEV-118', asset: 'UTIL-04',
    site: 'مجمع العمليات', siteId: 'ops', location: 'ممر الخدمات — القطاع B', reason: 'تآكل ظاهر عند وصلة التغذية مع انخفاض ضغط محلي.',
    owner: 'فريق المرافق', ownerShort: 'المرافق', updated: 'منذ 22 دقيقة',
    status: 'عزل موضعي مطبق', state: 'يتطلب إجراء', action: 'مراجعة الطلب',
    description: 'تم رصد تسرب محدود في وصلة تغذية المياه داخل ممر الخدمات. جرى تطبيق عزل موضعي مؤقت لحماية المنطقة إلى حين اعتماد الإجراء التصحيحي.',
    impact: 'احتمال اتساع التسرب', capacity: 'الخدمة مستمرة عبر مسار بديل',
    evidence: ['صورة موثقة لموقع الوصلة', 'قراءة ضغط قبل العزل وبعده', 'ملاحظة فنية من فريق المرافق'],
    verification: 'تم التحقق من نجاح العزل المؤقت. لم يتم التحقق من الإصلاح الدائم بعد.',
    authority: 'المراجعة مسموحة عند تطابق الموقع المحدد مع السجل. تنفيذ استبدال الوصلة يتطلب اعتماد أمر العمل.',
    decision: 'طلب إصلاح تصحيحي بانتظار المراجعة',
    route: route(
      { value: 'مجمع العمليات — القطاع B', state: 'done', stateLabel: 'محدد' },
      { value: 'تسرب وانخفاض ضغط', state: 'done', stateLabel: 'موثقة' },
      { value: '3 عناصر مرفقة', state: 'done', stateLabel: 'متاحة' },
      { value: 'العزل المؤقت محقق', state: 'done', stateLabel: 'مكتمل' },
      { value: 'طلب إصلاح تصحيحي', state: 'active', stateLabel: 'بانتظار مراجعة' },
      { value: 'مراجعة الطلب', state: 'pending', stateLabel: 'مطلوب' },
      { value: 'تحقق بعد الاستبدال', state: 'blocked', stateLabel: 'لاحقًا' }
    )
  },
  calibration: {
    id: 'calibration', priority: 3, severity: 'medium', severityLabel: 'متوسطة', filter: 'medium', accent: '#bd8400',
    title: 'تأخر التحقق من حساسات الضغط', work: 'VR-312', deviation: 'DEV-054', asset: 'PT-19/20',
    site: 'محطة الضخ الشمالية', siteId: 'pump', location: 'لوحة القياس الرئيسية', reason: 'قراءات خارج نطاق المعايرة بعد صيانة مجدولة.',
    owner: 'فريق المعايرة', ownerShort: 'المعايرة', updated: 'منذ 45 دقيقة',
    status: 'التحقق غير مكتمل', state: 'يتطلب تحققًا', action: 'متابعة التحقق',
    description: 'أظهرت قراءات حساسي الضغط انحرافًا عن نطاق المعايرة بعد الصيانة المجدولة. لا توجد موافقة على إعادة الحساسين إلى الحالة النهائية قبل إكمال التحقق.',
    impact: 'موثوقية القياس منخفضة', capacity: 'التشغيل مستمر بقراءة احتياطية',
    evidence: ['شهادة معايرة سابقة', 'قراءات قبل الصيانة وبعدها', 'ملاحظة فنية من المختبر'],
    verification: 'إعادة التحقق مطلوبة. نتيجة التحقق السابقة مرفوضة بسبب فرق القراءة بين الحساس المرجعي والحساس التشغيلي.',
    authority: 'فريق المعايرة يرفع نتيجة التحقق؛ اعتماد الإغلاق النهائي يتم من جهة تحقق مستقلة.',
    decision: 'إعادة معايرة ثم تحقق مستقل',
    route: route(
      { value: 'محطة الضخ الشمالية', state: 'done', stateLabel: 'محدد' },
      { value: 'انحراف قراءة', state: 'done', stateLabel: 'موثقة' },
      { value: '3 قياسات مرتبطة', state: 'done', stateLabel: 'متاحة' },
      { value: 'النتيجة السابقة مرفوضة', state: 'active', stateLabel: 'إعادة تحقق' },
      { value: 'إعادة معايرة', state: 'done', stateLabel: 'محدد' },
      { value: 'متابعة التحقق', state: 'pending', stateLabel: 'مطلوب' },
      { value: 'اعتماد القراءة', state: 'blocked', stateLabel: 'لاحقًا' }
    )
  },
  decision: {
    id: 'decision', priority: 4, severity: 'low', severityLabel: 'منخفضة', filter: 'action', accent: '#557085',
    title: 'طلب اعتماد تغيير مؤقت في التشغيل', work: 'DEC-118', deviation: 'DEV-203', asset: 'CH-118',
    site: 'المقر الرئيسي', siteId: 'hq', location: 'مبنى الخدمات الرئيسي', reason: 'تغيير مؤقت في جدول التشغيل الليلي يحتاج قرارًا موثقًا.',
    owner: 'مكتب التشغيل', ownerShort: 'مكتب التشغيل', updated: 'منذ ساعة',
    status: 'قرار معلّق', state: 'إجراء مطلوب', action: 'عرض القرار',
    description: 'تم اقتراح تغيير مؤقت في جدول التشغيل الليلي لتخفيف الحمل خلال أعمال الصيانة. لا يُنفّذ التغيير قبل صدور قرار موثق ضمن حدود الصلاحية.',
    impact: 'تأثير محدود على جدول التشغيل', capacity: 'لا تغيير قبل اعتماد القرار',
    evidence: ['مقارنة الحمل الحالية', 'خطة التغيير المؤقت', 'ملاحظة مسؤول المناوبة'],
    verification: 'المعلومات التشغيلية مكتملة، لكن القرار لم يصدر بعد.',
    authority: 'مدير التشغيل مخول بالمراجعة عند تطابق الموقع المحدد. القرار يجب أن يُسجل صراحة ولا ينتج عن صلاحية المشاهدة وحدها.',
    decision: 'قرار معلّق بخصوص التغيير المؤقت',
    route: route(
      { value: 'المقر الرئيسي', state: 'done', stateLabel: 'محدد' },
      { value: 'حاجة لتغيير الجدول', state: 'done', stateLabel: 'موثقة' },
      { value: 'خطة وحمل تشغيلي', state: 'done', stateLabel: 'متاحة' },
      { value: 'المعلومات مكتملة', state: 'done', stateLabel: 'مكتمل' },
      { value: 'اعتماد التغيير المؤقت', state: 'active', stateLabel: 'معلّق' },
      { value: 'عرض القرار', state: 'pending', stateLabel: 'مطلوب' },
      { value: 'مراقبة الحمل', state: 'blocked', stateLabel: 'لاحقًا' }
    )
  }
});

export const filters = Object.freeze([
  { id: 'all', label: 'الكل' },
  { id: 'critical', label: 'حرجة' },
  { id: 'high', label: 'عالية' },
  { id: 'medium', label: 'متوسطة' },
  { id: 'action', label: 'إجراءات مطلوبة' }
]);

export const routeStageOrder = Object.freeze(['site', 'signal', 'evidence', 'verification', 'decision', 'action', 'outcome']);
