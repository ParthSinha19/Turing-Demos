import { animals, animalsByWorld } from "./animals";
import type { AnimalProperty, BlockType, ChallengeDefinition, Condition, Destination, LevelDefinition, RoutingRule, Scalar } from "./types";

export const destinationLibrary: Record<string, Destination> = {
  farm: { id: "farm", label: "Farmyard", shortLabel: "Farm", accent: "var(--sun)", description: "The safe farmyard." },
  coop: { id: "coop", label: "Chicken Coop", shortLabel: "Coop", accent: "var(--tomato)", description: "A cosy home for chickens." },
  pond: { id: "pond", label: "Pond", shortLabel: "Pond", accent: "var(--ice)", description: "A watery home for swimmers." },
  aviary: { id: "aviary", label: "Bird Meadow", shortLabel: "Birds", accent: "var(--leaf)", description: "An open meadow for birds." },
  meadow: { id: "meadow", label: "Green Meadow", shortLabel: "Meadow", accent: "var(--leaf)", description: "A meadow for other farm visitors." },
  barn: { id: "barn", label: "Big Barn", shortLabel: "Barn", accent: "var(--copper)", description: "A sheltered home for farm animals." },
  antarctic: { id: "antarctic", label: "Antarctic Coast", shortLabel: "Antarctic", accent: "var(--ice)", description: "The southern polar coast, home to penguins." },
  arctic: { id: "arctic", label: "Arctic Tundra", shortLabel: "Arctic", accent: "var(--ice)", description: "The northern polar region, home to polar bears." },
  polar: { id: "polar", label: "Polar Shore", shortLabel: "Polar", accent: "var(--ice)", description: "A shared coastal zone for polar visitors." },
  water: { id: "water", label: "Water Habitat", shortLabel: "Water", accent: "var(--teal)", description: "A habitat for animals that swim." },
  land: { id: "land", label: "Land Habitat", shortLabel: "Land", accent: "var(--leaf)", description: "A habitat for animals that travel on land." },
  large: { id: "large", label: "Large Animal Field", shortLabel: "Large", accent: "var(--copper)", description: "A spacious field for larger animals." },
  small: { id: "small", label: "Little Critter Grove", shortLabel: "Small", accent: "var(--leaf)", description: "A sheltered grove for smaller animals." },
  mobile: { id: "mobile", label: "Explorer Bay", shortLabel: "Explorer", accent: "var(--teal)", description: "A place for animals that travel through air or water." },
  ground: { id: "ground", label: "Ground Garden", shortLabel: "Ground", accent: "var(--leaf)", description: "A safe ground-level habitat." },
  sky: { id: "sky", label: "Sky Perch", shortLabel: "Sky", accent: "var(--ice)", description: "An open area for flying animals." },
  giant: { id: "giant", label: "Giant Dinosaur Valley", shortLabel: "Giants", accent: "var(--copper)", description: "A wide valley for very large creatures." },
  dinosaur: { id: "dinosaur", label: "Dinosaur Reserve", shortLabel: "Dinos", accent: "var(--leaf)", description: "A prehistoric home for dinosaurs." },
  prehistoric: { id: "prehistoric", label: "Prehistoric Garden", shortLabel: "Prehistoric", accent: "var(--copper)", description: "A green valley for prehistoric animals." },
  herbivore: { id: "herbivore", label: "Fern Garden", shortLabel: "Herbivores", accent: "var(--leaf)", description: "A leafy garden for plant eaters." },
  carnivore: { id: "carnivore", label: "Hunter's Hollow", shortLabel: "Carnivores", accent: "var(--tomato)", description: "A separate habitat for meat eaters." },
  magic: { id: "magic", label: "Magic Garden", shortLabel: "Magic", accent: "var(--plum)", description: "A special home for mythical creatures." },
  horn: { id: "horn", label: "Crystal Stable", shortLabel: "Crystal", accent: "var(--plum)", description: "A glowing stable for horned creatures." },
  enchanted: { id: "enchanted", label: "Enchanted Grove", shortLabel: "Grove", accent: "var(--leaf)", description: "A quiet enchanted woodland." },
  dragon: { id: "dragon", label: "Dragon Cave", shortLabel: "Dragon", accent: "var(--tomato)", description: "A warm cave for dragons." },
  sky_castle: { id: "sky_castle", label: "Cloud Castle", shortLabel: "Clouds", accent: "var(--ice)", description: "A floating home for flying creatures." },
  fire: { id: "fire", label: "Fire Forge", shortLabel: "Fire", accent: "var(--tomato)", description: "A warm place for fire-associated creatures." },
  cool: { id: "cool", label: "Cool Crystal Grove", shortLabel: "Cool", accent: "var(--ice)", description: "A cool, peaceful magical habitat." },
  sea: { id: "sea", label: "Moonlit Lagoon", shortLabel: "Lagoon", accent: "var(--teal)", description: "A magical sea habitat." },
  fantasy: { id: "fantasy", label: "Fantasy Sanctuary", shortLabel: "Fantasy", accent: "var(--plum)", description: "A home for magical visitors." },
  real: { id: "real", label: "Wildlife Sanctuary", shortLabel: "Wildlife", accent: "var(--leaf)", description: "A home for real-world animals." },
  sanctuary: { id: "sanctuary", label: "Central Sanctuary", shortLabel: "Sanctuary", accent: "var(--sun)", description: "A welcoming place for every visitor." },
  explorer: { id: "explorer", label: "Air and Water Pavilion", shortLabel: "Pavilion", accent: "var(--teal)", description: "A home for animals that travel through air or water." },
  garden: { id: "garden", label: "Grand Garden", shortLabel: "Garden", accent: "var(--leaf)", description: "A spacious home for sanctuary residents." },
};

