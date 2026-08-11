import { icon } from './icons.js';

const surfaceCopy = Object.freeze({
  sites: {
    title: 'المواقع والأصول',
    kicker: 'السياق المكاني والتشغيلي',
    description: 'تتبّع الموقع والأصل والصحة والأعمال المرتبطة مع إبقاء صلاحية الإجراء مستقلة عن نطاق الرؤية.'
  },
  performance: {
    title: 'الأداء ومؤشرات القياس',
    kicker: 'تعريف المؤشر ومصدره',
    description: 'راجع تعريف المؤشر ومصدره ونطاقه وحدوده ودليله قبل الانتقال من الملاحظة إلى القرار.'
  },
  decisions: {
    title: 'الانحرافات والقرارات',
    kicker: 'الانحراف إلى الإجراء',
    description: 'ثبّت الانحراف والدليل والصلاحية قبل القرار، ثم تابع الإجراء التصحيحي والنتيجة.'
  },
  reviews: {
    title: 'المراجعات والاعتمادات',
    kicker: 'فصل الأدوار والاعتماد',
    description: 'افصل بين مقدم الطلب والمنفذ والمراجع وصاحب الاعتماد مع حفظ حالة الرفض وإعادة العمل.'
  },
  reports: {
    title: 'التقارير والتدقيق',
    kicker: 'التسلسل وقابلية التتبع',
    description: 'راجع الأحداث بترتيبها الزمني وتتبع صلتها بالأعمال والأدلة والقرارات والتحقق.'
  },
  administration: {
    title: 'الإدارة والوصول',
    kicker: 'الوصول والدور والتفويض',
    description: 'ميّز بين فئة الوصول إلى التطبيق والدور التشغيلي والتفويض وصلاحية تنفيذ الإجراء.'
  }
});

const navItems = Object.freeze([
  { id: 'attention', label: 'الانتباه', href: './index.html', icon: 'attention' },
  { id: 'work', label: 'الأعمال', href: './work-queue.html', icon: 'work' },
  { id: 'sites', label: 'المواقع', href: './operations.html?surface=sites', icon: 'sites' },
  { id: 'performance', label: 'الأداء', href: './operations.html?surface=performance', icon: 'reports' },
  { id: 'decisions', label: 'القرارات', href: './operations.html?surface=decisions', icon: 'decisions' },
  { id: 'reviews', label: 'المراجعات', href: './operations.html?surface=reviews', icon: 'verification' },
  { id: 'reports', label: 'التقارير', href: './operations.html?surface=reports', icon: 'reports' },
  { id: 'administration', label: 'الإدارة', href: './operations.html?surface=administration', icon: 'settings' }
]);

