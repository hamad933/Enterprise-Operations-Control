export const COMPLETION_META = Object.freeze({
  product: 'RP02 — Enterprise Operations',
  syntheticNotice: 'جميع البيانات والسجلات المعروضة اصطناعية لأغراض المراجعة فقط — لا توجد بيانات تشغيل حية أو تكاملات خارجية.'
});

export const surfaces = Object.freeze([
  { id: 'sites', code: 'S03', label: 'المواقع والأصول', eyebrow: 'Sites & Assets', title: 'المواقع والأصول', description: 'سياق تشغيلي هرمي يربط الموقع والأصل بالصحة والعمل والانحرافات مع فصل الرؤية عن سلطة الإجراء.' },
  { id: 'performance', code: 'S04', label: 'الأداء والمؤشرات', eyebrow: 'Performance & KPIs', title: 'الأداء ومؤشرات القياس', description: 'تعريفات KPI قابلة للتدقيق تربط المصدر والنطاق والفترة والمالك والهدف والحد والملاحظة والدليل.' },
  { id: 'decisions', code: 'S05', label: 'الانحرافات والقرارات', eyebrow: 'Deviations & Decisions', title: 'الانحرافات والقرارات', description: 'تحكم متدرج من كشف الانحراف والتحقق منه إلى القرار والإجراء التصحيحي ومراقبة النتيجة.' },
  { id: 'reviews', code: 'S06', label: 'المراجعات والاعتمادات', eyebrow: 'Reviews & Approvals', title: 'المراجعات والاعتمادات', description: 'فصل فعلي بين مقدم الطلب والمنفذ والمراجع والموافق والمراقب مع حفظ lineage لإعادة العمل والرفض.' },
  { id: 'reports', code: 'S07', label: 'التقارير والتدقيق', eyebrow: 'Reports & Audit', title: 'التقارير والتدقيق', description: 'خط زمني تدقيقي مترابط يحفظ تسلسل الأحداث والقرارات والأدلة والتحقق وحدود السلطة.' },
  { id: 'administration', code: 'S08', label: 'الإدارة والوصول', eyebrow: 'Administration & Access', title: 'الإدارة والوصول', description: 'سياق تنظيمي ونطاقات وصول وتفويض ومسؤوليات دون تحويل صلاحية Admin إلى سلطة تشغيلية تلقائية.' }
]);

export const sites = Object.freeze([
  { id: 'hq', name: 'المقر الرئيسي', branch: 'الرياض — الإدارة المركزية', health: 'حرج', healthCode: 'CRITICAL', owner: 'إدارة المرافق', assets: 18, openWork: 4, deviations: 2, kpis: 6, actionAuthority: true },
  { id: 'ops', name: 'مجمع العمليات', branch: 'الرياض — مجمع التشغيل', health: 'تنبيه', healthCode: 'WARNING', owner: 'فريق العمليات', assets: 14, openWork: 3, deviations: 1, kpis: 5, actionAuthority: false },
  { id: 'pump', name: 'محطة الضخ الشمالية', branch: 'المنطقة الوسطى — شمال', health: 'تحت التحقق', healthCode: 'VERIFY', owner: 'فريق المرافق', assets: 9, openWork: 2, deviations: 2, kpis: 4, actionAuthority: false },
  { id: 'warehouse', name: 'المستودع المركزي', branch: 'الرياض — الخدمات اللوجستية', health: 'طبيعي', healthCode: 'NORMAL', owner: 'الخدمات اللوجستية', assets: 11, openWork: 1, deviations: 0, kpis: 3, actionAuthority: false }
]);