const p = (property: AnimalProperty, operator: "equals" | "notEquals" | "greaterThan" | "lessThan" | "includes" | "excludes", value: Scalar): Condition => ({ kind: "predicate", property, operator, value });
const eq = (property: AnimalProperty, value: Scalar) => p(property, "equals", value);
const neq = (property: AnimalProperty, value: Scalar) => p(property, "notEquals", value);
const gt = (property: "size" | "loopCounter", value: number) => p(property, "greaterThan", value);
const has = (property: "habitats" | "movement" | "properties", value: string) => p(property, "includes", value);
const notHas = (property: "habitats" | "movement" | "properties", value: string) => p(property, "excludes", value);
const and = (...conditions: Condition[]): Condition => ({ kind: "and", conditions });
const or = (...conditions: Condition[]): Condition => ({ kind: "or", conditions });
const not = (condition: Condition): Condition => ({ kind: "not", condition });
const r = (condition: Condition, destinationId: string, explanation: string): RoutingRule => ({ condition, destinationId, explanation });

const worldLevels = [
  {
    id: "meadows", name: "Domestic Meadows", concept: "First steps: instructions, decisions, repetition and debugging", focus: "Clucky and the farm animals", levels: [
      ["Welcome to the Farm", "Instructions and sequence", "Follow the instructions in order and send each visitor to the farmyard."],
      ["The Missing Chickens", "Ordering actions and simple routes", "Guide the farm visitors through the correct gates without skipping a step."],
      ["Chicken Crossing", "First IF condition", "Check whether an animal is a chicken. Chickens go to the coop; other visitors use the meadow."],
      ["Duck or Chicken?", "IF / ELSE", "Separate ducks from chickens by checking the animal's species."],
      ["The Unexpected Visitor", "ELSE as a default route", "Send the special visitor to the right place and give everyone else a safe default route."],
      ["The Busy Farm", "Repeating a simple action", "Use a repeat block to operate the same gate action several times."],
      ["Two Farm Gates", "Multiple conditions", "Use more than one test to choose the correct farm gate."],
      ["Broken Conveyor", "Basic debugging and testing", "Inspect the sorting rule, find the mistake and test the repaired program."],
      ["The Mixed Shipment", "Combining sequences and decisions", "Combine actions and decisions to sort a mixed delivery."],
      ["Farm Factory Master", "Independent mixed assessment", "Use everything learned to restore the farm factory for the final shift."],
    ] as const,
  },
  {
    id: "frozen", name: "Frozen Kingdom", concept: "Animal properties, comparisons and Boolean logic", focus: "Pip and the polar animals", levels: [
      ["Welcome to the Ice", "Refresher: IF / ELSE", "Welcome the polar visitors and refresh your sorting decisions."],
      ["Penguin Parade", "Reading animal properties", "Read the animal's habitat property to separate penguins from other polar visitors."],
      ["The Swimming Test", "Sorting by movement properties", "Look at movement abilities and send swimmers to the water habitat."],
      ["Arctic or Antarctic?", "Multiple habitat conditions", "Keep the north and south polar habitats separate. Polar bears belong in the Arctic; penguins belong in Antarctica."],
      ["The Snowy Conveyor", "Comparison operators", "Compare animal sizes to choose between the large and small habitats."],
      ["The Polar Sorting Machine", "AND", "Use AND when both animal properties must match."],
      ["The Confused Penguin", "OR", "Use OR when either one of two conditions is enough."],
      ["The Flying Penguin?!", "NOT", "Use NOT to find animals that do not have a particular ability. Penguins cannot fly."],
      ["The Frozen Factory", "Combining conditions", "Combine property checks to sort the final mixed polar shipment."],
      ["Save the Ice Sanctuary", "Independent mixed assessment", "Restore the frozen habitats using conditions, comparisons and Boolean logic."],
    ] as const,
  },
  {
    id: "jurassic", name: "Jurassic Jungle", concept: "Repetition, loops, lists and debugging repeated behaviour", focus: "Rex and the dinosaur collection", levels: [
      ["Welcome to Jurassic Jungle", "Refresher: decisions and properties", "Use familiar decisions to welcome the prehistoric visitors."],
      ["The Dinosaur Parade", "Sequential routing", "Route the prehistoric visitors in the right order."],
      ["Too Many Dinosaurs!", "FOR loop", "Use a FOR EACH block to repeat a sorting instruction for every animal in the group."],
      ["Repeat the Operation", "Repeated actions", "Use a repeat block to operate a prehistoric sorting gate more than once."],
      ["The Endless Conveyor", "WHILE loop", "Keep repeating while the conveyor condition remains true, then stop safely."],
      ["The Hungry T-Rex", "Conditional loops", "Use a loop condition to stop when the right dinosaur reaches the scanner."],
      ["Dinosaur Classification", "Lists and groups", "Work with a group of dinosaurs and separate plant eaters from meat eaters."],
      ["Broken Dinosaur Machine", "Debugging loops", "Find and repair a loop that repeats too many times."],
      ["The Prehistoric Mix", "Combining loops and conditions", "Combine loops with decisions to sort a complicated prehistoric delivery."],
      ["Jurassic Factory Master", "Independent mixed assessment", "Use the full toolkit to reopen the Jurassic factory."],
    ] as const,
  },
  {
    id: "mythical", name: "Mythical Realms", concept: "Nested conditions, compound logic and advanced decisions", focus: "Lumi and the magical creatures", levels: [
      ["Welcome to Magic", "Refresher: conditions", "Refresh your decision-making skills in a magical sorting hall."],
      ["Unicorn Identification", "Reviewing properties", "Read creature properties to identify the unicorn and its visitors."],
      ["The Magical Gate", "Nested IF", "Place one IF decision inside another to choose a more specific destination."],
      ["The Dragon Test", "Compound AND conditions", "Check more than one magical property before opening the dragon gate."],
      ["The Phoenix Problem", "Compound OR conditions", "Open the sky route when either of the two clues matches."],
      ["The Invisible Creature", "NOT in compound rules", "Combine NOT with other conditions to find the creature that does not match a clue."],
      ["The Three-headed Hydra", "Multiple nested conditions", "Use several layers of decisions to sort the mysterious visitors."],
      ["The Magic Machine is Broken", "Debugging complex logic", "Inspect a complicated decision tree and repair its branches."],
      ["The Mythical Mixture", "Compound logic and classification", "Combine all the magical clues to sort the mixed delivery."],
      ["The Great Magical Factory", "Independent mixed assessment", "Complete the final magical sorting shift without losing track of a single creature."],
    ] as const,
  },
  {
    id: "sanctuary", name: "Grand Sanctuary", concept: "Transfer, mastery and mixed-world challenges", focus: "Clucky and Pip return as co-supervisors", levels: [
      ["The Grand Opening", "Mixed animal types and familiar rules", "Welcome visitors from every world and give each one a safe home."],
      ["Air, Land and Water", "Multi-property classification", "Combine movement properties to choose between air, land and water destinations."],
      ["Real or Magical?", "Real-world and mythical properties", "Separate real-world animals from fantasy creatures."],
      ["The Great Penguin Escape", "Multiple routing decisions", "Guide the penguin family back to its Antarctic home while sorting other visitors."],
      ["Chicken Invasion", "Efficient repetition", "Use repetition to handle a large group of farm visitors efficiently."],
      ["Dinosaur Delivery", "Nested conditions", "Use nested decisions to find the correct prehistoric habitat."],
      ["The Rare Animal Shipment", "Unfamiliar property combinations", "Sort rare visitors by the clues in their animal records."],
      ["The Broken Sanctuary", "Complex debugging", "Repair a tangled program before the next delivery arrives."],
      ["The Master Sorter", "Multiple simultaneous rules", "Combine several rules to classify visitors from all five worlds."],
      ["The Ultimate Animal Factory", "Final independent assessment", "Prove your mastery and welcome every animal to the Grand Sanctuary."],
    ] as const,
  },
];

