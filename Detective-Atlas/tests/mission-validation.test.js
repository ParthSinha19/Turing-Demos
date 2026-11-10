import test from 'node:test';
import assert from 'node:assert/strict';
import { MISSIONS } from '../src/data/missions.js';
import { EVIDENCE, CONCEPTS } from '../src/data/evidence.js';
import { validateActivity } from '../src/lib/validate.js';

const allEvidenceIds = new Set(EVIDENCE.map((item) => item.id));
const allMissionIds = new Set(MISSIONS.map((mission) => mission.id));
const allGadgetIds = new Set(['magnifier', 'scanner', 'tablet', 'torch']);

function answerFor(mission) {
  const validation = mission.validation || mission.activity.validation;
  switch (mission.activity.type) {
    case 'classify': return { placements: validation.placements };
    case 'train': return { placements: validation.placements, prediction: validation.prediction };
    case 'process': return { order: validation.order, text: validation.accepted[0] };
    case 'match': return { pairs: validation.pairs };
    case 'sequence': return { order: validation.order, auditSelected: validation.auditSelected };
    case 'network': return { order: validation.order, selected: validation.selected };
    case 'prompt': return { slots: validation.slots, review: validation.review };
    case 'pattern': return { answer: validation.answer };
    case 'type': return { text: validation.accepted[0] };
    case 'choice':
    case 'compare': return { choice: validation.choice };
    case 'select': return { selected: validation.selected };
    case 'predict': return { answer: validation.answer };
    case 'debug': return { fixId: validation.fixId };
    default: throw new Error(`No test answer for ${mission.activity.type}`);
  }
}

function makeWrong(mission, correct) {
  const validation = mission.validation || mission.activity.validation;
  const wrong = structuredClone(correct);
  switch (mission.activity.type) {
    case 'classify': {
      const [id, expected] = Object.entries(validation.placements)[0];
      wrong.placements[id] = expected === 'fox' ? 'bird' : 'fox';
      break;
    }
    case 'train': {
      const [id, expected] = Object.entries(validation.placements)[0];
      wrong.placements[id] = expected === 'fox' ? 'bird' : 'fox';
      wrong.prediction = validation.prediction === 'fox' ? 'bird' : 'fox';
      break;
    }
    case 'process': wrong.order = [...wrong.order].reverse(); wrong.text = 'open_doro'; break;
    case 'match': {
      const [id, expected] = Object.entries(validation.pairs)[0];
      wrong.pairs[id] = expected === 'sett' ? 'pond' : 'sett';
      break;
    }
    case 'sequence': wrong.order = [...wrong.order].reverse(); if (wrong.auditSelected) wrong.auditSelected = ['clean']; break;
    case 'network': wrong.order = [...wrong.order].reverse(); wrong.selected = ['packet-normal']; break;
    case 'prompt': {
      const [id, expected] = Object.entries(validation.slots)[0];
      wrong.slots[id] = expected === 'a' ? 'b' : 'a';
      break;
    }
    case 'pattern': wrong.answer = '__wrong__'; break;
    case 'type': wrong.text = 'not_the_command'; break;
    case 'choice':
    case 'compare': wrong.choice = '__wrong__'; break;
    case 'select': wrong.selected = ['__wrong__']; break;
    case 'predict': wrong.answer = '__wrong__'; break;
    case 'debug': wrong.fixId = '__wrong__'; break;
  }
  return wrong;
}

test('the ten story cases are complete, connected and have answer contracts', () => {
  assert.equal(MISSIONS.length, 21);
  assert.equal(MISSIONS.filter((mission) => mission.realm === 'forest').length, 10);
  assert.equal(MISSIONS.filter((mission) => mission.realm === 'space').length, 11);
  assert.equal(allMissionIds.size, MISSIONS.length, 'mission IDs are unique');

  for (const mission of MISSIONS) {
    assert.ok(mission.validation || mission.activity.validation, `${mission.id} has validation data`);
    assert.ok(mission.activity.config, `${mission.id} has activity config`);
    assert.ok(CONCEPTS[mission.concept], `${mission.id} references a known concept`);
    for (const evidenceId of mission.evidence) assert.ok(allEvidenceIds.has(evidenceId), `${mission.id} rewards known evidence ${evidenceId}`);
    for (const gadgetId of mission.gadgets || []) assert.ok(allGadgetIds.has(gadgetId), `${mission.id} rewards known gadget ${gadgetId}`);
    for (const nextId of mission.unlocks) assert.ok(allMissionIds.has(nextId), `${mission.id} unlocks known mission ${nextId}`);
  }
});

