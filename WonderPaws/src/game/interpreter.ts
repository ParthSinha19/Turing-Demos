import { animalById } from "./animals";
import type { Animal, ChallengeDefinition, Condition, ProgramNode, SimulationEvent, Scalar } from "./types";

const MAX_INSTRUCTIONS = 1200;
const MAX_LOOP_ITERATIONS = 10;
const MAX_NESTING = 6;

export interface ValidationResult {
  valid: boolean;
  error?: string;
  blockCount: number;
}

export interface ExecutionResult {
  destinations: Record<string, string | null>;
  events: SimulationEvent[];
  error?: string;
  instructionCount: number;
}

function countBlocks(nodes: ProgramNode[]): number {
  return nodes.reduce((count, node) => {
    if (node.type === "if") return count + 1 + countBlocks(node.then) + countBlocks(node.else);
    if (node.type === "repeat" || node.type === "while" || node.type === "forEach") return count + 1 + countBlocks(node.body);
    return count + 1;
  }, 0);
}

function validateCondition(condition: Condition, depth: number): string | undefined {
  if (!condition || typeof condition !== "object") return "One of your decision blocks is missing its condition.";
  if (depth > MAX_NESTING) return "That decision is nested too deeply. Try splitting it into smaller steps.";
  if (condition.kind === "predicate") {
    if (!condition.property || !condition.operator || condition.value === undefined || condition.value === null) {
      return "A decision block is missing one of its clues.";
    }
    const knownProperties = ["id", "speciesGroup", "worldId", "habitats", "movement", "properties", "climate", "size", "isMythical", "diet", "loopCounter"];
    if (!knownProperties.includes(condition.property)) return "That animal clue is not in the factory's handbook.";
    if (!["equals", "notEquals", "greaterThan", "lessThan", "includes", "excludes"].includes(condition.operator)) {
      return "That comparison block is not recognised.";
    }
    if (!["string", "number", "boolean"].includes(typeof condition.value)) return "Choose a simple value for this clue.";
    if (["size", "loopCounter"].includes(condition.property) && typeof condition.value !== "number") return "This clue needs a number to compare.";
    if (condition.property === "isMythical" && typeof condition.value !== "boolean") return "This clue needs a yes or no value.";
    if (["habitats", "movement", "properties"].includes(condition.property) && typeof condition.value !== "string") return "Choose a word to check in this animal clue.";
    if (["greaterThan", "lessThan"].includes(condition.operator) && !["size", "loopCounter"].includes(condition.property)) return "Greater than and less than need a number clue, such as size or loop counter.";
    if (["includes", "excludes"].includes(condition.operator) && !["habitats", "movement", "properties"].includes(condition.property)) return "Includes and excludes work with list clues such as habitat or movement.";
    return undefined;
  }
  if (condition.kind === "not") return validateCondition(condition.condition, depth + 1);
  if (condition.kind === "and" || condition.kind === "or") {
    if (!Array.isArray(condition.conditions) || condition.conditions.length < 2) {
      return "AND and OR need at least two clues to compare.";
    }
    for (const child of condition.conditions) {
      const error = validateCondition(child, depth + 1);
      if (error) return error;
    }
    return undefined;
  }
  return "Your program contains a decision block the factory does not understand.";
}