const focusAnimals = [
  ["chicken", "chicken", "chicken", "duck", "goose", "chicken", "duck", "cow", "goose", "chicken"],
  ["baby_penguin", "emperor_penguin", "seal", "polar_bear", "arctic_fox", "walrus", "orca", "snowy_owl", "baby_penguin", "polar_bear"],
  ["trex", "diplodocus", "trex", "stegosaurus", "spinosaurus", "trex", "pteranodon", "brachiosaurus", "mosasaurus", "trex"],
  ["unicorn", "baby_dragon", "unicorn", "baby_dragon", "phoenix", "mermaid", "hydra", "phoenix", "sea_serpent", "unicorn"],
  ["chicken", "emperor_penguin", "unicorn", "baby_penguin", "chicken", "trex", "orca", "hydra", "pegasus", "chicken"],
];

function levelRules(worldIndex: number, levelIndex: number): { rules: RoutingRule[]; fallback: string; blocks: BlockType[] } {
  const common: BlockType[] = ["route", "if"];
  if (worldIndex === 0) {
    switch (levelIndex) {
      case 0: case 1: return { rules: [], fallback: "farm", blocks: ["route"] };
      case 2: return { rules: [r(eq("speciesGroup", "bird"), "coop", "Birds follow the bird gate.")], fallback: "meadow", blocks: common };
      case 3: return { rules: [r(eq("id", "duck"), "pond", "Ducks are routed to the pond.")], fallback: "farm", blocks: common };
      case 4: return { rules: [r(eq("speciesGroup", "bird"), "aviary", "Birds use the bird meadow.")], fallback: "barn", blocks: common };
      case 5: return { rules: [r(eq("id", "chicken"), "coop", "Chickens use their coop.")], fallback: "farm", blocks: ["route", "if", "repeat"] };
      case 6: return { rules: [r(and(eq("speciesGroup", "bird"), has("properties", "feathers")), "aviary", "Birds with feathers use the bird meadow.")], fallback: "barn", blocks: ["route", "if"] };
      case 7: return { rules: [r(eq("speciesGroup", "mammal"), "barn", "Mammals use the barn.")], fallback: "farm", blocks: common };
      case 8: return { rules: [r(and(eq("speciesGroup", "bird"), has("movement", "fly")), "aviary", "Flying birds use the bird meadow.")], fallback: "farm", blocks: ["route", "if"] };
      default: return { rules: [r(eq("speciesGroup", "mammal"), "barn", "Mammals use the barn."), r(eq("speciesGroup", "bird"), "coop", "Birds use the coop.")], fallback: "meadow", blocks: ["route", "if", "repeat"] };
    }
  }
  if (worldIndex === 1) {
    switch (levelIndex) {
      case 0: case 1: return { rules: [r(has("habitats", "antarctic"), "antarctic", "Animals with an Antarctic habitat go south.")], fallback: "arctic", blocks: common };
      case 2: return { rules: [r(has("movement", "swim"), "water", "Swimming animals use the water habitat.")], fallback: "land", blocks: common };
      case 3: return { rules: [r(has("habitats", "antarctic"), "antarctic", "Penguins belong in the Antarctic habitat."), r(has("habitats", "arctic"), "arctic", "Polar bears and Arctic animals belong in the Arctic habitat.")], fallback: "polar", blocks: ["route", "if"] };
      case 4: return { rules: [r(gt("size", 3), "large", "Animals larger than three use the large habitat.")], fallback: "small", blocks: common };
      case 5: return { rules: [r(and(eq("speciesGroup", "mammal"), eq("climate", "arctic")), "arctic", "Both clues must match: mammal AND Arctic climate.")], fallback: "polar", blocks: ["route", "if"] };
      case 6: return { rules: [r(or(has("movement", "swim"), has("movement", "fly")), "mobile", "Swimming OR flying is enough for the explorer bay.")], fallback: "ground", blocks: ["route", "if"] };
      case 7: return { rules: [r(not(has("movement", "fly")), "ground", "NOT flying means the ground route.")], fallback: "sky", blocks: ["route", "if"] };
      case 8: return { rules: [r(has("habitats", "antarctic"), "antarctic", "Antarctic visitors go south."), r(has("habitats", "arctic"), "arctic", "Arctic visitors stay north.")], fallback: "polar", blocks: ["route", "if"] };
      default: return { rules: [r(and(eq("climate", "arctic"), has("movement", "swim")), "arctic", "Arctic swimmers use the northern coast."), r(has("movement", "swim"), "water", "Other swimmers use the water habitat.")], fallback: "land", blocks: ["route", "if"] };
    }
  }
  if (worldIndex === 2) {
    switch (levelIndex) {
      case 0: case 1: return { rules: [r(eq("speciesGroup", "dinosaur"), "dinosaur", "Dinosaurs enter the dinosaur reserve.")], fallback: "sanctuary", blocks: common };
      case 2: return { rules: [], fallback: "dinosaur", blocks: ["route", "forEach"] };
      case 3: return { rules: [], fallback: "prehistoric", blocks: ["route", "repeat"] };
      case 4: return { rules: [r(has("movement", "swim"), "water", "Swimming prehistoric creatures use the lagoon.")], fallback: "dinosaur", blocks: ["route", "while", "if"] };
      case 5: return { rules: [r(eq("diet", "carnivore"), "carnivore", "Meat eaters use the hunter's hollow.")], fallback: "herbivore", blocks: ["route", "while", "if"] };
      case 6: return { rules: [r(and(eq("speciesGroup", "dinosaur"), eq("diet", "herbivore")), "herbivore", "Plant-eating dinosaurs use the fern garden.")], fallback: "carnivore", blocks: ["route", "forEach", "if"] };
      case 7: return { rules: [r(gt("size", 3), "giant", "Large dinosaurs use the wide valley.")], fallback: "dinosaur", blocks: ["route", "while", "if"] };
      case 8: return { rules: [r(and(eq("speciesGroup", "dinosaur"), has("movement", "land")), "dinosaur", "Land dinosaurs use the reserve."), r(has("movement", "swim"), "water", "Swimming visitors use the lagoon.")], fallback: "prehistoric", blocks: ["route", "forEach", "if"] };
      default: return { rules: [r(eq("speciesGroup", "dinosaur"), "dinosaur", "Dinosaurs use the reserve."), r(has("movement", "swim"), "water", "Swimmers use the lagoon.")], fallback: "sanctuary", blocks: ["route", "forEach", "if", "repeat"] };
    }
  }
  if (worldIndex === 3) {
    switch (levelIndex) {
      case 0: case 1: return { rules: [r(eq("isMythical", true), "magic", "Mythical creatures enter the magic garden.")], fallback: "sanctuary", blocks: common };
      case 2: return { rules: [r(and(eq("isMythical", true), has("movement", "water")), "sea", "Mythical swimmers enter the lagoon."), r(eq("isMythical", true), "magic", "Other mythical creatures enter the magic garden.")], fallback: "sanctuary", blocks: ["route", "if"] };
      case 3: return { rules: [r(and(eq("isMythical", true), has("properties", "fire")), "dragon", "Fire creatures use the dragon cave.")], fallback: "enchanted", blocks: ["route", "if"] };
      case 4: return { rules: [r(or(has("movement", "air"), has("movement", "fly")), "sky_castle", "Air OR flight sends a creature to the cloud castle.")], fallback: "enchanted", blocks: ["route", "if"] };
      case 5: return { rules: [r(not(has("properties", "fire")), "cool", "Creatures without the fire property use the cool grove.")], fallback: "fire", blocks: ["route", "if"] };
      case 6: return { rules: [r(and(eq("isMythical", true), has("movement", "water")), "sea", "Magical swimmers use the moonlit lagoon."), r(and(eq("isMythical", true), has("movement", "air")), "sky_castle", "Magical flyers use the cloud castle.")], fallback: "enchanted", blocks: ["route", "if"] };
      case 7: return { rules: [r(has("properties", "fire"), "fire", "Fire-associated creatures use the fire forge.")], fallback: "magic", blocks: ["route", "if"] };
      case 8: return { rules: [r(has("movement", "water"), "sea", "Water creatures use the lagoon.")], fallback: "sky_castle", blocks: ["route", "if"] };
      default: return { rules: [r(and(eq("isMythical", true), has("movement", "water")), "sea", "Mythical swimmers use the lagoon."), r(eq("isMythical", true), "magic", "Other mythical creatures use the magic garden.")], fallback: "sanctuary", blocks: ["route", "if", "repeat"] };
    }
  }
  switch (levelIndex) {
    case 0: return { rules: [r(eq("speciesGroup", "bird"), "aviary", "Birds use the bird meadow.")], fallback: "sanctuary", blocks: ["route", "if"] };
    case 1: return { rules: [r(has("movement", "air"), "sky_castle", "Air travellers use the cloud castle."), r(has("movement", "swim"), "water", "Swimmers use the water pavilion.")], fallback: "land", blocks: ["route", "if"] };
    case 2: return { rules: [r(eq("isMythical", true), "fantasy", "Fantasy creatures use the magical sanctuary.")], fallback: "real", blocks: ["route", "if"] };
    case 3: return { rules: [r(has("habitats", "antarctic"), "antarctic", "Penguins return to Antarctica.")], fallback: "sanctuary", blocks: ["route", "if"] };
    case 4: return { rules: [r(eq("speciesGroup", "bird"), "coop", "Birds use the bird-friendly coop.")], fallback: "farm", blocks: ["route", "if", "repeat"] };
    case 5: return { rules: [r(and(eq("speciesGroup", "dinosaur"), eq("diet", "carnivore")), "carnivore", "Carnivorous dinosaurs use Hunter's Hollow.")], fallback: "prehistoric", blocks: ["route", "if"] };
    case 6: return { rules: [r(gt("size", 3), "large", "Larger animals use the large sanctuary field.")], fallback: "small", blocks: ["route", "if"] };
    case 7: return { rules: [r(or(eq("isMythical", true), eq("climate", "polar")), "fantasy", "Magical OR polar visitors use the special wing.")], fallback: "sanctuary", blocks: ["route", "if"] };
    case 8: return { rules: [r(or(has("movement", "swim"), has("movement", "air")), "explorer", "Swimmers OR air travellers use the explorer pavilion.")], fallback: "garden", blocks: ["route", "if"] };
    default: return { rules: [r(eq("isMythical", true), "fantasy", "Mythical visitors use the fantasy sanctuary."), r(has("movement", "swim"), "water", "Swimmers use the water pavilion."), r(eq("speciesGroup", "bird"), "aviary", "Birds use the bird meadow.")], fallback: "sanctuary", blocks: ["route", "if", "repeat", "forEach"] };
  }
}