test('every story activity accepts its authored solution and rejects a wrong solution', () => {
  for (const mission of MISSIONS) {
    const activity = { ...mission.activity, validation: mission.validation || mission.activity.validation };
    const correct = answerFor(mission);
    const accepted = validateActivity(activity, correct);
    assert.equal(accepted.ok, true, `${mission.id}: ${accepted.message}`);
    const rejected = validateActivity(activity, makeWrong(mission, correct));
    assert.equal(rejected.ok, false, `${mission.id} must reject an incorrect answer`);
    assert.ok(rejected.message.length > 8, `${mission.id} supplies constructive feedback`);
  }
});

test('the forest finale awards Pip’s shard before the first orbital signal case', () => {
  const finale = MISSIONS.find((mission) => mission.id === 'forest-5');
  const firstSpace = MISSIONS.find((mission) => mission.id === 'space-1');
  assert.ok(finale.evidence.includes('ev-shard'));
  assert.ok(!firstSpace.evidence.includes('ev-shard'));
  assert.equal(firstSpace.realm, 'space');
  assert.ok(finale.unlocks.includes('space-1'));
});

test('all evidence records identify their discovery chapter', () => {
  for (const item of EVIDENCE) assert.ok(Number.isInteger(item.originChapter) && item.originChapter >= 1 && item.originChapter <= 10, `${item.id} has an origin chapter`);
});

test('the footprint training activity requires labelled examples before a new prediction', () => {
  const mission = MISSIONS.find((item) => item.id === 'forest-2');
  const activity = { ...mission.activity, validation: mission.validation };
  const partial = validateActivity(activity, { placements: { p1: 'fox' } });
  assert.equal(partial.ok, false);
  assert.match(partial.message, /Label all/);
  const examples = { placements: mission.validation.placements };
  const awaitingPrediction = validateActivity(activity, examples);
  assert.equal(awaitingPrediction.ok, false);
  assert.match(awaitingPrediction.message, /new print/);
  const wrongPrediction = validateActivity(activity, { ...examples, prediction: 'bird' });
  assert.equal(wrongPrediction.ok, false);
  const correctPrediction = validateActivity(activity, { ...examples, prediction: 'fox' });
  assert.equal(correctPrediction.ok, true);
});

test('the airlock process requires both the correct sequence and corrected command', () => {
  const mission = MISSIONS.find((item) => item.id === 'space-2');
  const activity = { ...mission.activity, validation: mission.validation };
  const order = mission.validation.order;
  const missingCommand = validateActivity(activity, { order });
  assert.equal(missingCommand.ok, false);
  assert.match(missingCommand.message, /type the corrected/);
  const badOrder = validateActivity(activity, { order: [...order].reverse(), text: 'open_door' });
  assert.equal(badOrder.ok, false);
  const correct = validateActivity(activity, { order, text: 'open_door' });
  assert.equal(correct.ok, true);
});

test('the finale is three connected parts and ends with the send-off cinematic', () => {
  const ids = ['space-5', 'space-6', 'space-7'];
  ids.forEach((id, index) => {
    const mission = MISSIONS.find((item) => item.id === id);
    assert.equal(mission.chapter, 10);
    if (ids[index + 1]) assert.deepEqual(mission.unlocks, [ids[index + 1]]);
  });
  const last = MISSIONS.find((item) => item.id === 'space-7');
  assert.equal(last.cinematic, 'last-signal');
  assert.equal(last.ending, true);
  assert.deepEqual(last.unlocks, []);
});
