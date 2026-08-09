import { APP_META, filters, records, scopes, sites } from './data.js';
import { icon, routeIconByKey } from './icons.js';
import { canActOnRecord, currentScope, currentSite, filterCount, routeForRecord, visibleRecords } from './state.js';

const byId = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
})[char]);

export function ltr(value) {
  return `<bdi class="ltr" dir="ltr">${escapeHtml(value)}</bdi>`;
}

function mixed(value) {
  return escapeHtml(value).replace(/\b([A-Z]{2,8}-[A-Z0-9]+(?:\/[A-Z0-9]+)?)\b/g, '<bdi class="ltr" dir="ltr">$1</bdi>');
}

export function renderStaticIcons() {
  document.querySelectorAll('[data-icon]').forEach((node) => {
    node.innerHTML = icon(node.dataset.icon, Number(node.dataset.iconSize || 18));
  });
}

export function renderScope(state) {
  const scope = currentScope(state);
  const site = currentSite(state);
  byId('scopeName').textContent = scope.name;
  byId('selectedSiteName').textContent = `الموقع المحدد: ${site?.name ?? 'غير محدد'}`;
  byId('ledgerScopeNote').textContent = `أعلى العناصر ذات الأولوية ضمن ${scope.name} — الموقع المحدد: ${site?.name ?? 'غير محدد'}`;
  byId('authorityBoundary').textContent = site
    ? `الرؤية ضمن «${scope.name}» أوسع من صلاحية الإجراء. الإجراء يتطلب تطابق موقع السجل مع «${site.name}».`
    : 'الرؤية عبر المواقع لا تمنح صلاحية إجراء تلقائية.';

  byId('scopeMenu').innerHTML = Object.values(scopes).map((item) => `
    <button class="scope-option" role="option" aria-selected="${state.scopeId === item.id}" data-scope="${item.id}">
      <span><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.subtitle)}</small></span>
      <span class="scope-option-mark" aria-hidden="true">${state.scopeId === item.id ? icon('verification', 15) : ''}</span>
    </button>
  `).join('');
}

export function renderFilters(state) {
  byId('filterBar').innerHTML = filters.map((filter) => `
    <button class="filter-btn ${state.filterId === filter.id ? 'active' : ''}" data-filter="${filter.id}" aria-pressed="${state.filterId === filter.id}">
      <span>${filter.label}</span><span class="filter-count">${filterCount(state, filter.id)}</span>
    </button>
  `).join('');
}

export function renderLedger(state) {
  const list = visibleRecords(state);
  const scope = currentScope(state);
  const selectedSite = currentSite(state);
  byId('ledgerList').innerHTML = list.map((record) => {
    const actionableHere = canActOnRecord(state, record);
    const selected = state.selectedRecordId === record.id;
    return `
      <article class="ledger-row ${selected ? 'selected' : ''}" role="listitem" tabindex="0" data-record="${record.id}" style="--row-accent:${record.accent}" aria-label="الأولوية ${record.priority}: ${escapeHtml(record.title)}">
        <div class="cell priority-cell"><div class="priority-no">${record.priority}</div><div class="severity-mini">${record.severityLabel}</div></div>
        <div class="cell issue-cell">
          <div class="row-title">${escapeHtml(record.title)}</div>
          <div class="row-meta">${ltr(record.work)} / ${ltr(record.deviation)} · <strong>${escapeHtml(record.status)}</strong></div>
          <div class="status-line" style="color:${record.accent}"><span class="status-dot" aria-hidden="true"></span><span>${escapeHtml(record.updated)}</span></div>
        </div>
        <div class="cell location-cell"><div class="row-title row-asset">${ltr(record.asset)}</div><div class="row-meta">${escapeHtml(record.site)}<br>${escapeHtml(record.location)}</div></div>
        <div class="cell reason-cell"><div class="row-meta reason-copy">${escapeHtml(record.reason)}</div></div>
        <div class="cell owner-cell"><div class="owner-stack"><span class="owner-badge" aria-hidden="true">${icon('work', 15)}</span><div><div class="row-meta"><strong>${escapeHtml(record.ownerShort)}</strong></div><div class="row-meta">${escapeHtml(record.state)}</div></div></div></div>
        <div class="cell action-cell">
          <span class="authority-chip ${actionableHere ? 'allowed' : 'view-only'}">${actionableHere ? 'إجراء ضمن الموقع' : 'عرض فقط'}</span>
          <button class="action-btn" data-open="${record.id}" aria-label="فتح تفاصيل ${escapeHtml(record.title)}"><span>${escapeHtml(record.action)}</span>${icon('arrow', 16)}</button>
        </div>
      </article>
    `;
  }).join('');

  byId('emptyState').hidden = list.length > 0;
  byId('visibleSummary').textContent = list.length
    ? `عرض ${list.length} من أعلى عناصر الانتباه — ${scope.pulse.total} عنصرًا في النطاق`
    : `لا توجد عناصر مطابقة — ${scope.pulse.total} عنصرًا في النطاق`;
  byId('siteAuthoritySummary').textContent = selectedSite
    ? `الموقع المحدد «${selectedSite.name}» يحدد صلاحية الإجراء؛ بقية المواقع تبقى مرئية حسب النطاق.`
    : 'لم يتم تحديد موقع للإجراء.';
}

