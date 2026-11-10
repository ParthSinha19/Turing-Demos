import test from 'node:test';
import assert from 'node:assert/strict';
import { SAVE_KEY, SAVE_VERSION, createSavePayload, decodeSave, saveState, loadSave, clearSave } from '../src/state/save.js';

const exampleState = {
  screen: 'mission',
  player: { name: 'Detective Nova', outfit: 'flight' },
  hqLevel: 2,
  activeMissionId: 'forest-3',
  missionSession: { missionId: 'forest-3', phase: 'play', value: { order: ['b1'] }, status: 'idle', hintLevel: 1 },
  completed: ['forest-1', 'forest-2'],
  unlocked: ['forest-1', 'forest-2', 'forest-3'],
  evidence: ['ev-feather'],
  gadgets: ['magnifier', 'scanner'],
  concepts: ['concept-data'],
  discoveries: [{ id: 'd-forest-1', missionId: 'forest-1', text: 'A discovery.' }],
  characters: ['detective', 'fern', 'pip'],
  links: ['cx-1'],
  storyFlags: ['completed:forest-1'],
  settings: { sound: true, reduceMotion: true, textSpeed: 'fast', bigText: false },
};

function memoryStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.has(key) ? data.get(key) : null,
    setItem: (key, value) => data.set(key, String(value)),
    removeItem: (key) => data.delete(key),
  };
}

test('save payload is versioned and retains player, story and mid-mission state', () => {
  const payload = createSavePayload(exampleState);
  assert.equal(payload.version, SAVE_VERSION);
  assert.equal(payload.state.player.name, 'Detective Nova');
  assert.deepEqual(payload.state.missionSession, exampleState.missionSession);
  assert.deepEqual(payload.state.evidence, exampleState.evidence);
  assert.deepEqual(payload.state.gadgets, exampleState.gadgets);
  assert.deepEqual(payload.state.settings, exampleState.settings);
});

test('a save can be written and loaded through storage', () => {
  const storage = memoryStorage();
  assert.equal(saveState(exampleState, storage), true);
  const saved = loadSave(storage);
  assert.equal(saved.activeMissionId, 'forest-3');
  assert.equal(saved.screen, 'mission');
  assert.deepEqual(saved.missionSession, exampleState.missionSession);
  assert.deepEqual(saved.gadgets, exampleState.gadgets);
});

test('malformed and unsupported saves are rejected safely', () => {
  assert.equal(decodeSave('{not json'), null);
  assert.equal(decodeSave({ version: SAVE_VERSION + 1, state: {} }), null);
  assert.equal(decodeSave({ version: SAVE_VERSION, state: { completed: [], unlocked: [], evidence: [] } }), null);
});

test('storage helpers tolerate a blocked localStorage getter', () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('blocked'); } });
  try {
    assert.equal(loadSave(), null);
    assert.equal(saveState(exampleState), false);
    // clearSave is intentionally a no-op when storage cannot be accessed.
    assert.doesNotThrow(() => clearSave());
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('older saves without a gadget collection receive the starter gadget', () => {
  const { gadgets, ...olderState } = exampleState;
  const decoded = decodeSave({ version: SAVE_VERSION, state: olderState });
  assert.deepEqual(decoded.gadgets, ['magnifier']);
});
