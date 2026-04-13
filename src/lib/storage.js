const STORAGE_KEYS = {
  lastQuery: "atmos:last-query",
  lastCoords: "atmos:last-coords",
  snapshot: "atmos:last-snapshot",
  source: "atmos:last-source",
  unit: "atmos:temp-unit",
};

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadLastQuery() {
  if (!canUseStorage()) return "";
  return window.localStorage.getItem(STORAGE_KEYS.lastQuery) ?? "";
}

export function saveLastQuery(query) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.lastQuery, query);
  window.localStorage.setItem(STORAGE_KEYS.source, "search");
}

export function loadLastCoords() {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEYS.lastCoords);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLastCoords(coords) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.lastCoords, JSON.stringify(coords));
  window.localStorage.setItem(STORAGE_KEYS.source, "coords");
}

export function loadLastSource() {
  if (!canUseStorage()) return null;
  return window.localStorage.getItem(STORAGE_KEYS.source);
}

export function saveWeatherSnapshot(payload) {
  if (!canUseStorage()) return;

  const safePayload = {
    savedAt: Date.now(),
    data: payload,
  };

  window.localStorage.setItem(STORAGE_KEYS.snapshot, JSON.stringify(safePayload));
}

export function loadWeatherSnapshot() {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEYS.snapshot);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function loadTempUnit() {
  if (!canUseStorage()) return "C";
  const stored = window.localStorage.getItem(STORAGE_KEYS.unit);
  return stored === "F" ? "F" : "C";
}

export function saveTempUnit(unit) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEYS.unit, unit === "F" ? "F" : "C");
}
