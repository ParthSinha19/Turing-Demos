export type Scalar = string | number | boolean;
export type AnimalProperty =
  | "id"
  | "speciesGroup"
  | "worldId"
  | "habitats"
  | "movement"
  | "properties"
  | "climate"
  | "size"
  | "isMythical"
  | "diet"
  | "loopCounter";

export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "lessThan"
  | "includes"
  | "excludes";

export type Condition =
  | { kind: "predicate"; property: AnimalProperty; operator: ConditionOperator; value: Scalar }
  | { kind: "and"; conditions: Condition[] }
  | { kind: "or"; conditions: Condition[] }
  | { kind: "not"; condition: Condition };

export type ProgramNode =
  | { id: string; type: "route"; destinationId: string }
  | { id: string; type: "if"; condition: Condition; then: ProgramNode[]; else: ProgramNode[] }
  | { id: string; type: "repeat"; times: number; body: ProgramNode[] }
  | { id: string; type: "while"; condition: Condition; body: ProgramNode[] }
  | { id: string; type: "forEach"; collection: "animals"; body: ProgramNode[] };

export type BlockType = ProgramNode["type"];

export interface Animal {
  id: string;
  displayName: string;
  speciesGroup: string;
  worldId: string;
  habitats: string[];
  movement: string[];
  properties: string[];
  climate: string;
  size: number;
  isMythical: boolean;
  diet: string;
  assetKey: "chicken" | "penguin" | "cow" | "rabbit" | "trex" | "unicorn";
  description: string;
}

export interface Destination {
  id: string;
  label: string;
  shortLabel: string;
  accent: string;
  description: string;
}

export interface RoutingRule {
  condition: Condition;
  destinationId: string;
  explanation: string;
}

export interface ChallengeDefinition {
  id: string;
  title: string;
  stage: "guided" | "practice" | "independent";
  briefing: string;
  animalIds: string[];
  destinations: Destination[];
  rules: RoutingRule[];
  defaultDestinationId: string;
  availableBlocks: BlockType[];
  concept: string;
  hint: string;
  efficiencyTarget: number;
  tutorialId?: string;
}

export interface LevelDefinition {
  id: string;
  worldId: string;
  worldName: string;
  worldOrder: number;
  order: number;
  title: string;
  concept: string;
  briefing: string;
  tutorialId?: string;
  challenges: ChallengeDefinition[];
}

export interface SimulationEvent {
  id: string;
  type:
    | "animal-arrived"
    | "instruction-started"
    | "property-checked"
    | "condition-evaluated"
    | "branch-selected"
    | "gate-opened"
    | "animal-routed"
    | "animal-sorted-correctly"
    | "animal-sorted-incorrectly"
    | "challenge-completed"
    | "execution-failed";
  animalId?: string;
  animalName?: string;
  destinationId?: string;
  correctDestinationId?: string;
  message: string;
  value?: Scalar | null;
  passed?: boolean;
}

export interface FeedbackMessage {
  tone: "success" | "hint" | "error";
  message: string;
}

export interface ChallengeRunResult {
  valid: boolean;
  completed: boolean;
  success: boolean;
  animalsSorted: number;
  totalAnimals: number;
  mistakes: number;
  correct: number;
  blockCount: number;
  stars: number;
  efficiencyMet: boolean;
  events: SimulationEvent[];
  feedback: FeedbackMessage[];
  error?: string;
}

export interface ChallengeProgress {
  completed: boolean;
  bestStars: number;
  bestMistakes: number;
  bestBlockCount: number;
}

export interface PlayerProgress {
  version: number;
  completedChallengeIds: string[];
  challenges: Record<string, ChallengeProgress>;
  levels: Record<string, { completed: boolean; stars: number }>;
  academyCompletedIds: string[];
  discoveredAnimalIds: string[];
  updatedAt: string;
}