export const assets = Object.freeze([
  { id: 'AHU-07', siteId: 'hq', name: 'وحدة مناولة الهواء 07', type: 'HVAC', status: 'تحت إجراء تصحيحي', health: 62, owner: 'الصيانة الميكانيكية', work: 'TSK-2041', deviation: 'DEV-203', kpi: 'KPI-HVAC-04', history: ['09:06 — دليل ما بعد الاستبدال مرفق', '08:24 — إسناد المهمة TSK-2041', '08:10 — رصد تجاوز الاهتزاز'] },
  { id: 'MDB-03', siteId: 'hq', name: 'لوحة التوزيع الرئيسية 03', type: 'Electrical', status: 'قرار نافذة صيانة معلّق', health: 78, owner: 'فريق الكهرباء', work: 'TSK-2063', deviation: 'DEV-198', kpi: 'KPI-ELC-02', history: ['09:21 — DECISION_PENDING', '09:18 — تأكيد النطاق', '09:10 — إنشاء الطلب'] },
  { id: 'UTIL-04', siteId: 'ops', name: 'خط تغذية المياه 04', type: 'Utility', status: 'عرض فقط لهذا المستخدم', health: 71, owner: 'فريق المرافق', work: 'TSK-2048', deviation: 'DEV-118', kpi: 'KPI-WTR-03', history: ['08:47 — إسناد لفريق المرافق', '08:38 — تأكيد النطاق', '08:32 — إنشاء الطلب'] },
  { id: 'PT-19/20', siteId: 'pump', name: 'حساسا الضغط 19/20', type: 'Instrumentation', status: 'إعادة عمل مطلوبة', health: 66, owner: 'فريق المعايرة', work: 'TSK-2059', deviation: 'DEV-054', kpi: 'KPI-PRS-01', history: ['أمس 16:06 — إنشاء RW-02', 'أمس 16:05 — VERIFICATION_REJECTED', 'أمس 15:22 — طلب إغلاق CL-01'] }
]);

export const kpis = Object.freeze([
  { id: 'KPI-HVAC-04', name: 'استقرار اهتزاز وحدات التهوية', unit: 'mm/s', source: 'قراءات حساسات اصطناعية + سجل فحص', scope: 'المقر الرئيسي / AHU', period: 'آخر 24 ساعة', owner: 'هندسة المرافق', target: '≤ 4.5', threshold: '> 6.0', current: '6.8', status: 'DEVIATION', trend: [4.2,4.5,5.1,5.8,6.2,6.8], evidence: 'EV-KPI-441', lineage: 'SRC-HVAC-09 → OBS-771 → KPI-HVAC-04', deviation: 'DEV-203' },
  { id: 'KPI-WTR-03', name: 'استقرار ضغط شبكة المياه', unit: 'bar', source: 'قراءات خط اصطناعية', scope: 'مجمع العمليات / شبكة المياه', period: 'وردية صباحية', owner: 'فريق المرافق', target: '4.8–5.2', threshold: '< 4.4', current: '4.3', status: 'DEVIATION', trend: [5.0,4.9,4.8,4.6,4.5,4.3], evidence: 'EV-KPI-378', lineage: 'SRC-WTR-04 → OBS-663 → KPI-WTR-03', deviation: 'DEV-118' },
  { id: 'KPI-PRS-01', name: 'موثوقية قراءات الضغط', unit: '%', source: 'نتائج معايرة اصطناعية', scope: 'محطة الضخ الشمالية / PT-19/20', period: 'دورة معايرة حالية', owner: 'ضمان القياس', target: '≥ 98%', threshold: '< 95%', current: '93.4%', status: 'VALIDATION_REQUIRED', trend: [99.1,98.7,98.2,96.4,94.8,93.4], evidence: 'EV-KPI-219', lineage: 'CAL-PT-19/20 → OBS-547 → KPI-PRS-01', deviation: 'DEV-054' },
  { id: 'KPI-SLA-02', name: 'الالتزام بزمن الاستجابة', unit: '%', source: 'سجل مهام اصطناعي', scope: 'المنطقة الوسطى', period: 'أغسطس 2026', owner: 'مركز التشغيل', target: '≥ 92%', threshold: '< 88%', current: '94.1%', status: 'NORMAL', trend: [91.8,92.4,93.0,92.8,93.6,94.1], evidence: 'EV-KPI-510', lineage: 'TASK-LOG → AGG-2026-08 → KPI-SLA-02', deviation: null }
]);

