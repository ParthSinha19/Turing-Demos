import { featureValue } from './data/aliens.js';

export function distance(a, b, features) {
  if (!features.length) return 0;
  let different = 0;
  for (const key of features) if (featureValue(a, key) !== b[key]) different += 1;
  return different;
}

function modeFor(rows, feature, fallback) {
  const counts = new Map();
  for (const row of rows) {
    const value = featureValue(row, feature);
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  let bestValue = fallback;
  let bestCount = -1;
  for (const [value, count] of counts.entries()) {
    if (count > bestCount || (count === bestCount && value === fallback)) {
      bestValue = value;
      bestCount = count;
    }
  }
  return bestValue;
}

function prototypeFrom(alien, features) {
  return Object.fromEntries(features.map((key) => [key, featureValue(alien, key)]));
}

/** Deterministic categorical k-modes. It uses only the selected features. */
export function trainKModes(data, features, k) {
  if (!Array.isArray(data) || data.length < 2) throw new Error('Add at least two training aliens.');
  if (features.length < 2) throw new Error('Choose at least two features.');
  const clusterCount = Math.max(2, Math.min(k, data.length));

  // Deterministic farthest-first initialisation avoids random, hard-to-reproduce results.
  const seedAliens = [data[0]];
  while (seedAliens.length < clusterCount) {
    let candidate = data[0];
    let candidateDistance = -1;
    for (const alien of data) {
      if (seedAliens.includes(alien)) continue;
      const nearest = Math.min(...seedAliens.map((seed) => distance(alien, prototypeFrom(seed, features), features)));
      if (nearest > candidateDistance) {
        candidate = alien;
        candidateDistance = nearest;
      }
    }
    seedAliens.push(candidate);
  }

  let modes = seedAliens.map((alien) => prototypeFrom(alien, features));
  let assignments = data.map(() => 0);
  let iterations = 0;

  for (; iterations < 24; iterations += 1) {
    const nextAssignments = data.map((alien) => {
      let best = 0;
      let bestDistance = Infinity;
      modes.forEach((mode, index) => {
        const d = distance(alien, mode, features);
        if (d < bestDistance) { bestDistance = d; best = index; }
      });
      return best;
    });

    // Empty groups are given the most poorly matched specimen, deterministically.
    const counts = Array.from({ length: clusterCount }, (_, index) => nextAssignments.filter((v) => v === index).length);
    for (let empty = 0; empty < clusterCount; empty += 1) {
      if (counts[empty] !== 0) continue;
      let worstIndex = 0;
      let worstDistance = -1;
      data.forEach((alien, i) => {
        const d = distance(alien, modes[nextAssignments[i]], features);
        if (counts[nextAssignments[i]] > 1 && d > worstDistance) {
          worstDistance = d;
          worstIndex = i;
        }
      });
      counts[nextAssignments[worstIndex]] -= 1;
      nextAssignments[worstIndex] = empty;
      counts[empty] += 1;
    }

    const nextModes = modes.map((oldMode, index) => {
      const members = data.filter((_, rowIndex) => nextAssignments[rowIndex] === index);
      if (!members.length) return oldMode;
      return Object.fromEntries(features.map((feature) => [
        feature,
        modeFor(members, feature, oldMode[feature]),
      ]));
    });
    const stable = nextAssignments.every((value, i) => value === assignments[i]) &&
      nextModes.every((mode, i) => features.every((f) => mode[f] === modes[i][f]));
    assignments = nextAssignments;
    modes = nextModes;
    if (stable) { iterations += 1; break; }
  }

  return {
    features: [...features],
    k: clusterCount,
    modes,
    assignments,
    iterations,
    members: modes.map((_, i) => data.filter((__, rowIndex) => assignments[rowIndex] === i)),
    trainingIds: data.map((alien) => alien.id),
  };
}

export function predictCluster(alien, model) {
  let best = 0;
  let bestDistance = Infinity;
  model.modes.forEach((mode, index) => {
    const d = distance(alien, mode, model.features);
    if (d < bestDistance) { bestDistance = d; best = index; }
  });
  return { cluster: best, distance: bestDistance, features: model.features };
}

export function matchMessage(mismatches, featureCount) {
  const ratio = featureCount ? mismatches / featureCount : 1;
  if (ratio <= 0.25) return { title: 'Close match', detail: 'Most of the selected features fit this group.', tone: 'good' };
  if (ratio <= 0.5) return { title: 'Some differences', detail: 'This alien shares a few features, but not all.', tone: 'mid' };
  return { title: 'Let’s investigate', detail: 'This alien looks quite different from the group’s pattern.', tone: 'look' };
}
