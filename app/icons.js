const paths = {
  attention: '<path d="M12 3 3.8 18h16.4L12 3Z"/><path d="M12 8v4.8"/><path d="M12 16.2h.01"/>',
  work: '<rect x="4" y="6" width="16" height="13" rx="2"/><path d="M9 6V4h6v2M4 11h16"/>',
  sites: '<path d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle cx="12" cy="10" r="2.2"/>',
  verification: '<circle cx="12" cy="12" r="8"/><path d="m8.6 12.2 2.1 2.1 4.8-5"/>',
  decisions: '<path d="M6 4h9l3 3v13H6z"/><path d="M15 4v4h4M9 12h6M9 16h4"/>',
  reports: '<path d="M5 19V9M12 19V5M19 19v-7"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19 13.8v-3.6l-2-.7a7 7 0 0 0-.8-1.8l.9-1.9-2.6-2.6-1.9.9a7 7 0 0 0-1.8-.8L10.2 2H6.6l-.7 2a7 7 0 0 0-1.8.8l-1.9-.9L-.4 6.5l.9 1.9a7 7 0 0 0-.8 1.8l-2 .7v3.6l2 .7a7 7 0 0 0 .8 1.8l-.9 1.9 2.6 2.6 1.9-.9a7 7 0 0 0 1.8.8l.7 2h3.6l.7-2a7 7 0 0 0 1.8-.8l1.9.9 2.6-2.6-.9-1.9a7 7 0 0 0 .8-1.8l2-.7Z" transform="translate(2.2 -2.2) scale(.82)"/>',
  bell: '<path d="M7 9a5 5 0 0 1 10 0c0 5 2 5 2 7H5c0-2 2-2 2-7Z"/><path d="M10 19h4"/>',
  menu: '<path d="M5 7h14M5 12h14M5 17h14"/>',
  search: '<circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/>',
  grid: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/>',
  close: '<path d="m7 7 10 10M17 7 7 17"/>',
  chevronDown: '<path d="m7 10 5 5 5-5"/>',
  signal: '<path d="M4 17h3l2-5 3 7 3-11 2 6h3"/>',
  evidence: '<path d="M6 4h9l3 3v13H6z"/><path d="M15 4v4h4M9 12h6M9 16h6"/>',
  action: '<path d="M5 12h13M14 8l4 4-4 4"/>',
  outcome: '<circle cx="12" cy="12" r="8"/><path d="M8.5 12.5 11 15l5-6"/>',
  more: '<circle cx="6" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/><circle cx="18" cy="12" r="1" fill="currentColor" stroke="none"/>',
  arrow: '<path d="M5 12h14M8 8l-4 4 4 4"/>',
  building: '<path d="M5 20V6l7-3 7 3v14M8 9h2M14 9h2M8 13h2M14 13h2M10 20v-3h4v3"/>'
};

export function icon(name, size = 18) {
  const body = paths[name] ?? paths.attention;
  return `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
}

export const routeIconByKey = Object.freeze({
  site: 'sites',
  signal: 'signal',
  evidence: 'evidence',
  verification: 'verification',
  decision: 'decisions',
  action: 'action',
  outcome: 'outcome'
});