const textReplacements = Object.freeze([
  ['Focus / Authority Aperture', 'تفاصيل الانتباه والصلاحية'],
  ['Authority Aperture', 'حد الصلاحية'],
  ['Focus Task', 'المهمة المحددة'],
  ['Work Control / S02', 'ضبط الأعمال'],
  ['Lineage / History', 'التسلسل والسجل'],
  ['Lineage', 'تسلسل السجل'],
  ['Requester ≠ Executor ≠ Reviewer / Verifier ≠ Approver ≠ Auditor.', 'مقدم الطلب ≠ المنفذ ≠ المراجع ≠ صاحب الاعتماد ≠ المدقق.'],
  ['Admin presentation أو دور Approver لا يمنحان حق تجاوز مرحلة المراجع.', 'فئة الإدارة أو دور الاعتماد لا يتجاوزان مرحلة المراجعة المستقلة.'],
  ['GUEST / AUTHENTICATED_USER / ADMIN منفصلة عن الأدوار التشغيلية.', 'فئة الوصول إلى التطبيق مستقلة عن الأدوار التشغيلية.'],
  ['Measure → Detect → Validate → Decide → Act → Monitor', 'القياس ← الكشف ← التحقق ← القرار ← الإجراء ← المتابعة'],
  ['تجاوز KPI لا يتحول تلقائيًا إلى قرار أو إجراء.', 'تجاوز المؤشر يحتاج تحققًا وصلاحية قبل القرار أو الإجراء.'],
  ['علاقات مباشرة بالعمل وKPI والانحراف دون تحويل السطح إلى معرض بطاقات.', 'ترابط مباشر مع الأعمال والمؤشرات والانحرافات المرتبطة.'],
  ['Central Region', 'المنطقة الوسطى'],
  ['تعريفات KPI', 'مؤشرات معرّفة'],
  ['أصول اصطناعية', 'أصول ضمن العرض'],
  ['قيم اصطناعية للفترة الحالية.', 'قيم توضيحية للفترة الحالية.'],
  ['لا توجد عملية PDF أو تصدير خادمي في هذه الموجة؛ العرض الحالي داخل المتصفح فقط.', 'السجل الحالي مخصص للقراءة والتتبع داخل النظام.'],
  ['محاكاة داخل الذاكرة فقط. لا يوجد backend أو حفظ دائم أو إغلاق نهائي تلقائي.', 'طلب الإغلاق لا يصبح نهائيًا قبل التحقق المستقل.'],
  ['محاكاة واجهة فقط — لا يتم تغيير أي سجل أو نظام فعلي.', 'إجراء توضيحي ضمن جلسة العرض.'],
  ['ACTION_SIMULATED — تمت محاكاة الإجراء داخل التطبيق فقط، ولم تتغير أي حالة تشغيلية حقيقية.', 'ACTION_RECORDED — سُجل الإجراء توضيحيًا ضمن جلسة العرض.'],
  ['جميع السجلات اصطناعية لأغراض المراجعة فقط.', 'بيانات توضيحية'],
  ['البيانات اصطناعية، ولا توجد مزامنة أو تخزين خلفي.', 'بيانات توضيحية'],
  ['جميع البيانات والسجلات المعروضة اصطناعية لأغراض المراجعة فقط — لا توجد بيانات تشغيل حية أو تكاملات خارجية.', 'بيانات توضيحية'],
  ['جميع سجلات الأعمال والأدلة المعروضة اصطناعية لأغراض المراجعة فقط — لا توجد بيانات تشغيل حية أو عمليات رفع فعلية.', 'بيانات توضيحية'],
  ['بيانات تشغيلية اصطناعية لأغراض العرض والمراجعة فقط — ليست بيانات تشغيل حية.', 'بيانات توضيحية'],
  ['حالة تحميل تمثيلية؛ لا توجد شبكة أو API خلفية.', 'يتم تجهيز البيانات المتاحة لهذا العرض.'],
  ['حالة خطأ تمثيلية محلية', 'تعذر تجهيز هذا العرض'],
  ['تم تسجيل القرار الاصطناعي', 'تم تسجيل القرار التوضيحي'],
  ['تسجيل قرار اصطناعي', 'تسجيل القرار'],
  ['تم الاعتماد الاصطناعي', 'تم تسجيل الاعتماد'],
  ['تمت محاكاة الاعتماد', 'تم تسجيل الاعتماد'],
  ['تمت محاكاة تثبيت التحقق', 'تم تثبيت التحقق'],
  ['تمت محاكاة بدء إعادة العمل', 'تم بدء إعادة العمل'],
  ['تمت محاكاة طلب الإغلاق', 'تم تسجيل طلب الإغلاق'],
  ['تمت محاكاة', 'تم تسجيل'],
  ['اصطناعية', 'توضيحية'],
  ['اصطناعي', 'توضيحي'],
  ['synthetic', 'illustrative']
]);

