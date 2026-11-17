export interface TutorialStep {
  title: string;
  explanation: string;
  action: string;
  code?: string;
}

export interface TutorialDefinition {
  id: string;
  title: string;
  mascot: "Clucky" | "Pip" | "Rex" | "Lumi";
  summary: string;
  steps: TutorialStep[];
  example: string;
}

export const tutorials: TutorialDefinition[] = [
  { id: "sequence", title: "Instructions in order", mascot: "Clucky", summary: "A program is a set of instructions. The factory follows them in order, from top to bottom.", example: "send_to(\"farm\")", steps: [
    { title: "One step at a time", explanation: "A program is a list of instructions. The factory starts at the top and follows each block in order.", action: "Look at the program stack. The first block is the first instruction." },
    { title: "Add an action", explanation: "A route block tells the machine which habitat should receive an animal.", action: "Choose a route block and select a destination." },
    { title: "Run the belt", explanation: "When the belt starts, each animal follows the instructions you built.", action: "Press Run to see the result." },
  ] },
  { id: "if", title: "Make a decision with IF", mascot: "Clucky", summary: "An IF block checks a clue. Its inside action runs only when the clue is true.", example: "if animal.species == \"chicken\":\n    send_to(\"coop\")", steps: [
    { title: "Check a clue", explanation: "Animals have properties such as their group, habitat and movement. IF checks one of those clues.", action: "Add an IF block to your program." },
    { title: "Choose a path", explanation: "When the clue is true, the factory follows the THEN path. When it is false, it skips that path.", action: "Choose a property and a value for your IF condition." },
    { title: "Give the animal a home", explanation: "Place a route action inside the THEN path to send matching animals to their habitat.", action: "Choose the destination for the matching animal." },
  ] },
  { id: "else", title: "Use ELSE for the other path", mascot: "Clucky", summary: "ELSE gives the factory a second route when the IF clue is false.", example: "if animal.species == \"duck\":\n    send_to(\"pond\")\nelse:\n    send_to(\"farm\")", steps: [
    { title: "Two possible answers", explanation: "IF checks the clue. ELSE runs when that clue is not true.", action: "Look at the THEN and ELSE spaces in your IF block." },
    { title: "Avoid a missing route", explanation: "A clear ELSE action gives the other animals somewhere to go, instead of leaving them on the belt.", action: "Choose a second destination for ELSE." },
    { title: "Test both paths", explanation: "Try a shipment with an animal that matches and one that does not match.", action: "Run the program and watch both routes." },
  ] },
  { id: "repeat", title: "Repeat an instruction", mascot: "Clucky", summary: "A repeat block runs the instructions inside it a set number of times.", example: "for i in range(3):\n    open_gate()", steps: [
    { title: "Avoid doing the same thing again and again", explanation: "A loop repeats instructions for you. You choose how many times it should repeat.", action: "Add a Repeat block." },
    { title: "Set the number", explanation: "A repeat count tells the machine how many times to run its inside instructions.", action: "Choose a repeat count from 1 to 10." },
    { title: "Put an action inside", explanation: "The blocks inside the loop are the instructions that repeat.", action: "Add a route action inside the Repeat block." },
  ] },
  { id: "multiple-conditions", title: "Combine clues with AND", mascot: "Clucky", summary: "AND is true only when every clue is true.", example: "if animal.group == \"bird\" and animal.has_feathers:\n    send_to(\"aviary\")", steps: [
    { title: "More than one clue", explanation: "Sometimes one clue is not enough. You can check two properties together.", action: "Open an IF block and choose AND." },
    { title: "Both must match", explanation: "AND means every clue must be true before the THEN path runs.", action: "Choose two clues for the condition." },
    { title: "Test the rule", explanation: "Try an animal that matches both clues and one that matches only one.", action: "Run the belt and compare the routes." },
  ] },
  { id: "debugging", title: "Find and fix a mistake", mascot: "Clucky", summary: "Debugging means checking a program, finding what went wrong and trying a fix.", example: "if animal.group == \"bird\":\n    send_to(\"aviary\")", steps: [
    { title: "Watch what happened", explanation: "Look at which animal went to the wrong destination. That tells you which rule needs checking.", action: "Inspect the event list after a run." },
    { title: "Check the condition", explanation: "Make sure the property and value match the animal you wanted to find.", action: "Review the IF condition and its route." },
    { title: "Run it again", explanation: "A program can be tested many times. Each run helps you improve it.", action: "Change a block and run the belt again." },
  ] },
  { id: "properties", title: "Read animal properties", mascot: "Pip", summary: "Properties are clues about an animal, such as its group, size, habitat or movement.", example: "if \"antarctic\" in animal.habitats:\n    send_to(\"antarctic\")", steps: [
    { title: "Every animal has clues", explanation: "An animal record stores facts such as its species group, habitat, climate and movement.", action: "Select a property in an IF block." },
    { title: "Read a property", explanation: "Choose a property that helps you tell two kinds of animals apart.", action: "Compare the animal card with the property selector." },
    { title: "Use the clue", explanation: "The factory can use a property to choose a destination automatically.", action: "Build a rule using an animal property." },
  ] },
  { id: "habitats", title: "Compare habitats", mascot: "Pip", summary: "Habitat properties help distinguish where animals naturally belong.", example: "if \"arctic\" in animal.habitats:\n    send_to(\"arctic\")", steps: [
    { title: "North and south", explanation: "The Arctic is in the north. Antarctica is in the south. Polar bears are Arctic animals; penguins live in the Southern Hemisphere.", action: "Inspect the habitat clue on each animal." },
    { title: "Check a habitat", explanation: "An animal can have more than one habitat tag, such as coast and water.", action: "Choose the habitats property for your condition." },
    { title: "Route carefully", explanation: "Do not send a penguin to the Arctic or a polar bear to Antarctica.", action: "Use the matching habitat value in an IF block." },
  ] },
  { id: "comparisons", title: "Compare numbers", mascot: "Pip", summary: "Comparison blocks can check whether a number is greater or less than another number.", example: "if animal.size > 3:\n    send_to(\"large\")", steps: [
    { title: "Animals have sizes", explanation: "The size property is a number from 1 to 5 in this game.", action: "Choose the size property." },
    { title: "Greater or less", explanation: "Greater than checks for a bigger number. Less than checks for a smaller one.", action: "Choose a comparison operator and number." },
    { title: "Use a threshold", explanation: "A threshold helps separate large animals from smaller ones.", action: "Build a size rule and run the shipment." },
  ] },
  { id: "and", title: "AND: both clues must match", mascot: "Pip", summary: "An AND condition is true only when both clues are true.", example: "if animal.group == \"mammal\" and animal.climate == \"arctic\":\n    send_to(\"arctic\")", steps: [
    { title: "Two checks", explanation: "Use AND when an animal must match both properties.", action: "Add an AND condition." },
    { title: "Both are needed", explanation: "If even one clue is false, the combined condition is false.", action: "Choose two properties for your rule." },
    { title: "Test a near match", explanation: "Try an animal that matches one clue but not the other.", action: "Run the belt and watch the ELSE route." },
  ] },
  { id: "or", title: "OR: either clue can match", mascot: "Pip", summary: "An OR condition is true when at least one clue is true.", example: "if animal.can_swim or animal.can_fly:\n    send_to(\"explorer\")", steps: [
    { title: "Either can work", explanation: "OR is useful when two different clues should lead to the same destination.", action: "Choose OR in an IF condition." },
    { title: "One is enough", explanation: "The condition is true when the first clue or the second clue is true, or both.", action: "Choose two properties or values." },
    { title: "Try both cases", explanation: "Test an animal matching the first clue and another matching the second.", action: "Run the program." },
  ] },
  { id: "not", title: "NOT: reverse a clue", mascot: "Pip", summary: "NOT turns true into false and false into true.", example: "if not animal.can_fly:\n    send_to(\"ground\")", steps: [
    { title: "The opposite", explanation: "NOT looks for the opposite of a clue. It can find animals that do not have a property.", action: "Add a NOT condition." },
    { title: "Check the clue", explanation: "A penguin has the cannot-fly property. It does not have the fly movement.", action: "Choose a movement or property clue." },
    { title: "Try it", explanation: "Use NOT to send non-flying animals to a ground habitat.", action: "Run the belt and inspect the routes." },
  ] },
  { id: "for-each", title: "FOR EACH animal", mascot: "Rex", summary: "FOR EACH repeats the instructions for every animal in a group.", example: "for animal in animals:\n    send_to(\"dinosaur_reserve\")", steps: [
    { title: "A whole group", explanation: "A list can hold several animals. FOR EACH visits the animals one at a time.", action: "Add a FOR EACH block." },
    { title: "Same instruction, every time", explanation: "The instructions inside the loop run once for each animal in the group.", action: "Place a route action inside the loop." },
    { title: "Watch the group", explanation: "The factory repeats the inside instructions as it visits every animal.", action: "Run the belt." },
  ] },
  { id: "while", title: "WHILE a condition is true", mascot: "Rex", summary: "A WHILE loop repeats instructions as long as its condition remains true. A loop counter can help it stop after a set number of turns.", example: "while loop_count < 3:\n    open_gate()", steps: [
    { title: "Keep checking", explanation: "A WHILE loop checks its condition before each repeat.", action: "Add a WHILE block." },
    { title: "Know when to stop", explanation: "A loop needs a condition that can become false. The factory also protects against endless loops.", action: "Choose a condition and put an action inside." },
    { title: "Test safely", explanation: "If a loop never stops, the factory pauses it and explains what happened.", action: "Run your loop and inspect the feedback." },
  ] },
  { id: "loop-conditions", title: "Loops with decisions", mascot: "Rex", summary: "A loop can contain an IF block to make a different choice for each animal.", example: "for animal in animals:\n    if animal.diet == \"herbivore\":\n        send_to(\"fern_garden\")", steps: [
    { title: "Loop through a group", explanation: "A loop can visit a whole group of animals.", action: "Add a FOR EACH block." },
    { title: "Make a choice inside", explanation: "An IF block inside a loop can make a decision for each animal.", action: "Place an IF block inside your loop." },
    { title: "Sort one by one", explanation: "The condition is checked again for every animal in the list.", action: "Run the program and watch the decisions." },
  ] },
  { id: "lists", title: "Lists and groups", mascot: "Rex", summary: "A list is a collection of animals that a program can visit one by one.", example: "for animal in dinosaur_group:\n    inspect(animal)", steps: [
    { title: "A list holds many animals", explanation: "A group is easier to process than writing a new instruction for each animal.", action: "Choose the animals collection." },
    { title: "Visit each animal", explanation: "FOR EACH takes one animal at a time from the list.", action: "Add a FOR EACH block and an inside action." },
    { title: "Use a property", explanation: "The same property rule can be checked for every animal in a group.", action: "Add an IF block inside the loop." },
  ] },
  { id: "loop-debugging", title: "Debug a loop", mascot: "Rex", summary: "A loop bug can cause an instruction to repeat too many times or not enough times.", example: "repeat 3 times:\n    open_gate()", steps: [
    { title: "Count the repeats", explanation: "Check how many times the loop should run.", action: "Inspect the loop count." },
    { title: "Check the inside", explanation: "Make sure the repeated actions are in the correct part of the block.", action: "Review the body of the loop." },
    { title: "Test and repair", explanation: "Run the program again after changing the loop.", action: "Fix the loop and retry." },
  ] },
  { id: "nested-if", title: "IF inside IF", mascot: "Lumi", summary: "A nested IF is a decision inside another decision.", example: "if animal.is_mythical:\n    if animal.can_swim:\n        send_to(\"sea\")", steps: [
    { title: "First decision", explanation: "Check a broad clue first, such as whether a creature is mythical.", action: "Add an outer IF block." },
    { title: "A second decision", explanation: "Inside the first path, check another clue to make a more specific choice.", action: "Add another IF inside the THEN path." },
    { title: "Follow the branches", explanation: "The inner decision only runs when the outer condition is true.", action: "Choose destinations for both inner paths." },
  ] },
];

export const tutorialById = Object.fromEntries(tutorials.map((lesson) => [lesson.id, lesson])) as Record<string, TutorialDefinition>;

export const academyCategories = [
  { id: "basics", title: "Programming basics", lessons: ["sequence", "if", "else", "debugging"] },
  { id: "logic", title: "Animal clues and logic", lessons: ["properties", "habitats", "comparisons", "multiple-conditions", "and", "or", "not", "nested-if"] },
  { id: "loops", title: "Loops and lists", lessons: ["repeat", "for-each", "while", "loop-conditions", "lists", "loop-debugging"] },
];
