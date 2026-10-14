// Tiny pub/sub: while a PNG/PDF export is in progress, components can switch
// to a "flat" layout (e.g. Tabs render all panels stacked) so the capture
// contains everything, not just the active tab.
const listeners = new Set();

export function onExportModeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setExportMode(on) {
  for (const fn of listeners) fn(on);
}
