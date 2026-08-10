import { APP_META, records } from './data.js';
import { icon } from './icons.js';
import { renderAll, renderFocus, renderRoute, renderStaticIcons } from './render.js';
import {
  createAppState,
  selectScope,
  selectSite,
  setFilter,
  setSearch,
  setSelectedRecord,
  simulateAction
} from './state.js';

const byId = (id) => document.getElementById(id);
const FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

let state = createAppState();
let lastFocused = null;
let currentFocusTab = 'overview';
let toastTimer = null;
let fallbackFocusState = [];

const appShell = byId('appShell');
const scopeMenu = byId('scopeMenu');
const scopeButton = byId('scopeButton');
const focusPanel = byId('focusPanel');
const focusOverlay = byId('focusOverlay');
const notificationPop = byId('notificationPop');
const notifyButton = byId('notifyButton');

function showToast(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 3200);
}

function closeMenus() {
  scopeMenu.classList.remove('open');
  scopeButton.setAttribute('aria-expanded', 'false');
  notificationPop.classList.remove('open');
  notifyButton.setAttribute('aria-expanded', 'false');
}

function setBackgroundInert(enabled) {
  if ('inert' in appShell) {
    appShell.inert = enabled;
    return;
  }

  if (enabled) {
    fallbackFocusState = [...appShell.querySelectorAll(FOCUSABLE)].map((node) => ({
      node,
      tabindex: node.getAttribute('tabindex')
    }));
    fallbackFocusState.forEach(({ node }) => node.setAttribute('tabindex', '-1'));
    appShell.setAttribute('aria-hidden', 'true');
  } else {
    fallbackFocusState.forEach(({ node, tabindex }) => {
      if (tabindex === null) node.removeAttribute('tabindex');
      else node.setAttribute('tabindex', tabindex);
    });
    fallbackFocusState = [];
    appShell.removeAttribute('aria-hidden');
  }
}

function focusableInDialog() {
  return [...focusPanel.querySelectorAll(FOCUSABLE)].filter((node) => (
    !node.hasAttribute('disabled')
    && node.getAttribute('aria-hidden') !== 'true'
    && node.getClientRects().length > 0
  ));
}

function trapDialogTab(event) {
  const items = focusableInDialog();
  if (!items.length) {
    event.preventDefault();
    focusPanel.focus();
    return;
  }

  const first = items[0];
  const last = items[items.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && (active === first || !focusPanel.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !focusPanel.contains(active))) {
    event.preventDefault();
    first.focus();
  }
}

function setFocusTab(tab) {
  currentFocusTab = tab;
  document.querySelectorAll('.focus-tab').forEach((button) => {
    const active = button.dataset.tab === tab;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
    button.setAttribute('tabindex', active ? '0' : '-1');
  });
  document.querySelectorAll('.focus-section').forEach((section) => {
    section.classList.toggle('active', section.dataset.section === tab);
  });
}

function openFocus(recordId, trigger) {
  const record = records[recordId];
  if (!record) return;
  closeMenus();
  lastFocused = trigger ?? document.activeElement;
  state = setSelectedRecord(state, recordId);
  renderRoute(state, record);
  renderFocus(state);
  currentFocusTab = 'overview';
  setFocusTab('overview');
  focusOverlay.classList.add('open');
  focusPanel.classList.add('open');
  focusPanel.setAttribute('aria-hidden', 'false');
  document.body.classList.add('dialog-open');
  setBackgroundInert(true);
  window.requestAnimationFrame(() => byId('focusClose').focus());
}

function closeFocus({ restore = true } = {}) {
  if (!focusPanel.classList.contains('open')) return;
  focusOverlay.classList.remove('open');
  focusPanel.classList.remove('open');
  focusPanel.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('dialog-open');
  setBackgroundInert(false);
  state = setSelectedRecord(state, null);
  renderRoute(state);
  if (restore && lastFocused && typeof lastFocused.focus === 'function' && document.contains(lastFocused)) {
    window.requestAnimationFrame(() => lastFocused.focus());
  }
}

function applyState(nextState, message = '') {
  state = nextState;
  byId('searchInput').value = state.searchTerm;
  renderAll(state);
  if (message) showToast(message);
}

function toggleNotifications() {
  const opening = !notificationPop.classList.contains('open');
  notificationPop.classList.toggle('open', opening);
  notifyButton.setAttribute('aria-expanded', String(opening));
  scopeMenu.classList.remove('open');
  scopeButton.setAttribute('aria-expanded', 'false');
}

function initialize() {
  byId('syntheticNotice').textContent = APP_META.syntheticNotice;
  byId('brandSymbol').innerHTML = icon('building', 22);
  renderStaticIcons();
  renderAll(state);
  setFocusTab(currentFocusTab);
}

