import { icon } from './icons.js';

const surfaces = {
  sites:['المواقع والأصول','السياق المكاني والتشغيلي','تتبّع الموقع والأصل والصحة والأعمال المرتبطة مع إبقاء صلاحية الإجراء مستقلة عن نطاق الرؤية.'],
  performance:['الأداء ومؤشرات القياس','تعريف المؤشر ومصدره','راجع تعريف المؤشر ومصدره ونطاقه وحدوده ودليله قبل الانتقال من الملاحظة إلى القرار.'],
  decisions:['الانحرافات والقرارات','الانحراف إلى الإجراء','ثبّت الانحراف والدليل والصلاحية قبل القرار، ثم تابع الإجراء التصحيحي والنتيجة.'],
  reviews:['المراجعات والاعتمادات','فصل الأدوار والاعتماد','افصل بين مقدم الطلب والمنفذ والمراجع وصاحب الاعتماد مع حفظ حالة الرفض وإعادة العمل.'],
  reports:['التقارير والتدقيق','التسلسل وقابلية التتبع','راجع الأحداث بترتيبها الزمني وتتبع صلتها بالأعمال والأدلة والقرارات والتحقق.'],
  administration:['الإدارة والوصول','الوصول والدور والتفويض','ميّز بين فئة الوصول إلى التطبيق والدور التشغيلي والتفويض وصلاحية تنفيذ الإجراء.']
};

const nav = [
  ['attention','الانتباه','./index.html','attention'],
  ['work','الأعمال','./work-queue.html','work'],
  ['sites','المواقع','./operations.html?surface=sites','sites'],
  ['performance','الأداء','./operations.html?surface=performance','reports'],
  ['decisions','القرارات','./operations.html?surface=decisions','decisions'],
  ['reviews','المراجعات','./operations.html?surface=reviews','verification'],
  ['reports','التقارير','./operations.html?surface=reports','reports'],
  ['administration','الإدارة','./operations.html?surface=administration','settings']
];

const replacements = [
  ['Focus / Authority Aperture','تفاصيل الانتباه والصلاحية'],
  ['Authority Aperture','حد الصلاحية'],
  ['Focus Task','المهمة المحددة'],
  ['Work Control / S02','ضبط الأعمال'],
  ['Lineage / History','التسلسل والسجل'],
  ['Lineage','تسلسل السجل'],
  ['Requester ≠ Executor ≠ Reviewer / Verifier ≠ Approver ≠ Auditor.','مقدم الطلب ≠ المنفذ ≠ المراجع ≠ صاحب الاعتماد ≠ المدقق.'],
  ['Admin presentation أو دور Approver لا يمنحان حق تجاوز مرحلة المراجع.','فئة الإدارة أو دور الاعتماد لا يتجاوزان مرحلة المراجعة المستقلة.'],
  ['GUEST / AUTHENTICATED_USER / ADMIN منفصلة عن الأدوار التشغيلية.','فئة الوصول إلى التطبيق مستقلة عن الأدوار التشغيلية.'],
  ['Measure → Detect → Validate → Decide → Act → Monitor','القياس ← الكشف ← التحقق ← القرار ← الإجراء ← المتابعة'],
  ['تجاوز KPI لا يتحول تلقائيًا إلى قرار أو إجراء.','تجاوز المؤشر يحتاج تحققًا وصلاحية قبل القرار أو الإجراء.'],
  ['علاقات مباشرة بالعمل وKPI والانحراف دون تحويل السطح إلى معرض بطاقات.','ترابط مباشر مع الأعمال والمؤشرات والانحرافات المرتبطة.'],
  ['Central Region','المنطقة الوسطى'],
  ['تعريفات KPI','مؤشرات معرّفة'],
  ['أصول اصطناعية','أصول ضمن العرض'],
  ['قيم اصطناعية للفترة الحالية.','قيم توضيحية للفترة الحالية.'],
  ['لا توجد عملية PDF أو تصدير خادمي في هذه الموجة؛ العرض الحالي داخل المتصفح فقط.','السجل الحالي مخصص للقراءة والتتبع داخل النظام.'],
  ['محاكاة داخل الذاكرة فقط. لا يوجد backend أو حفظ دائم أو إغلاق نهائي تلقائي.','طلب الإغلاق لا يصبح نهائيًا قبل التحقق المستقل.'],
  ['محاكاة واجهة فقط — لا يتم تغيير أي سجل أو نظام فعلي.','إجراء توضيحي ضمن جلسة العرض.'],
  ['ACTION_SIMULATED — تمت محاكاة الإجراء داخل التطبيق فقط، ولم تتغير أي حالة تشغيلية حقيقية.','ACTION_RECORDED — سُجل الإجراء توضيحيًا ضمن جلسة العرض.'],
  ['جميع السجلات اصطناعية لأغراض المراجعة فقط.','بيانات توضيحية'],
  ['البيانات اصطناعية، ولا توجد مزامنة أو تخزين خلفي.','بيانات توضيحية'],
  ['جميع البيانات والسجلات المعروضة اصطناعية لأغراض المراجعة فقط — لا توجد بيانات تشغيل حية أو تكاملات خارجية.','بيانات توضيحية'],
  ['جميع سجلات الأعمال والأدلة المعروضة اصطناعية لأغراض المراجعة فقط — لا توجد بيانات تشغيل حية أو عمليات رفع فعلية.','بيانات توضيحية'],
  ['بيانات تشغيلية اصطناعية لأغراض العرض والمراجعة فقط — ليست بيانات تشغيل حية.','بيانات توضيحية'],
  ['حالة تحميل تمثيلية؛ لا توجد شبكة أو API خلفية.','يتم تجهيز البيانات المتاحة لهذا العرض.'],
  ['حالة خطأ تمثيلية محلية','تعذر تجهيز هذا العرض'],
  ['تم تسجيل القرار الاصطناعي','تم تسجيل القرار التوضيحي'],
  ['تسجيل قرار اصطناعي','تسجيل القرار'],
  ['تم الاعتماد الاصطناعي','تم تسجيل الاعتماد'],
  ['تمت محاكاة الاعتماد','تم تسجيل الاعتماد'],
  ['تمت محاكاة تثبيت التحقق','تم تثبيت التحقق'],
  ['تمت محاكاة بدء إعادة العمل','تم بدء إعادة العمل'],
  ['تمت محاكاة طلب الإغلاق','تم تسجيل طلب الإغلاق'],
  ['تمت محاكاة','تم تسجيل'],
  ['اصطناعية','توضيحية'],
  ['اصطناعي','توضيحي']
];

