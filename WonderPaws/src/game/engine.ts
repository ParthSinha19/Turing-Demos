import { animalById } from "./animals";
import { levelById } from "./levels";
import { calculateBlockCount, executeProgram, expectedDestination, validateProgram } from "./interpreter";
import type { ChallengeDefinition, ChallengeRunResult, ProgramNode } from "./types";

export function runChallenge(levelId: string, challengeId: string, program: ProgramNode[]): ChallengeRunResult {
  const level = levelById[levelId];
  const challenge = level?.challenges.find((item) => item.id === challengeId);
  if (!challenge) {
    return {
      valid: false, completed: false, success: false, animalsSorted: 0, totalAnimals: 0,
      mistakes: 0, correct: 0, blockCount: 0, stars: 0, efficiencyMet: false,
      events: [], feedback: [{ tone: "error", message: "This challenge could not be found. Return to the level map and choose another one." }],
      error: "Challenge not found.",
    };
  }

  const validation = validateProgram(program, challenge);
  if (!validation.valid) {
    return {
      valid: false, completed: false, success: false, animalsSorted: 0, totalAnimals: challenge.animalIds.length,
      mistakes: 0, correct: 0, blockCount: validation.blockCount, stars: 0, efficiencyMet: false,
      events: [], feedback: [{ tone: "hint", message: validation.error ?? "Check your blocks and try again." }],
      ...(validation.error ? { error: validation.error } : {}),
    };
  }

  const simulation = executeProgram(program, challenge);
  const events = [...simulation.events];
  const feedback: ChallengeRunResult["feedback"] = [];
  let correct = 0;
  let mistakes = 0;
  let animalsSorted = 0;

  for (const animalId of challenge.animalIds) {
    const animal = animalById[animalId];
    if (!animal) continue;
    const selected = simulation.destinations[animalId];
    const expected = expectedDestination(animal, challenge);
    const destination = challenge.destinations.find((item) => item.id === selected);
    const correctDestination = challenge.destinations.find((item) => item.id === expected);
    if (selected) animalsSorted += 1;
    if (selected === expected) {
      correct += 1;
      events.push({
        id: `event-${events.length + 1}`,
        type: "animal-sorted-correctly",
        animalId,
        animalName: animal.displayName,
        destinationId: selected,
        correctDestinationId: expected,
        message: `${animal.displayName} found the right home: ${correctDestination?.label ?? expected}.`,
        passed: true,
      });
    } else {
      mistakes += 1;
      const message = selected
        ? `${animal.displayName} went to ${destination?.label ?? "the wrong place"}. Try ${correctDestination?.label ?? "another habitat"} instead.`
        : `${animal.displayName} did not receive a route. Add a route action for this animal.`;
      events.push({
        id: `event-${events.length + 1}`,
        type: "animal-sorted-incorrectly",
        animalId,
        animalName: animal.displayName,
        ...(selected ? { destinationId: selected } : {}),
        correctDestinationId: expected,
        message,
        passed: false,
      });
      feedback.push({ tone: "error", message });
    }
  }

  if (simulation.error) feedback.push({ tone: "error", message: simulation.error });
  const totalAnimals = challenge.animalIds.length;
  const completed = !simulation.error && totalAnimals > 0 && animalsSorted === totalAnimals;
  const efficiencyMet = validation.blockCount <= challenge.efficiencyTarget;
  const stars = completed ? (mistakes === 0 ? (efficiencyMet ? 3 : 2) : 1) : 0;

  if (completed && mistakes === 0) {
    feedback.unshift({ tone: "success", message: "Brilliant sorting! Every animal reached the correct habitat." });
    if (efficiencyMet) feedback.push({ tone: "success", message: "You also met the block target. Three stars for this challenge!" });
    events.push({ id: `event-${events.length + 1}`, type: "challenge-completed", message: "The shipment is sorted. Challenge complete!", passed: true });
  } else if (completed) {
    feedback.unshift({ tone: "hint", message: "Every animal reached a chute. Some are in the wrong habitat, so try again to improve your stars." });
    events.push({ id: `event-${events.length + 1}`, type: "challenge-completed", message: "The shipment is routed. Replay to improve the sorting accuracy.", passed: true });
  } else if (feedback.length === 0) {
    feedback.push({ tone: "hint", message: "The animals still need a little help. Check your IF conditions and default route." });
  }

  return {
    valid: !simulation.error,
    completed,
    success: completed,
    animalsSorted,
    totalAnimals,
    mistakes,
    correct,
    blockCount: validation.blockCount,
    stars,
    efficiencyMet,
    events,
    feedback,
    ...(simulation.error ? { error: simulation.error } : {}),
  };
}

export function getLevelChallenges(levelId: string): ChallengeDefinition[] {
  return levelById[levelId]?.challenges ?? [];
}

export function getLevelById(levelId: string) {
  return levelById[levelId];
}

export function programBlockCount(program: ProgramNode[]) {
  return calculateBlockCount(program);
}