document.addEventListener('click', (event) => {
  const filterButton = event.target.closest('[data-filter]');
  if (filterButton) {
    applyState(setFilter(state, filterButton.dataset.filter));
    return;
  }

  const openButton = event.target.closest('[data-open]');
  if (openButton) {
    event.stopPropagation();
    openFocus(openButton.dataset.open, openButton);
    return;
  }

  const row = event.target.closest('.ledger-row');
  if (row && !event.target.closest('button')) {
    openFocus(row.dataset.record, row);
    return;
  }

  const scopeOption = event.target.closest('[data-scope]');
  if (scopeOption) {
    const next = selectScope(state, scopeOption.dataset.scope);
    applyState(next, `تم تغيير النطاق إلى «${document.querySelector(`[data-scope="${scopeOption.dataset.scope}"] strong`)?.textContent ?? ''}». صلاحية المشاهدة لا تمنح صلاحية إجراء تلقائية.`);
    scopeMenu.classList.remove('open');
    scopeButton.setAttribute('aria-expanded', 'false');
    return;
  }

  const siteButton = event.target.closest('[data-site]');
  if (siteButton) {
    const next = selectSite(state, siteButton.dataset.site);
    const siteName = siteButton.querySelector('.site-name')?.textContent ?? '';
    applyState(next, `تم تحديد الموقع «${siteName}» مع إبقاء النطاق التشغيلي مستقلًا عن حالة الموقع المحدد.`);
    return;
  }

  const placeholder = event.target.closest('[data-placeholder]');
  if (placeholder) {
    if (placeholder.dataset.placeholder.includes('الأعمال')) {
      window.location.href = './work-queue.html';
      return;
    }
    showToast(`${placeholder.dataset.placeholder}. لم يتم فتح مساحة إضافية.`);
  }
});

byId('ledgerList').addEventListener('keydown', (event) => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.classList.contains('ledger-row')) {
    event.preventDefault();
    openFocus(event.target.dataset.record, event.target);
  }
});

scopeButton.addEventListener('click', () => {
  const opening = !scopeMenu.classList.contains('open');
  scopeMenu.classList.toggle('open', opening);
  scopeButton.setAttribute('aria-expanded', String(opening));
  notificationPop.classList.remove('open');
  notifyButton.setAttribute('aria-expanded', 'false');
});

notifyButton.addEventListener('click', toggleNotifications);
byId('searchInput').addEventListener('input', (event) => {
  state = setSearch(state, event.target.value);
  renderAll(state);
});
byId('focusClose').addEventListener('click', () => closeFocus());
focusOverlay.addEventListener('click', () => closeFocus());

byId('primaryAction').addEventListener('click', () => {
  const recordId = state.selectedRecordId;
  if (!recordId) return;
  const next = simulateAction(state, recordId);
  if (next === state) {
    showToast('الإجراء غير متاح: الرؤية عبر المواقع لا تمنح صلاحية تنفيذ على موقع آخر.');
    return;
  }
  state = next;
  renderRoute(state, records[recordId]);
  renderFocus(state);
  setFocusTab(currentFocusTab);
  showToast(`تمت محاكاة «${records[recordId].action}» فقط — لا يوجد تغيير في أي نظام حقيقي.`);
});

byId('routeToggle').addEventListener('click', () => {
  const ribbon = byId('routeRibbon');
  const expanded = ribbon.classList.toggle('expanded');
  byId('routeToggle').textContent = expanded ? 'إخفاء تفاصيل المسار' : 'عرض المسار التشغيلي كاملًا';
  byId('routeToggle').setAttribute('aria-expanded', String(expanded));
});

document.querySelectorAll('.focus-tab').forEach((button) => {
  button.addEventListener('click', () => setFocusTab(button.dataset.tab));
  button.addEventListener('keydown', (event) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    const tabs = [...document.querySelectorAll('.focus-tab')];
    const index = tabs.indexOf(button);
    const nextIndex = event.key === 'ArrowLeft'
      ? (index + 1) % tabs.length
      : (index - 1 + tabs.length) % tabs.length;
    tabs[nextIndex].focus();
    setFocusTab(tabs[nextIndex].dataset.tab);
  });
});

document.addEventListener('keydown', (event) => {
  if (focusPanel.classList.contains('open')) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeFocus();
      return;
    }
    if (event.key === 'Tab') trapDialogTab(event);
    return;
  }

  if (event.key === 'Escape') {
    closeMenus();
  }
});

document.addEventListener('click', (event) => {
  if (!byId('scopeWrap').contains(event.target)) {
    scopeMenu.classList.remove('open');
    scopeButton.setAttribute('aria-expanded', 'false');
  }
  if (!byId('notificationWrap').contains(event.target)) {
    notificationPop.classList.remove('open');
    notifyButton.setAttribute('aria-expanded', 'false');
  }
});

initialize();