export const deviations = Object.freeze([
  { id: 'DEV-203', title: 'اهتزاز AHU-07 أعلى من الحد', siteId: 'hq', scope: 'المقر الرئيسي / AHU-07', sourceKpi: 'KPI-HVAC-04', validation: 'VALIDATED', evidence: 'EV-KPI-441 + EV-MECH-122', authority: 'AUTHORIZED', decision: 'DECISION_PENDING', outcome: 'بانتظار اعتماد نافذة الإجراء', correctiveAction: 'CA-311', owner: 'هندسة المرافق', due: '11 أغسطس 2026 · 14:30', overdue: false, history: ['10:02 — VALIDATED', '09:54 — EV-MECH-122 linked', '09:41 — DETECTED'] },
  { id: 'DEV-118', title: 'انخفاض ضغط خط التغذية', siteId: 'ops', scope: 'مجمع العمليات / UTIL-04', sourceKpi: 'KPI-WTR-03', validation: 'VALIDATED', evidence: 'EV-KPI-378', authority: 'AUTHORITY_DENIED', decision: 'DECISION_PENDING', outcome: 'يتطلب صاحب سلطة من الموقع', correctiveAction: 'CA-221', owner: 'فريق المرافق', due: '11 أغسطس 2026 · 13:00', overdue: false, history: ['09:48 — AUTHORITY_DENIED للمستخدم الحالي', '09:32 — VALIDATED', '09:20 — DETECTED'] },
  { id: 'DEV-054', title: 'فرق معايرة حساسَي الضغط', siteId: 'pump', scope: 'محطة الضخ / PT-19/20', sourceKpi: 'KPI-PRS-01', validation: 'EVIDENCE_MISSING', evidence: 'شهادة مرجعية ناقصة', authority: 'OUT_OF_SCOPE', decision: 'DECISION_PENDING', outcome: 'لا قرار قبل اكتمال الدليل', correctiveAction: 'RW-02', owner: 'فريق المعايرة', due: '10 أغسطس 2026 · 18:00', overdue: true, history: ['أمس 16:06 — RW-02 created', 'أمس 16:05 — VERIFICATION_REJECTED', 'أمس 15:22 — closure requested'] },
  { id: 'DEV-244', title: 'تعارض مسؤولية إجراء كهربائي', siteId: 'hq', scope: 'المقر الرئيسي / MDB-03', sourceKpi: 'KPI-ELC-02', validation: 'VALIDATED', evidence: 'EV-ELC-900', authority: 'CONFLICT', decision: 'DECISION_PENDING', outcome: 'التعارض يمنع الحسم', correctiveAction: null, owner: 'منسق الكهرباء', due: '12 أغسطس 2026 · 09:00', overdue: false, history: ['10:21 — CONFLICT detected', '10:12 — VALIDATED', '10:01 — DETECTED'] }
]);

export const reviews = Object.freeze([
  { id: 'REV-901', type: 'تحقق إغلاق', subject: 'TSK-2041', siteId: 'hq', requester: 'سارة الحربي', executor: 'سارة الحربي', reviewer: 'فريق ضمان الصيانة', approver: 'مدير التشغيل', currentActor: 'المستخدم الحالي — مدير التشغيل', state: 'PENDING_VERIFICATION', authority: 'AUTHORITY_DENIED', reason: 'مرحلة التحقق تخص Reviewer مستقلًا؛ Approver لا يتجاوز دور المراجع.', evidence: 'EV-MECH-122', lineage: 'TSK-2041 → CL-02 → REV-901' },
  { id: 'REV-884', type: 'اعتماد قرار', subject: 'DEV-203', siteId: 'hq', requester: 'هندسة المرافق', executor: 'منسق القرار', reviewer: 'مراجع المخاطر', approver: 'مدير التشغيل', currentActor: 'المستخدم الحالي — مدير التشغيل', state: 'READY_FOR_APPROVAL', authority: 'AUTHORIZED', reason: 'التحقق السابق مكتمل والمستخدم يحمل سلطة الاعتماد لهذه الحالة فقط.', evidence: 'EV-KPI-441 + EV-MECH-122', lineage: 'KPI-HVAC-04 → DEV-203 → DEC-302 → REV-884' },
  { id: 'REV-812', type: 'إعادة عمل بعد رفض', subject: 'TSK-2059', siteId: 'pump', requester: 'فريق المعايرة', executor: 'فريق المعايرة', reviewer: 'ضمان القياس', approver: 'رئيس الهندسة', currentActor: 'المستخدم الحالي — مدير التشغيل', state: 'VERIFICATION_REJECTED', authority: 'OUT_OF_SCOPE', reason: 'الرفض يبقى غير محلول؛ إعادة العمل RW-02 تحافظ على lineage ولا تمنح صلاحية خارج الموقع.', evidence: 'EV-CAL-552', lineage: 'TSK-2017 → CL-01 → VERIFICATION_REJECTED → RW-02' }
]);