const setText=(node,value)=>{ if(node && node.textContent!==value) node.textContent=value; };
const setHtml=(node,value)=>{ if(node && node.innerHTML!==value) node.innerHTML=value; };
const setTitle=(value)=>{ if(document.title!==value) document.title=value; };

function loadStyle(){
  if(document.querySelector('link[data-portfolio-polish]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet'; link.href='./portfolio-polish.css'; link.dataset.portfolioPolish='true';
  document.head.append(link);
}

function surface(){
  if(document.body.classList.contains('s02-page')) return 'work';
  if(document.body.classList.contains('completion-page')) return new URLSearchParams(location.search).get('surface')||'sites';
  return 'attention';
}

function markup(items,active,cls,iconsOnly=false){
  return items.map(([id,label,href,iconName])=>{
    const selected=id===active;
    return `<a class="${cls}${selected?' active':''}" href="${href}"${selected?' aria-current="page"':''}${iconsOnly?` aria-label="${label}"`:''}><span aria-hidden="true">${icon(iconName,18)}</span>${iconsOnly?'':`<span>${label}</span>`}</a>`;
  }).join('');
}

function buildLegacyNav(){
  const top=document.querySelector('.top-nav');
  if(!top || top.dataset.portfolioNav==='true') return;
  const active=surface();
  top.innerHTML=markup(nav,active,'nav-btn'); top.dataset.portfolioNav='true';
  const rail=document.querySelector('.left-rail');
  if(rail){ rail.innerHTML=markup(nav,active,'rail-btn',true); rail.dataset.portfolioNav='true'; }
  const mobile=document.querySelector('.mobile-bar');
  if(mobile){
    const mobileItems=[nav[0],nav[1],nav[2],nav[4],nav[7]];
    mobile.innerHTML=markup(mobileItems,active,'mobile-tab'); mobile.dataset.portfolioNav='true';
  }
}

function syncLegacyMobileBar(){
  const mobile=document.querySelector('.mobile-bar');
  if(!mobile) return;
  const tablet=window.matchMedia('(min-width:621px) and (max-width:980px)').matches;
  const compact=window.matchMedia('(max-width:980px)').matches;
  if(compact) mobile.style.setProperty('grid-template-columns','repeat(5,minmax(0,1fr))','important');
  else mobile.style.removeProperty('grid-template-columns');
  if(tablet){
    mobile.style.setProperty('left','50%');
    mobile.style.setProperty('right','auto');
    mobile.style.setProperty('width','min(720px, calc(100vw - 32px))');
    mobile.style.setProperty('transform','translateX(-50%)');
  }else{
    mobile.style.removeProperty('left');
    mobile.style.removeProperty('right');
    mobile.style.removeProperty('width');
    mobile.style.removeProperty('transform');
  }
}

function brand(){
  setText(document.querySelector('.brand-title'),'Enterprise Operations');
  setText(document.querySelector('.brand-sub'),surface()==='work'?'قائمة الأعمال':'مركز الانتباه التنفيذي');
  setText(document.querySelector('.completion-brand strong'),'Enterprise Operations');
  setText(document.querySelector('.user-role'),'مدير التشغيل');
  setText(document.querySelector('.completion-user small'),'مدير التشغيل');
  document.querySelectorAll('[aria-label*="المستخدم التجريبي الحالي"]').forEach(node=>{
    const current=node.getAttribute('aria-label');
    const next=current.replace('المستخدم التجريبي الحالي:','المستخدم الحالي:');
    if(current!==next) node.setAttribute('aria-label',next);
  });
}

function s01(){
  if(surface()!=='attention') return;
  setTitle('Enterprise Operations — مركز الانتباه التنفيذي');
  setText(document.getElementById('syntheticNotice'),'بيانات توضيحية');
  setText(document.getElementById('focusHeading'),'تفاصيل الانتباه والصلاحية');
  setText(document.getElementById('actionNote'),'إجراء توضيحي ضمن جلسة العرض.');
  setText(document.querySelector('.site-strip-head p'),'اختيار الموقع يغيّر سياق المتابعة ولا يوسّع صلاحية الإجراء.');
}

function s02(){
  if(surface()!=='work') return;
  setTitle('Enterprise Operations — قائمة الأعمال');
  setText(document.getElementById('syntheticNotice'),'بيانات توضيحية');
  setText(document.querySelector('.s02-title .eyebrow'),'ضبط الأعمال');
  setText(document.querySelector('.s02-title p'),'رتّب العمل حسب الأولوية، وافصل بين نطاق الرؤية وصلاحية الإجراء للمهمة المحددة.');
  setText(document.querySelector('.focus-kicker'),'المهمة المحددة');
  setText(document.querySelector('.queue-footer span:last-child'),'بيانات توضيحية');
}

function enforceWorkQueuePriority(){
  if(surface()!=='work') return;
  const layout=document.querySelector('.s02-layout');
  const queue=document.querySelector('.queue-column');
  const focus=document.querySelector('.focus-task');
  if(!layout || !queue || !focus) return;
  const mobile=window.matchMedia('(max-width:620px)').matches;
  if(mobile && layout.firstElementChild!==focus) layout.prepend(focus);
  if(!mobile && layout.firstElementChild!==queue) layout.prepend(queue);
}

function completion(){
  if(!document.body.classList.contains('completion-page')) return;
  const id=surface(); const copy=surfaces[id]||surfaces.sites;
  setTitle(`Enterprise Operations — ${copy[0]}`);
  setText(document.getElementById('surfaceEyebrow'),copy[1]);
  setText(document.getElementById('surfaceCode'),copy[1]);
  setText(document.getElementById('surfaceDescription'),copy[2]);
  setText(document.getElementById('completionSynthetic'),'بيانات توضيحية');
  setHtml(document.getElementById('completionBoundary'),'<strong>حد الصلاحية:</strong> الرؤية عبر المواقع لا تمنح التنفيذ أو القرار أو الاعتماد. الصلاحية تُقيَّم حسب الموقع والدور والدليل والحالة.');
  const meta=document.querySelector('.completion-hero-meta');
  if(meta){ setText(meta.querySelector('span'),'النطاق التشغيلي'); setText(meta.querySelector('small'),'الرؤية لا تعني صلاحية الإجراء'); }
  document.querySelectorAll('.completion-nav .nav-code').forEach(node=>node.setAttribute('aria-hidden','true'));
}

function replaceText(value){
  let next=String(value);
  for(const [from,to] of replacements) next=next.split(from).join(to);
  next=next.replace(/\bRP02\b\s*[—\-/]?\s*/g,'');
  next=next.replace(/\bS0[1-8]\b\s*[—\-/]?\s*/g,'');
  return next.replace(/ {2,}/g,' ');
}

function sanitize(root=document.body){
  if(!root) return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode(node){
    const parent=node.parentElement;
    return parent && !['SCRIPT','STYLE','NOSCRIPT'].includes(parent.tagName) && node.nodeValue?.trim()?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;
  }});
  const nodes=[]; while(walker.nextNode()) nodes.push(walker.currentNode);
  nodes.forEach(node=>{
    const next=replaceText(node.nodeValue);
    if(next!==node.nodeValue) node.nodeValue=next;
    if(node.nodeValue.trim()==='VALIDATION') node.nodeValue=node.nodeValue.replace('VALIDATION','التحقق');
  });
  const labels=new Map([
    ['Source','المصدر'],['Scope','النطاق'],['Period','الفترة'],['Owner','المالك'],['Target','الهدف'],['Threshold','الحد'],
    ['Current observation','الملاحظة الحالية'],['Evidence / lineage','الدليل / التسلسل'],['KPI → Deviation','المؤشر ← الانحراف'],
    ['Deviation → Decision','الانحراف ← القرار'],['Task → Verification','المهمة ← التحقق'],['Rework lineage','تسلسل إعادة العمل']
  ]);
  root.querySelectorAll?.('.fact span').forEach(node=>{ const value=node.textContent.trim(); if(labels.has(value)) setText(node,labels.get(value)); });
}

let scheduled=false;
function refresh(){
  scheduled=false; syncLegacyMobileBar(); brand(); s01(); s02(); enforceWorkQueuePriority(); completion(); sanitize();
  if(document.documentElement.dataset.portfolioReady!=='true') document.documentElement.dataset.portfolioReady='true';
}
function schedule(){ if(scheduled) return; scheduled=true; requestAnimationFrame(refresh); }

loadStyle(); buildLegacyNav();
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',schedule,{once:true}); else schedule();
new MutationObserver(schedule).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
window.matchMedia('(max-width:980px)').addEventListener?.('change',schedule);
window.matchMedia('(max-width:620px)').addEventListener?.('change',schedule);
