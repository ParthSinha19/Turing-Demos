import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_PLAYER, initialState, gameReducer } from '../src/state/gameReducer.js';
import { getMission } from '../src/data/missions.js';

function readyToComplete(missionId) {
  let state = { ...initialState };
  state = gameReducer(state, { type: 'START_MISSION', missionId });
  state = gameReducer(state, { type: 'MISSION_SESSION', missionId, patch: { phase: 'play', value: { answer: 'ok' }, status: 'success' } });
  return state;
}

test('a successful mission grants authored rewards and unlocks its next case', () => {
  const mission = getMission('forest-1');
  const state = readyToComplete(mission.id);
  const completed = gameReducer(state, { type: 'COMPLETE_MISSION', mission });
  assert.ok(completed.completed.includes('forest-1'));
  assert.ok(completed.unlocked.includes('forest-1b'));
  assert.ok(completed.evidence.includes('ev-feather'));
  assert.ok(completed.concepts.includes('concept-data'));
  assert.ok(completed.characters.includes('pip'));
  assert.equal(completed.discoveries[0].missionId, 'forest-1');
});

test('a mission cannot be completed before successful validation or from the wrong session', () => {
  const mission = getMission('forest-1');
  const idle = gameReducer(initialState, { type: 'START_MISSION', missionId: mission.id });
  assert.deepEqual(gameReducer(idle, { type: 'COMPLETE_MISSION', mission }), idle);
  const ready = readyToComplete(mission.id);
  assert.deepEqual(gameReducer(ready, { type: 'COMPLETE_MISSION', mission: getMission('forest-2') }), ready);
});

test('new game clears progress while retaining accessibility and reading settings', () => {
  const state = {
    ...initialState,
    completed: ['forest-1'],
    evidence: ['ev-feather'],
    settings: { ...initialState.settings, bigText: true, reduceMotion: true },
  };
  const fresh = gameReducer(state, { type: 'NEW_GAME' });
  assert.deepEqual(fresh.completed, []);
  assert.deepEqual(fresh.evidence, []);
  assert.deepEqual(fresh.unlocked, ['forest-1']);
  assert.equal(fresh.settings.bigText, true);
  assert.equal(fresh.settings.reduceMotion, true);
  assert.equal(fresh.player.name, DEFAULT_PLAYER.name);
  assert.equal(fresh.hasSave, true, 'a clean new game still persists preferences and the new profile');
});

test('the Forest finale is the progression gate for the orbital network', () => {
  assert.deepEqual(initialState.unlocked, ['forest-1']);
  const mission = getMission('forest-5');
  const ready = readyToComplete(mission.id);
  const complete = gameReducer(ready, { type: 'COMPLETE_MISSION', mission });
  assert.ok(complete.evidence.includes('ev-shard'));
  assert.ok(complete.unlocked.includes('space-1'));
  assert.equal(complete.hqLevel, 3);
  assert.ok(complete.storyFlags.includes('completed:forest-5'));
  assert.ok(complete.gadgets.includes('tablet'));
});

test('case rewards unlock gadgets in the same save as story progress', () => {
  for (const [missionId, gadgetId] of [['forest-3', 'scanner'], ['forest-5', 'tablet'], ['space-2', 'torch']]) {
    const mission = getMission(missionId);
    const state = readyToComplete(missionId);
    const complete = gameReducer(state, { type: 'COMPLETE_MISSION', mission });
    assert.ok(complete.gadgets.includes(gadgetId), `${missionId} unlocks ${gadgetId}`);
  }
});