function challengeAnimals(worldIndex: number, levelIndex: number, challengeIndex: number): string[] {
  const worldId = worldLevels[worldIndex]?.id ?? "meadows";
  const roster = worldId === "sanctuary" ? animals.map((item) => item.id) : animalsByWorld[worldId as keyof typeof animalsByWorld] ?? animalsByWorld.meadows;
  const focus = focusAnimals[worldIndex]?.[levelIndex] ?? roster[0] ?? "chicken";
  const focusIndex = Math.max(0, roster.indexOf(focus));
  const size = challengeIndex === 0 ? 3 : challengeIndex === 1 ? 4 : 6;
  const offset = challengeIndex === 0 ? 0 : challengeIndex === 1 ? 2 : 4;
  const selected = [focus];
  for (let i = 0; selected.length < size; i += 1) {
    const candidate = roster[(focusIndex + offset + i) % roster.length] ?? focus;
    if (!selected.includes(candidate)) selected.push(candidate);
    if (i > roster.length + 2) break;
  }
  return selected;
}

function buildChallenge(worldIndex: number, levelIndex: number, challengeIndex: number): ChallengeDefinition {
  const world = worldLevels[worldIndex];
  if (!world) throw new Error(`Unknown world index ${worldIndex}`);
  const level = world.levels[levelIndex];
  if (!level) throw new Error(`Unknown level index ${levelIndex}`);
  const [title, concept] = level;
  const config = levelRules(worldIndex, levelIndex);
  const stage = (["guided", "practice", "independent"] as const)[challengeIndex] ?? "guided";
  const challengeId = `${world.id}-${String(levelIndex + 1).padStart(2, "0")}-${["a", "b", "c"][challengeIndex]}`;
  const animalIds = challengeAnimals(worldIndex, levelIndex, challengeIndex);
  const destinationIds = Array.from(new Set([config.fallback, ...config.rules.map((item) => item.destinationId)]));
  const destinations = destinationIds.map((id) => destinationLibrary[id]).filter((destination): destination is Destination => Boolean(destination));
  const availableBlocks = [...config.blocks];
  const tutorialId = levelTutorials[world.id]?.[levelIndex + 1];
  const stageBrief = stage === "guided"
    ? "Let's try this together. Watch the clues and build the first sorting rule."
    : stage === "practice"
      ? "You know the idea. Try a different shipment and check your program carefully."
      : "The final shipment is yours to solve. Build your program and start the belt.";
  const stageTitle = stage === "guided" ? "Guided challenge" : stage === "practice" ? "Practice challenge" : "Independent challenge";
  return {
    id: challengeId,
    title: `${stageTitle}: ${title}`,
    stage,
    briefing: `${stageBrief} ${level[2]}`,
    animalIds,
    destinations,
    rules: config.rules,
    defaultDestinationId: config.fallback,
    availableBlocks,
    concept,
    hint: config.rules.length === 0
      ? `Start with a route block and send each animal to ${destinationLibrary[config.fallback]?.label ?? config.fallback}.`
      : `Look for the clue: ${config.rules[0]?.explanation ?? "Check the animal properties."}`,
    efficiencyTarget: challengeIndex === 0 ? 5 : challengeIndex === 1 ? 4 : 3,
    ...(challengeIndex === 0 && tutorialId ? { tutorialId } : {}),
  };
}