function validateNodes(nodes: ProgramNode[], challenge: ChallengeDefinition, depth: number, topLevel: boolean): string | undefined {
  if (!Array.isArray(nodes)) return "One of your blocks is missing its contents.";
  if (depth > MAX_NESTING) return "Your blocks are nested too deeply. Try using fewer layers.";
  if (nodes.length > 100) return "This program has too many blocks. Try a smaller set of instructions.";
  for (const node of nodes) {
    if (!node || typeof node !== "object" || typeof node.id !== "string") return "One of your blocks is incomplete.";
    if (node.type === "route") {
      if (!challenge.destinations.some((item) => item.id === node.destinationId)) return "That chute is not available in this challenge.";
    } else if (node.type === "if") {
      const conditionError = validateCondition(node.condition, depth + 1);
      if (conditionError) return conditionError;
      if (!node.then?.length && !node.else?.length) return "Your IF block needs an action in its THEN or ELSE section.";
      const thenError = validateNodes(node.then, challenge, depth + 1, false);
      if (thenError) return thenError;
      const elseError = validateNodes(node.else, challenge, depth + 1, false);
      if (elseError) return elseError;
    } else if (node.type === "repeat") {
      if (!Number.isInteger(node.times) || node.times < 1 || node.times > MAX_LOOP_ITERATIONS) return `Repeat must be set between 1 and ${MAX_LOOP_ITERATIONS} times.`;
      if (!node.body?.length) return "Your repeat block needs at least one instruction inside it.";
      const bodyError = validateNodes(node.body, challenge, depth + 1, false);
      if (bodyError) return bodyError;
    } else if (node.type === "while") {
      const conditionError = validateCondition(node.condition, depth + 1);
      if (conditionError) return conditionError;
      if (!node.body?.length) return "Your WHILE block needs at least one instruction inside it.";
      const bodyError = validateNodes(node.body, challenge, depth + 1, false);
      if (bodyError) return bodyError;
    } else if (node.type === "forEach") {
      if (!topLevel) return "A FOR EACH block must sit in the main program area.";
      if (node.collection !== "animals" || !node.body?.length) return "Your FOR EACH block needs an animal group and an instruction.";
      const bodyError = validateNodes(node.body, challenge, depth + 1, false);
      if (bodyError) return bodyError;
    } else {
      return "Your program contains a block the factory does not recognise.";
    }
  }
  return undefined;
}

export function validateProgram(program: ProgramNode[], challenge: ChallengeDefinition): ValidationResult {
  if (!Array.isArray(program) || program.length === 0) return { valid: false, error: "Add a block to your program before starting the belt.", blockCount: 0 };
  const error = validateNodes(program, challenge, 0, true);
  return { valid: !error, ...(error ? { error } : {}), blockCount: countBlocks(program) };
}

function getProperty(animal: Animal, property: string, loopCounter = 0): unknown {
  if (property === "loopCounter") return loopCounter;
  if (property === "speciesGroup" || property === "worldId" || property === "habitats" || property === "movement" || property === "properties" || property === "climate" || property === "size" || property === "isMythical" || property === "diet" || property === "id") {
    return animal[property];
  }
  return undefined;
}

export function evaluateCondition(condition: Condition, animal: Animal, loopCounter = 0): boolean {
  if (condition.kind === "not") return !evaluateCondition(condition.condition, animal, loopCounter);
  if (condition.kind === "and") return condition.conditions.every((child) => evaluateCondition(child, animal, loopCounter));
  if (condition.kind === "or") return condition.conditions.some((child) => evaluateCondition(child, animal, loopCounter));

  const actual = getProperty(animal, condition.property, loopCounter);
  if (actual === undefined) return false;
  if (condition.operator === "equals") return Array.isArray(actual) ? actual.includes(condition.value) : actual === condition.value;
  if (condition.operator === "notEquals") return Array.isArray(actual) ? !actual.includes(condition.value) : actual !== condition.value;
  if (condition.operator === "greaterThan") return typeof actual === "number" && typeof condition.value === "number" && actual > condition.value;
  if (condition.operator === "lessThan") return typeof actual === "number" && typeof condition.value === "number" && actual < condition.value;
  if (condition.operator === "includes") return Array.isArray(actual) && actual.includes(condition.value);
  if (condition.operator === "excludes") return Array.isArray(actual) && !actual.includes(condition.value);
  return false;
}

export function expectedDestination(animal: Animal, challenge: ChallengeDefinition): string {
  for (const rule of challenge.rules) {
    if (evaluateCondition(rule.condition, animal)) return rule.destinationId;
  }
  return challenge.defaultDestinationId;
}

