/**
 * Palora SVG Icon System
 * 24x24 viewBox, stroke-width 1.5, fill none, stroke currentColor, round linecap & linejoin.
 */

const ICONS = {
  // Verified requirement icons
  key: `<path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/>`,
  house: `<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>`,
  mail: `<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>`,
  instagram: `<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>`,
  pause: `<path d="M8 5v14M16 5v14"/>`,
  play: `<path d="M7 4.5v15l12-7.5z"/>`,

  // Core category and section icons
  heart: `<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>`,
  hearts: `<path d="M16 11.37A4 4 0 0 0 12 7.5c-1.33 0-2.53.64-3.29 1.63C7.95 8.14 6.75 7.5 5.42 7.5A4.42 4.42 0 0 0 1 11.92c0 2.26 1.48 4 2.96 5.42l4.75 4.75 4.75-4.75c1.48-1.42 2.96-3.16 2.96-5.42Z"/><path d="M17.5 5a3.5 3.5 0 0 1 3.5 3.5c0 1.8-1.18 3.19-2.36 4.32l-3.79 3.79"/>`,
  cake: `<path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v2"/><path d="M12 8v2"/><path d="M17 8v2"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/>`,
  lotus: `<path d="M12 3c-1.5 3.5-3 6.5-3 9.5a3 3 0 0 0 6 0C15 9.5 13.5 6.5 12 3Z"/><path d="M12 12.5C9.5 10 7 9 4.5 9c0 4 2 7 7.5 7.5"/><path d="M12 12.5C14.5 10 17 9 19.5 9c0 4-2 7-7.5 7.5"/><path d="M2 17c3.5 3 7 4 10 4s6.5-1 10-4"/>`,
  flower: `<circle cx="12" cy="12" r="3"/><path d="M12 2a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M12 18a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0v-1a3 3 0 0 0-3-3z"/><path d="M2 12a3 3 0 0 0 3-3h1a3 3 0 0 0 0 6H5a3 3 0 0 0-3-3z"/><path d="M18 12a3 3 0 0 0 3-3h1a3 3 0 0 0 0 6h-1a3 3 0 0 0-3-3z"/>`,
  yarn: `<circle cx="12" cy="12" r="9"/><path d="M4.5 9c3.5 1 7 1 10.5-1"/><path d="M7 16.5c3.5-1 7-1 10-3"/><path d="M12 3c1 3.5 1 7-1 10.5"/><path d="M16.5 7c-1 3.5-1 7 3 10"/>`,
  frame: `<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 20"/>`,
  gift: `<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>`,
  leaf: `<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>`,
  truck: `<rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`,

  // UI utility icons
  search: `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>`,
  whatsapp: `<path d="M12.004 2C6.48 2 2 6.48 2 12.004c0 1.954.563 3.778 1.536 5.325L2 22l4.808-1.503A9.957 9.957 0 0 0 12.004 22C17.528 22 22 17.52 22 12.004 22 6.48 17.528 2 12.004 2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17.472 14.382c-.226.635-1.305 1.215-1.824 1.294-.468.071-1.061.1-1.71-.107-.393-.125-.898-.292-1.544-.57-2.716-1.171-4.49-3.905-4.625-4.086-.135-.181-1.097-1.46-1.097-2.784 0-1.324.693-1.975.94-2.245.247-.27.539-.337.719-.337.18 0 .36 0 .517.008.165.008.388-.063.607.463.225.54.765 1.868.832 2.003.067.135.112.293.022.473-.09.18-.135.292-.27.45-.135.157-.284.351-.405.472-.135.135-.276.282-.119.552.157.27.7 1.154 1.504 1.87 1.034.924 1.905 1.21 2.175 1.345.27.135.427.112.584-.068.158-.18.675-.788.855-1.058.18-.27.36-.225.607-.135.247.09 1.572.741 1.842.876.27.135.45.203.517.315.068.113.068.653-.158 1.288z" fill="currentColor"/>`,
  bag: `<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>`,
  close: `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>`,
  "chevron-left": `<polyline points="15 18 9 12 15 6"/>`,
  "chevron-right": `<polyline points="9 18 15 12 9 6"/>`,
  "arrow-right": `<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>`,
  gem: `<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/>`
};

function icon(name, options = {}) {
  const inner = ICONS[name] || "";
  const size = options.size || 24;
  const cls = options.className ? ` class="${options.className}"` : "";
  const aria = options.ariaHidden !== false ? ' aria-hidden="true"' : "";
  if (name === "whatsapp") {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24"${cls}${aria}>${inner}</svg>`;
  }
  const stroke = options.strokeWidth || 1.5;
  const fill = options.fill || "none";
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}" stroke="currentColor" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"${cls}${aria}>${inner}</svg>`;
}