const levelTutorials: Record<string, Record<number, string>> = {
  meadows: { 1: "sequence", 3: "if", 4: "else", 6: "repeat", 7: "multiple-conditions", 8: "debugging" },
  frozen: { 2: "properties", 4: "habitats", 5: "comparisons", 6: "and", 7: "or", 8: "not" },
  jurassic: { 3: "for-each", 5: "while", 6: "loop-conditions", 7: "lists", 8: "loop-debugging" },
  mythical: { 3: "nested-if", 4: "and", 5: "or", 6: "not", 7: "nested-if", 8: "debugging" },
  sanctuary: {},
};

export const levels: LevelDefinition[] = worldLevels.flatMap((world, worldIndex) => world.levels.map((entry, levelIndex) => {
  const [title, concept, briefing] = entry;
  return {
    id: `${world.id}-${String(levelIndex + 1).padStart(2, "0")}`,
    worldId: world.id,
    worldName: world.name,
    worldOrder: worldIndex + 1,
    order: levelIndex + 1,
    title,
    concept,
    briefing,
    ...(levelTutorials[world.id]?.[levelIndex + 1] ? { tutorialId: levelTutorials[world.id]?.[levelIndex + 1] as string } : {}),
    challenges: [0, 1, 2].map((challengeIndex) => buildChallenge(worldIndex, levelIndex, challengeIndex)),
  };
}));

export const levelById = Object.fromEntries(levels.map((level) => [level.id, level])) as Record<string, LevelDefinition>;
export const allChallengeIds = levels.flatMap((level) => level.challenges.map((challenge) => challenge.id));
export const worldDefinitions = worldLevels.map((world, index) => ({ id: world.id, name: world.name, order: index + 1, levelCount: world.levels.length, concept: world.concept, focus: world.focus }));
