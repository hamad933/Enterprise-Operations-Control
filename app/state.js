import { filters, records, scopes, sites } from './data.js';

const hasOwn = (object, key) => Object.prototype.hasOwnProperty.call(object, key);

export function createAppState() {
  return {
    scopeId: 'central',
    selectedSiteId: 'hq',
    filterId: 'all',
    searchTerm: '',
    selectedRecordId: null,
    simulatedRecordIds: []
  };
}

export function selectScope(state, scopeId) {
  if (!hasOwn(scopes, scopeId)) return state;
  const scope = scopes[scopeId];
  return {
    ...state,
    scopeId,
    selectedSiteId: scope.defaultSiteId,
    filterId: 'all',
    searchTerm: '',
    selectedRecordId: null
  };
}

export function selectSite(state, siteId) {
  const site = sites.find((item) => item.id === siteId);
  if (!site) return state;
  return {
    ...state,
    scopeId: site.scopeId,
    selectedSiteId: site.id,
    filterId: 'all',
    searchTerm: '',
    selectedRecordId: null
  };
}

export function setFilter(state, filterId) {
  if (!filters.some((item) => item.id === filterId)) return state;
  return { ...state, filterId };
}

export function setSearch(state, searchTerm) {
  return { ...state, searchTerm: String(searchTerm ?? '').trim() };
}

export function setSelectedRecord(state, recordId) {
  if (recordId !== null && !hasOwn(records, recordId)) return state;
  return { ...state, selectedRecordId: recordId };
}

export function currentScope(state) {
  return scopes[state.scopeId];
}

export function currentSite(state) {
  return sites.find((item) => item.id === state.selectedSiteId) ?? null;
}

export function scopeRecords(state) {
  return currentScope(state).records.map((id) => records[id]);
}

export function visibleRecords(state) {
  const query = state.searchTerm.toLocaleLowerCase('ar');
  return scopeRecords(state).filter((record) => {
    const filterMatches = state.filterId === 'all'
      || record.filter === state.filterId
      || (state.filterId === 'action' && ['يتطلب إجراء', 'إجراء مطلوب'].includes(record.state));

    const haystack = [
      record.title,
      record.work,
      record.deviation,
      record.asset,
      record.site,
      record.location,
      record.reason
    ].join(' ').toLocaleLowerCase('ar');

    return filterMatches && (!query || haystack.includes(query));
  });
}

export function filterCount(state, filterId) {
  const items = scopeRecords(state);
  if (filterId === 'all') return items.length;
  return items.filter((record) => (
    record.filter === filterId
    || (filterId === 'action' && ['يتطلب إجراء', 'إجراء مطلوب'].includes(record.state))
  )).length;
}

export function canActOnRecord(state, recordOrId) {
  const record = typeof recordOrId === 'string' ? records[recordOrId] : recordOrId;
  if (!record) return false;
  return state.selectedSiteId === record.siteId;
}

export function simulateAction(state, recordId) {
  const record = records[recordId];
  if (!record || !canActOnRecord(state, record)) return state;
  if (state.simulatedRecordIds.includes(recordId)) return state;
  return { ...state, simulatedRecordIds: [...state.simulatedRecordIds, recordId] };
}

export function routeForRecord(state, recordOrId) {
  const record = typeof recordOrId === 'string' ? records[recordOrId] : recordOrId;
  if (!record) return [];
  const simulated = state.simulatedRecordIds.includes(record.id);
  if (!simulated) return record.route.map((stage) => ({ ...stage }));

  return record.route.map((stage) => {
    if (stage.key === 'action') {
      return { ...stage, state: 'done', stateLabel: 'محاكاة مكتملة', value: `${record.action} — محاكاة فقط` };
    }
    if (stage.key === 'outcome') {
      return { ...stage, state: 'pending', stateLabel: 'مراقبة مطلوبة', value: 'لم تتغير أي حالة تشغيلية حقيقية' };
    }
    return { ...stage };
  });
}