function event(events: SimulationEvent[], type: SimulationEvent["type"], animal: Animal | undefined, message: string, extra: Partial<SimulationEvent> = {}) {
  events.push({ id: `event-${events.length + 1}`, type, ...(animal ? { animalId: animal.id, animalName: animal.displayName } : {}), message, ...extra });
}

export function executeProgram(program: ProgramNode[], challenge: ChallengeDefinition): ExecutionResult {
  const events: SimulationEvent[] = [];
  const destinations: Record<string, string | null> = {};
  const animalList = challenge.animalIds.map((id) => animalById[id]).filter((animal): animal is Animal => Boolean(animal));
  let instructionCount = 0;
  let executionError: string | undefined;

  const tick = () => {
    instructionCount += 1;
    if (instructionCount > MAX_INSTRUCTIONS) {
      executionError = "Your program is taking too many steps. Try simplifying it or checking your loop.";
      return false;
    }
    return true;
  };

  const executeNodes = (nodes: ProgramNode[], animal: Animal, currentDestination: { value: string | null }): void => {
    for (const node of nodes) {
      if (executionError || !tick()) return;
      event(events, "instruction-started", animal, `Running ${node.type === "if" ? "an IF decision" : node.type === "route" ? "a route action" : `a ${node.type} block`}.`);
      if (node.type === "route") {
        currentDestination.value = node.destinationId;
        const destination = challenge.destinations.find((item) => item.id === node.destinationId);
        event(events, "gate-opened", animal, `${destination?.label ?? "The gate"} opens.`, { destinationId: node.destinationId });
        event(events, "animal-routed", animal, `${animal.displayName} is sent to ${destination?.label ?? node.destinationId}.`, { destinationId: node.destinationId });
      } else if (node.type === "if") {
        const passed = evaluateCondition(node.condition, animal);
        event(events, "condition-evaluated", animal, `The IF condition is ${passed ? "true" : "false"}.`, { passed });
        event(events, "branch-selected", animal, passed ? "The THEN path is selected." : "The ELSE path is selected.", { passed });
        executeNodes(passed ? node.then : node.else, animal, currentDestination);
      } else if (node.type === "repeat") {
        for (let iteration = 0; iteration < node.times; iteration += 1) {
          if (executionError) return;
          executeNodes(node.body, animal, currentDestination);
        }
      } else if (node.type === "while") {
        let iterations = 0;
        while (evaluateCondition(node.condition, animal, iterations)) {
          if (iterations >= MAX_LOOP_ITERATIONS) {
            executionError = "This WHILE loop did not stop. Change its condition so the belt can move on.";
            return;
          }
          iterations += 1;
          executeNodes(node.body, animal, currentDestination);
          if (executionError) return;
        }
      }
    }
  };

  if (animalList.length === 0) return { destinations, events, error: "This shipment does not contain any animals yet.", instructionCount };
  for (const animal of animalList) {
    event(events, "animal-arrived", animal, `${animal.displayName} arrives on the conveyor.`);
    destinations[animal.id] = null;
  }

  for (const node of program) {
    if (node.type === "forEach") {
      for (const animal of animalList) {
        if (executionError) break;
        const currentDestination: { value: string | null } = { value: destinations[animal.id] ?? null };
        executeNodes(node.body, animal, currentDestination);
        destinations[animal.id] = currentDestination.value;
      }
    } else {
      for (const animal of animalList) {
        if (executionError) break;
        const currentDestination: { value: string | null } = { value: destinations[animal.id] ?? null };
        executeNodes([node], animal, currentDestination);
        destinations[animal.id] = currentDestination.value;
      }
    }
    if (executionError) break;
  }

  if (executionError) event(events, "execution-failed", undefined, executionError);
  return { destinations, events, ...(executionError ? { error: executionError } : {}), instructionCount };
}

export function calculateBlockCount(program: ProgramNode[]): number {
  return countBlocks(program);
}

export function isScalar(value: unknown): value is Scalar {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
