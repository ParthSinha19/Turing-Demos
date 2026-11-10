export const SAVE_KEY = 'detective-atlas-the-signal-files';
export const SAVE_VERSION = 1;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

export function createSavePayload(state) {
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    state: {
      screen: state.screen,
      player: state.player,
      hqLevel: state.hqLevel,
      activeMissionId: state.activeMissionId,
      missionSession: state.missionSession,
      completed: state.completed,
      unlocked: state.unlocked,
      evidence: state.evidence,
      gadgets: state.gadgets || ['magnifier'],
      concepts: state.concepts,
      discoveries: state.discoveries,
      characters: state.characters,
      links: state.links,
      storyFlags: state.storyFlags,
      settings: state.settings,
    },
  };
}

export function decodeSave(raw) {
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!isObject(parsed) || parsed.version !== SAVE_VERSION || !isObject(parsed.state)) return null;
    const s = parsed.state;
    if (!isObject(s.player) || !Array.isArray(s.completed) || !Array.isArray(s.unlocked) || !Array.isArray(s.evidence)) return null;
    return {
      ...s,
      screen: ['menu', 'customise', 'intro', 'hq', 'mission', 'cinematic'].includes(s.screen) ? s.screen : 'hq',
      missionSession: isObject(s.missionSession) ? s.missionSession : null,
      gadgets: Array.isArray(s.gadgets) ? s.gadgets : ['magnifier'],
      concepts: Array.isArray(s.concepts) ? s.concepts : [],
      discoveries: Array.isArray(s.discoveries) ? s.discoveries : [],
      characters: Array.isArray(s.characters) ? s.characters : ['detective', 'fern'],
      links: Array.isArray(s.links) ? s.links : [],
      storyFlags: Array.isArray(s.storyFlags) ? s.storyFlags : [],
      settings: isObject(s.settings) ? s.settings : {},
      hqLevel: Number.isInteger(s.hqLevel) ? Math.min(3, Math.max(1, s.hqLevel)) : 1,
      activeMissionId: typeof s.activeMissionId === 'string' ? s.activeMissionId : null,
    };
  } catch {
    return null;
  }
}

function resolveStorage(storage) {
  if (storage !== undefined) return storage;
  try {
    return globalThis.localStorage;
  } catch {
    // Some privacy modes throw even when the localStorage property is read.
    return null;
  }
}

export function loadSave(storage) {
  try {
    const store = resolveStorage(storage);
    if (!store) return null;
    return decodeSave(store.getItem(SAVE_KEY));
  } catch {
    return null;
  }
}

export function saveState(state, storage) {
  try {
    const store = resolveStorage(storage);
    if (!store) return false;
    store.setItem(SAVE_KEY, JSON.stringify(createSavePayload(state)));
    return true;
  } catch {
    // Private browsing / quota restrictions should never stop the game.
    return false;
  }
}

export function clearSave(storage) {
  try {
    resolveStorage(storage)?.removeItem(SAVE_KEY);
  } catch {
    // The game can still be played in a session-only mode.
  }
}