export const auditEvents = Object.freeze([
  { id: 'AUD-1107', time: '11 أغسطس 2026 · 10:21', type: 'AUTHORITY_CONFLICT', subject: 'DEV-244', actor: 'Policy evaluator — synthetic', detail: 'رصد تعارض بين مسؤولية الموقع وحد سلطة القرار.', link: 'DEV-244' },
  { id: 'AUD-1106', time: '11 أغسطس 2026 · 10:02', type: 'VALIDATION', subject: 'DEV-203', actor: 'مراجع الانحراف', detail: 'تثبيت الانحراف بعد اكتمال الأدلة المطلوبة.', link: 'EV-MECH-122' },
  { id: 'AUD-1105', time: '11 أغسطس 2026 · 09:48', type: 'AUTHORITY_DENIED', subject: 'DEV-118', actor: 'المستخدم الحالي', detail: 'محاولة فتح قرار على موقع غير مخول لهذا المستخدم.', link: 'DEV-118' },
  { id: 'AUD-1104', time: '11 أغسطس 2026 · 09:21', type: 'DECISION_PENDING', subject: 'TSK-2063', actor: 'منسق الكهرباء', detail: 'إحالة نافذة الصيانة إلى صاحب سلطة القرار.', link: 'DEC-118' },
  { id: 'AUD-1103', time: '10 أغسطس 2026 · 16:06', type: 'REWORK_CREATED', subject: 'TSK-2059', actor: 'النظام التجريبي', detail: 'إنشاء RW-02 مع حفظ رفض التحقق السابق.', link: 'RW-02' },
  { id: 'AUD-1102', time: '10 أغسطس 2026 · 16:05', type: 'VERIFICATION_REJECTED', subject: 'TSK-2059', actor: 'فريق ضمان القياس', detail: 'رفض التحقق بسبب فرق قراءة أعلى من الحد.', link: 'EV-CAL-552' }
]);

export const accessProfiles = Object.freeze([
  { id: 'USR-001', name: 'أحمد الحسيني', appClass: 'AUTHENTICATED_USER', operationalRoles: ['Operations Manager'], sitesVisible: ['hq','ops','pump','warehouse'], actionSites: ['hq'], delegations: ['DEL-009'], admin: false },
  { id: 'USR-014', name: 'نورة السالم', appClass: 'AUTHENTICATED_USER', operationalRoles: ['Verifier'], sitesVisible: ['hq','pump'], actionSites: ['pump'], delegations: [], admin: false },
  { id: 'USR-099', name: 'مسؤول النظام التجريبي', appClass: 'ADMIN', operationalRoles: ['Access Administrator'], sitesVisible: ['hq','ops','pump','warehouse'], actionSites: [], delegations: [], admin: true }
]);

export const delegations = Object.freeze([
  { id: 'DEL-009', from: 'مدير المرافق', to: 'أحمد الحسيني', role: 'Decision Approver', scope: 'المقر الرئيسي فقط', expires: '11 أغسطس 2026 · 17:00', status: 'ACTIVE' },
  { id: 'DEL-012', from: 'رئيس ضمان القياس', to: 'نورة السالم', role: 'Verifier', scope: 'محطة الضخ الشمالية', expires: '12 أغسطس 2026 · 12:00', status: 'ACTIVE' }
]);
