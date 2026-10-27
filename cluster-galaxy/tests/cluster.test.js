import test from 'node:test';
import assert from 'node:assert/strict';
import { FEATURE_KEYS, STAGE4_TRAIN, STAGE4_TEST, STAGE5_TRAIN, STAGE5_TEST } from '../src/data/aliens.js';
import { trainKModes, predictCluster } from '../src/cluster.js';

test('training is repeatable for the same data and settings', () => {
  const first = trainKModes(STAGE4_TRAIN, ['color', 'shape', 'eyes'], 3);
  const second = trainKModes(STAGE4_TRAIN, ['color', 'shape', 'eyes'], 3);
  assert.deepEqual(first, second);
});

test('the selected features and group count are represented by the trained model', () => {
  const model = trainKModes(STAGE4_TRAIN, ['shape', 'wings'], 2);
  assert.deepEqual(model.features, ['shape', 'wings']);
  assert.equal(model.k, 2);
  assert.equal(model.members.length, 2);
  assert.ok(model.members.every((group) => group.length > 0));
});

test('different selected features can produce different model patterns', () => {
  const colourAware = trainKModes(STAGE4_TRAIN, ['color', 'shape', 'eyes'], 3);
  const shapeAware = trainKModes(STAGE4_TRAIN, ['shape', 'eyes', 'wings'], 3);
  assert.notDeepEqual(colourAware.modes, shapeAware.modes);
});

test('held-out examples are separate from training collections', () => {
  for (const [training, testing] of [[STAGE4_TRAIN, STAGE4_TEST], [STAGE5_TRAIN, STAGE5_TEST]]) {
    const trainingIds = new Set(training.map((alien) => alien.id));
    assert.ok(testing.every((alien) => !trainingIds.has(alien.id)));
    const model = trainKModes(training, FEATURE_KEYS.slice(0, 3), 3);
    assert.deepEqual(new Set(model.trainingIds), trainingIds);
  }
});

test('predicting an unseen alien does not change the trained model', () => {
  const model = trainKModes(STAGE5_TRAIN, ['shape', 'eyes', 'wings'], 3);
  const before = structuredClone(model);
  const prediction = predictCluster(STAGE5_TEST[0], model);
  assert.ok(prediction.cluster >= 0 && prediction.cluster < model.k);
  assert.ok(prediction.distance >= 0 && prediction.distance <= model.features.length);
  assert.deepEqual(model, before);
});

test('the model produces no empty groups across supported feature and group settings', () => {
  for (const training of [STAGE4_TRAIN, STAGE5_TRAIN]) {
    for (const k of [2, 3]) {
      for (let mask = 0; mask < (1 << FEATURE_KEYS.length); mask += 1) {
        const features = FEATURE_KEYS.filter((_, index) => (mask & (1 << index)) !== 0);
        if (features.length < 2) continue;
        const model = trainKModes(training, features, k);
        assert.ok(model.members.every((group) => group.length > 0), `${features.join(',')} with k=${k}`);
      }
    }
  }
});