export function renderPulse(state) {
  const pulse = currentScope(state).pulse;
  byId('pulseTotal').textContent = pulse.total;
  byId('criticalCount').textContent = `${pulse.critical} حرجة`;
  byId('mobilePulseTotal').textContent = pulse.total;
  byId('mobileCritical').textContent = pulse.critical;
  byId('mobileVerification').textContent = pulse.verification;
  byId('mobileActionable').textContent = pulse.actionable;
  byId('pulseList').innerHTML = `
    <div class="pulse-row"><span class="metric"><span class="metric-dot metric-orange"></span>تحت التحقق</span><span class="metric-value">${pulse.verification}</span></div>
    <div class="pulse-row"><span class="metric"><span class="metric-dot metric-green"></span>جاهزة للإجراء</span><span class="metric-value">${pulse.actionable}</span></div>
    <div class="pulse-row"><span class="metric"><span class="metric-dot metric-red"></span>حرجة</span><span class="metric-value">${pulse.critical}</span></div>
  `;
}

export function renderSites(state) {
  byId('siteStrip').innerHTML = sites.map((site) => `
    <button class="site-btn ${state.selectedSiteId === site.id ? 'selected' : ''}" data-site="${site.id}" style="--site-accent:${site.accent}" aria-pressed="${state.selectedSiteId === site.id}" aria-label="${escapeHtml(site.name)}، الحالة ${escapeHtml(site.state)}">
      <span class="facility-art" aria-hidden="true">${icon('building', 28)}</span>
      <span class="site-copy"><span class="site-name">${escapeHtml(site.name)}</span><span class="site-state">${escapeHtml(site.state)}</span><span class="site-summary">${escapeHtml(site.summary)}</span></span>
      <span class="site-count" aria-label="${site.count} عناصر انتباه">${site.count}</span>
    </button>
  `).join('');
}

function routeStage(stage) {
  const stateText = escapeHtml(stage.stateLabel);
  const commonHead = `<div class="stage-kicker">${icon(routeIconByKey[stage.key], 17)}<span>${escapeHtml(stage.label)}</span></div>`;
  const value = `<div class="stage-value">${mixed(stage.value)}</div>`;
  const status = `<div class="stage-status"><span class="stage-state-dot" aria-hidden="true"></span><span>${stateText}</span></div>`;

  switch (stage.key) {
    case 'site':
      return `${commonHead}<div class="site-stage-core">${value}<span class="stage-tag">نقطة البداية</span></div>${status}`;
    case 'signal':
      return `${commonHead}<div class="signal-stage-core"><span class="signal-pulse" aria-hidden="true"></span>${value}</div>${status}`;
    case 'evidence':
      return `${commonHead}${value}<div class="evidence-bars" aria-hidden="true"><i></i><i></i><i></i></div>${status}`;
    case 'verification':
      return `${commonHead}<div class="verification-core"><span class="verify-ring" aria-hidden="true">${icon('verification', 15)}</span>${value}</div>${status}`;
    case 'decision':
      return `${commonHead}<div class="decision-core">${value}<span class="decision-line" aria-hidden="true"></span></div>${status}`;
    case 'action':
      return `${commonHead}<div class="action-core">${value}<span class="action-route-arrow" aria-hidden="true">${icon('action', 16)}</span></div>${status}`;
    case 'outcome':
      return `${commonHead}<div class="outcome-core">${value}</div>${status}`;
    default:
      return `${commonHead}${value}${status}`;
  }
}

export function renderRoute(state, record = null) {
  const fallback = visibleRecords(state)[0] ?? null;
  const current = record ?? fallback;
  const route = current ? routeForRecord(state, current) : [];
  byId('routeRibbon').innerHTML = route.map((stage) => `
    <div class="route-stage stage-${stage.key}" data-stage="${stage.key}" data-state="${stage.state}">${routeStage(stage)}</div>
  `).join('');
  byId('routeContext').innerHTML = current
    ? `${escapeHtml(current.title)} · ${ltr(current.work)}`
    : 'لا يوجد عنصر مطابق لعرض المسار التشغيلي.';
}