function installStyle() {
  if (document.querySelector('link[data-portfolio-polish]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './portfolio-polish.css';
  link.dataset.portfolioPolish = 'true';
  document.head.append(link);
}

function currentSurface() {
  if (document.body.classList.contains('s02-page')) return 'work';
  if (document.body.classList.contains('completion-page')) {
    return new URLSearchParams(window.location.search).get('surface') || 'sites';
  }
  return 'attention';
}

function navMarkup(items, active, className, iconOnly = false) {
  return items.map((item) => {
    const selected = item.id === active;
    const iconMarkup = `<span aria-hidden="true">${icon(item.icon, 18)}</span>`;
    return `<a class="${className}${selected ? ' active' : ''}" href="${item.href}"${selected ? ' aria-current="page"' : ''}${iconOnly ? ` aria-label="${item.label}"` : ''}>${iconMarkup}${iconOnly ? '' : `<span>${item.label}</span>`}</a>`;
  }).join('');
}

function refineLegacyNavigation() {
  const top = document.querySelector('.top-nav');
  if (!top) return;
  const active = currentSurface();
  top.innerHTML = navMarkup(navItems, active, 'nav-btn');

  const rail = document.querySelector('.left-rail');
  if (rail) rail.innerHTML = navMarkup(navItems, active, 'rail-btn', true);

  const mobile = document.querySelector('.mobile-bar');
  if (mobile) {
    const mobileItems = [navItems[0], navItems[1], navItems[2], navItems[4], navItems[7]];
    mobile.innerHTML = navMarkup(mobileItems, active, 'mobile-tab');
  }
}

function refineBrand() {
  const brandTitle = document.querySelector('.brand-title');
  const brandSub = document.querySelector('.brand-sub');
  if (brandTitle) brandTitle.textContent = 'Enterprise Operations';
  if (brandSub) brandSub.textContent = currentSurface() === 'work' ? 'قائمة الأعمال' : 'مركز الانتباه التنفيذي';

  const completionBrand = document.querySelector('.completion-brand strong');
  if (completionBrand) completionBrand.textContent = 'Enterprise Operations';

  const userRole = document.querySelector('.user-role');
  if (userRole) userRole.textContent = 'مدير التشغيل';
  const completionUserRole = document.querySelector('.completion-user small');
  if (completionUserRole) completionUserRole.textContent = 'مدير التشغيل';

  document.querySelectorAll('[aria-label*="المستخدم التجريبي الحالي"]').forEach((node) => {
    node.setAttribute('aria-label', node.getAttribute('aria-label').replace('المستخدم التجريبي الحالي:', 'المستخدم الحالي:'));
  });
}

function refineS01() {
  if (currentSurface() !== 'attention') return;
  document.title = 'Enterprise Operations — مركز الانتباه التنفيذي';
  const notice = document.getElementById('syntheticNotice');
  if (notice) notice.textContent = 'بيانات توضيحية';
  const focusHeading = document.getElementById('focusHeading');
  if (focusHeading) focusHeading.textContent = 'تفاصيل الانتباه والصلاحية';
  const actionNote = document.getElementById('actionNote');
  if (actionNote) actionNote.textContent = 'إجراء توضيحي ضمن جلسة العرض.';
  const siteNote = document.querySelector('.site-strip-head p');
  if (siteNote) siteNote.textContent = 'اختيار الموقع يغيّر سياق المتابعة ولا يوسّع صلاحية الإجراء.';
}

function refineS02() {
  if (currentSurface() !== 'work') return;
  document.title = 'Enterprise Operations — قائمة الأعمال';
  const notice = document.getElementById('syntheticNotice');
  if (notice) notice.textContent = 'بيانات توضيحية';
  const eyebrow = document.querySelector('.s02-title .eyebrow');
  if (eyebrow) eyebrow.textContent = 'ضبط الأعمال';
  const intro = document.querySelector('.s02-title p');
  if (intro) intro.textContent = 'رتّب العمل حسب الأولوية، وافصل بين نطاق الرؤية وصلاحية الإجراء للمهمة المحددة.';
  const kicker = document.querySelector('.focus-kicker');
  if (kicker) kicker.textContent = 'المهمة المحددة';
  const footerNote = document.querySelector('.queue-footer span:last-child');
  if (footerNote) footerNote.textContent = 'بيانات توضيحية';
}

function refineCompletionShell() {
  if (!document.body.classList.contains('completion-page')) return;
  const id = currentSurface();
  const copy = surfaceCopy[id] || surfaceCopy.sites;
  document.title = `Enterprise Operations — ${copy.title}`;

  const surfaceEyebrow = document.getElementById('surfaceEyebrow');
  const surfaceCode = document.getElementById('surfaceCode');
  const surfaceDescription = document.getElementById('surfaceDescription');
  if (surfaceEyebrow) surfaceEyebrow.textContent = copy.kicker;
  if (surfaceCode) surfaceCode.textContent = copy.kicker;
  if (surfaceDescription) surfaceDescription.textContent = copy.description;

  const notice = document.getElementById('completionSynthetic');
  if (notice) notice.textContent = 'بيانات توضيحية';
  const boundary = document.getElementById('completionBoundary');
  if (boundary) boundary.innerHTML = '<strong>حد الصلاحية:</strong> الرؤية عبر المواقع لا تمنح التنفيذ أو القرار أو الاعتماد. الصلاحية تُقيَّم حسب الموقع والدور والدليل والحالة.';

  const heroMeta = document.querySelector('.completion-hero-meta');
  if (heroMeta) {
    const span = heroMeta.querySelector('span');
    const small = heroMeta.querySelector('small');
    if (span) span.textContent = 'النطاق التشغيلي';
    if (small) small.textContent = 'الرؤية لا تعني صلاحية الإجراء';
  }

  document.querySelectorAll('.completion-nav .nav-code').forEach((node) => node.setAttribute('aria-hidden', 'true'));
}

function replaceText(value) {
  let next = String(value);
  for (const [from, to] of textReplacements) next = next.split(from).join(to);
  next = next.replace(/\bRP02\b\s*[—\-/]?\s*/g, '');
  next = next.replace(/\bS0[1-8]\b\s*[—\-/]?\s*/g, '');
  next = next.replace(/\s{2,}/g, ' ');
  return next;
}

function sanitizeVisibleText(root = document.body) {
  if (!root) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      return node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const next = replaceText(node.nodeValue);
    if (next !== node.nodeValue) node.nodeValue = next;
  }

  const factLabels = new Map([
    ['Source', 'المصدر'], ['Scope', 'النطاق'], ['Period', 'الفترة'], ['Owner', 'المالك'],
    ['Target', 'الهدف'], ['Threshold', 'الحد'], ['Current observation', 'الملاحظة الحالية'],
    ['Evidence / lineage', 'الدليل / التسلسل'], ['KPI → Deviation', 'المؤشر ← الانحراف'],
    ['Deviation → Decision', 'الانحراف ← القرار'], ['Task → Verification', 'المهمة ← التحقق'],
    ['Rework lineage', 'تسلسل إعادة العمل']
  ]);
  root.querySelectorAll?.('.fact span').forEach((node) => {
    if (factLabels.has(node.textContent.trim())) node.textContent = factLabels.get(node.textContent.trim());
  });
}

let scheduled = false;
function refresh() {
  scheduled = false;
  refineBrand();
  refineS01();
  refineS02();
  refineCompletionShell();
  sanitizeVisibleText();
  document.documentElement.dataset.portfolioReady = 'true';
}

function scheduleRefresh() {
  if (scheduled) return;
  scheduled = true;
  window.requestAnimationFrame(refresh);
}

installStyle();
refineLegacyNavigation();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleRefresh, { once: true });
} else {
  scheduleRefresh();
}

const observer = new MutationObserver(scheduleRefresh);
observer.observe(document.documentElement, { subtree:true, childList:true, characterData:true });