export function renderFocus(state) {
  const record = records[state.selectedRecordId];
  if (!record) return;
  const selectedSite = currentSite(state);
  const allowed = canActOnRecord(state, record);
  const simulated = state.simulatedRecordIds.includes(record.id);

  document.documentElement.style.setProperty('--focus-accent', record.accent);
  byId('focusPriority').textContent = record.priority;
  byId('focusTitle').textContent = record.title;
  byId('focusId').innerHTML = `${ltr(record.work)} / ${ltr(record.deviation)} · ${ltr(record.asset)}`;
  byId('focusTime').textContent = record.updated;

  byId('overviewSection').innerHTML = `
    <div class="detail-block"><h3>الوصف</h3><p>${mixed(record.description)}</p></div>
    <div class="detail-block"><h3>الأثر التشغيلي</h3><div class="impact-grid"><div class="impact-item"><div class="impact-label">الأثر</div><div class="impact-value">${escapeHtml(record.impact)}</div></div><div class="impact-item"><div class="impact-label">استمرارية الخدمة</div><div class="impact-value">${escapeHtml(record.capacity)}</div></div></div></div>
    <div class="detail-block"><h3>الأصل المرتبط</h3><div class="asset-preview"><span class="facility-art focus-art" aria-hidden="true">${icon('building', 30)}</span><div><div class="asset-title">${ltr(record.asset)}</div><div class="asset-meta">${escapeHtml(record.site)}<br>${escapeHtml(record.location)}</div><button class="link-btn" data-placeholder="صفحة الأصل خارج نطاق S01">فتح صفحة الأصل</button></div></div></div>
    <div class="detail-block"><div class="meta-list"><div class="meta-row"><span>المالك</span><strong>${escapeHtml(record.owner)}</strong></div><div class="meta-row"><span>آخر تحديث</span><strong>${escapeHtml(record.updated)}</strong></div><div class="meta-row"><span>الحالة</span><strong>${escapeHtml(record.status)}</strong></div><div class="meta-row"><span>القرار الحالي</span><strong>${escapeHtml(record.decision)}</strong></div></div></div>
  `;

  byId('evidenceSection').innerHTML = `
    <div class="detail-block"><h3>الأدلة المرتبطة</h3><p>${APP_META.syntheticNotice}</p></div>
    ${record.evidence.map((item, index) => `<div class="evidence-item"><strong>${index + 1}. ${escapeHtml(item)}</strong><small>حالة السجل: متاح للمراجعة داخل التطبيق التجريبي</small></div>`).join('')}
  `;

  byId('verificationSection').innerHTML = `
    <div class="detail-block"><h3>حالة التحقق</h3><p>${escapeHtml(record.verification)}</p></div>
    <div class="impact-item warning-item"><div class="impact-label">مبدأ الحالة</div><div class="impact-value">طلب الإغلاق لا يساوي إغلاقًا نهائيًا، وغياب الدليل أو رفض التحقق يبقي الحالة مفتوحة.</div></div>
  `;

  byId('authoritySection').innerHTML = `
    <div class="detail-block"><h3>الصلاحية والقرار</h3><p>${escapeHtml(record.authority)}</p></div>
    <div class="authority-aperture ${allowed ? 'authority-allowed' : 'authority-denied'}">
      <div class="aperture-label">حالة الصلاحية للموقع المحدد</div>
      <strong>${allowed ? 'ACTION_AUTHORITY_IN_SCOPE' : 'VISIBILITY_ONLY_OUT_OF_SITE_SCOPE'}</strong>
      <p>${allowed
        ? `الموقع المحدد «${escapeHtml(selectedSite?.name ?? '')}» يطابق موقع السجل، ويمكن محاكاة الإجراء دون تغيير أي نظام حقيقي.`
        : `السجل مرئي ضمن النطاق التشغيلي، لكن الموقع المحدد «${escapeHtml(selectedSite?.name ?? '')}» لا يطابق «${escapeHtml(record.site)}». لا تُمنح صلاحية الإجراء من الرؤية وحدها.`}</p>
    </div>
  `;

  const primary = byId('primaryAction');
  primary.disabled = !allowed;
  primary.textContent = allowed ? record.action : 'عرض فقط — خارج صلاحية الموقع المحدد';
  byId('actionNote').textContent = allowed
    ? 'محاكاة واجهة فقط — لا يتم تغيير أي سجل أو نظام فعلي.'
    : 'الرؤية عبر المواقع لا تمنح صلاحية إجراء على موقع مختلف.';
  byId('simState').hidden = !simulated;
}

export function renderAll(state) {
  renderScope(state);
  renderFilters(state);
  renderLedger(state);
  renderPulse(state);
  renderSites(state);
  renderRoute(state, state.selectedRecordId ? records[state.selectedRecordId] : null);
}
