# WonderPaws --- Game Design & Development Specification

**Document:** `GAME_DESIGN.md`\
**Version:** 1.0\
**Status:** Master design specification\
**Purpose:** Source of truth for the two sequential development stages\
**Development model:** Frontend-first, followed by game-engine
implementation\
**Primary audience:** Development agents, educators, project owner

------------------------------------------------------------------------

## 1. Project overview

### 1.1 Working title

**WonderPaws: The Great Animal Factory**

WonderPaws is the selected game name. “The Great Animal Factory” is
the descriptive subtitle used in the project documentation and logo.

### 1.2 High concept

WonderPaws is a colourful animal-sorting and beginner-programming
game. Players operate a series of increasingly sophisticated factories
that receive animals on conveyor belts. They use a simplified,
semi-Blockly visual programming system to inspect animals, make
decisions and route each animal to the correct habitat.

The game combines:

-   A playful factory-management fantasy.
-   Animal discovery and collection.
-   Visual, block-based programming.
-   Animated cause-and-effect puzzles.
-   A structured learning journey from simple sequences to compound
    logic and debugging.
-   A persistent sanctuary that grows as the player progresses.

The game should feel like a polished casual puzzle/adventure game with a
genuine educational purpose---not like a worksheet or a conventional
quiz.

### 1.3 Core player promise

**"Build clever programs, sort extraordinary animals and grow the
greatest sanctuary in the world."**

### 1.4 Target audience and learning goals

The primary audience is children who are new to programming. The
experience should be accessible to younger learners while offering
enough depth for older primary and early secondary learners.

Players should gradually understand:

1.  Instructions are executed in an order.
2.  A program can make decisions.
3.  Conditions can be combined.
4.  Repetition can be automated with loops.
5.  Programs can be tested and debugged.
6.  Animals and objects can be described using properties.
7.  Visual blocks correspond to ideas expressed in text-based code.

The game should not assume that players already know programming
vocabulary. New terminology must be introduced through demonstrations,
plain-language explanations and guided practice.

------------------------------------------------------------------------

## 2. Product pillars

All design and implementation decisions should support these pillars.

### 2.1 Animals are the stars

Animals must be expressive, recognisable and enjoyable to watch. They
should have distinct silhouettes, personalities, idle animations and
reactions. Chickens and penguins are especially important recurring
favourites and must receive prominent roles.

### 2.2 Programming has visible consequences

A player should be able to press **Run** and watch the factory execute
their program. Correct and incorrect decisions should be visible in the
simulation, not communicated only through a score or error message.

### 2.3 Teach before testing

Every new programming concept must have a guided introduction before the
player is expected to use it independently. Tutorials should be
interactive and use the same blocks and factory mechanics as the main
game.

### 2.4 Progress feels meaningful

Stars, world unlocks, animal discoveries and sanctuary improvements
should give players reasons to continue and replay levels.

### 2.5 Expand without rewriting

Worlds, levels, animals, tutorials, sorting rules and block availability
must be data-driven wherever practical. Adding content should not
require rewriting the game engine.

### 2.6 High visual quality, sensible production cost

Use a coherent, reusable visual system. Prioritise polished animal
characters, distinctive world environments, the factory simulation and
the HUD. Avoid building five unrelated applications or requiring a fully
simulated 3D world.

------------------------------------------------------------------------

## 3. Story and game premise

The player inherits an old animal sanctuary and its central sorting
factory. The factory's systems are unreliable: animals arrive in mixed
shipments and are sent to the wrong habitats.

The player becomes the new **Factory Manager**. With help from a small
cast of animal assistants, they repair the sorting systems, learn to
program them and expand the sanctuary into a home for animals from
different worlds.

The story should be light, welcoming and humorous. It exists to give the
puzzles context, not to interrupt play with long dialogue.

### 3.1 Recurring mascots

  -----------------------------------------------------------------------
  Character         Role              Personality       Main appearance
  ----------------- ----------------- ----------------- -----------------
  Clucky the        First factory     Enthusiastic,     Domestic Meadows
  Chicken           assistant         curious,          and recurring
                                      occasionally      cameos
                                      overconfident     

  Pip the Penguin   Sorting and       Clever, helpful,  Frozen Kingdom
                    inspection        slightly clumsy   and recurring
                    assistant                           cameos

  Rex the T-Rex     Jurassic guide    Loud, bossy,      Jurassic Jungle
                                      secretly friendly 

  Lumi the Unicorn  Magical guide     Calm, curious and Mythical Realms
                                      imaginative       
  -----------------------------------------------------------------------

Clucky and Pip are the two principal mascots. They should appear in the
main menu, tutorials, milestone screens and Grand Sanctuary. Their
character designs should remain consistent across all appearances.

Names are working names and may be revised.

### 3.2 Dialogue principles

-   Keep dialogue short and age-appropriate.
-   Use humour without making a child feel foolish for an error.
-   Explain the problem before introducing terminology.
-   Avoid long unskippable cutscenes.
-   Allow tutorial dialogue to be replayed.
-   Do not use dialogue as the only way to communicate an instruction;
    pair it with a visual demonstration.

------------------------------------------------------------------------

## 4. World structure

The game contains **five worlds with ten levels each: 50 levels total**.

The original four requested environments are retained, with Domestic
Meadows as the introductory world and Grand Sanctuary as the fifth,
mixed-world finale.

  -----------------------------------------------------------------------
  Order             World             Theme             Main learning
                                                        focus
  ----------------- ----------------- ----------------- -----------------
  1                 Domestic Meadows  Farm and          Sequences, IF,
                                      countryside       ELSE, basic loops
                                                        and debugging

  2                 Frozen Kingdom    Arctic and        Animal
                                      Antarctic         properties,
                                                        comparisons and
                                                        compound
                                                        conditions

  3                 Jurassic Jungle   Prehistoric       FOR loops, WHILE
                                      habitats          loops, lists and
                                                        loop debugging

  4                 Mythical Realms   Magical creatures Nested conditions
                                                        and advanced
                                                        Boolean logic

  5                 Grand Sanctuary   All worlds        Mixed challenges,
                                      combined          transfer and
                                                        mastery
  -----------------------------------------------------------------------

Each world should have its own visual identity, music or ambience,
factory details, habitat destinations and character interactions. The
underlying game interface and programming language should remain
consistent.

### 4.1 World presentation

The world-selection screen should show all five worlds, their visual
themes, progress and locked/unlocked state. Locked worlds should be
visible enough to motivate progress, but their buttons must not imply
that they are playable.

The player should see the sanctuary gradually expand as they complete
worlds and levels.

------------------------------------------------------------------------

## 5. Animal roster and data properties

The roster below is the initial content target. It is not necessary to
create a unique 3D model for every animal if a consistent, high-quality
reusable asset strategy is more practical. However, each species must be
visually distinguishable.

### 5.1 Domestic Meadows

  -----------------------------------------------------------------------
  Animal                  Character traits        Useful sorting
                                                  properties
  ----------------------- ----------------------- -----------------------
  Chicken                 Curious, energetic; key bird, farm, land,
                          mascot                  feathers

  Rooster                 Loud and confident      bird, farm, land,
                                                  feathers

  Duck                    Playful and             bird, farm/wetland,
                          splash-loving           land/water/flight

  Cow                     Slow and friendly       mammal, farm, land,
                                                  large

  Pig                     Playful and muddy       mammal, farm, land

  Sheep                   Shy and fluffy          mammal, farm, land,
                                                  wool

  Horse                   Fast and proud          mammal, farm, land,
                                                  large

  Goat                    Mischievous             mammal, farm, land

  Rabbit                  Quick and nervous       mammal, farm/woodland,
                                                  land, small

  Donkey                  Stubborn but lovable    mammal, farm, land

  Turkey                  Dramatic                bird, farm, land

  Goose                   Bold troublemaker       bird, farm/wetland,
                                                  land/water/flight
  -----------------------------------------------------------------------

Special variants: **Golden Chicken** and **Rainbow Duck**. Variants are
optional collectibles and should not be required to solve core puzzles.

### 5.2 Frozen Kingdom

The world covers both Arctic and Antarctic settings. The game must not
imply that polar bears and penguins naturally share the same polar
habitat. They can appear in a combined factory challenge, but their
destination data should distinguish Arctic and Antarctic habitats.

  -----------------------------------------------------------------------
  Animal                  Character traits        Useful sorting
                                                  properties
  ----------------------- ----------------------- -----------------------
  Emperor Penguin         Proud and dependable    bird, Antarctic,
                                                  land/swim, cannot fly

  King Penguin            Royal and confident     bird, Antarctic,
                                                  land/swim, cannot fly

  Baby Penguin            Clumsy and adorable;    bird, Antarctic,
                          key favourite           land/swim, cannot fly

  Polar Bear              Big and gentle          mammal, Arctic,
                                                  land/swim, large

  Arctic Fox              Clever                  mammal, Arctic, land

  Seal                    Playful                 mammal, polar/coastal,
                                                  land/water

  Walrus                  Sleepy                  mammal, Arctic,
                                                  land/water, tusks

  Snowy Owl               Wise                    bird, Arctic, flight

  Reindeer                Fast                    mammal, Arctic, land

  Snow Leopard            Stealthy                mammal, mountain, land

  Arctic Hare             Extremely quick         mammal, Arctic, land

  Orca                    Powerful swimmer        mammal, ocean, water
  -----------------------------------------------------------------------

Special variants: **Ice Crystal Penguin** and **Baby Emperor Penguin**.

### 5.3 Jurassic Jungle

  -----------------------------------------------------------------------
  Dinosaur / creature     Character traits        Useful sorting
                                                  properties
  ----------------------- ----------------------- -----------------------
  T-Rex                   Bossy but friendly      dinosaur, land,
                                                  carnivore, large

  Triceratops             Protective              dinosaur, land,
                                                  herbivore

  Stegosaurus             Gentle                  dinosaur, land,
                                                  herbivore

  Brachiosaurus           Giant and friendly      dinosaur, land,
                                                  herbivore, very large

  Velociraptor            Quick and clever        dinosaur, land,
                                                  carnivore, small

  Ankylosaurus            Armoured                dinosaur, land,
                                                  herbivore, armour

  Spinosaurus             Aquatic hunter          dinosaur, land/water,
                                                  carnivore

  Parasaurolophus         Musical                 dinosaur, land,
                                                  herbivore

  Pteranodon              Flying explorer         prehistoric reptile,
                                                  air, carnivore

  Pachycephalosaurus      Headbutter              dinosaur, land,
                                                  herbivore

  Diplodocus              Long-necked wanderer    dinosaur, land,
                                                  herbivore, very large

  Mosasaurus              Ocean giant             prehistoric marine
                                                  reptile, water,
                                                  carnivore
  -----------------------------------------------------------------------

Special variants: **Baby T-Rex** and **Golden Triceratops**.

### 5.4 Mythical Realms

These are fantasy creatures. Their properties are part of the fictional
game world and should be clearly labelled as fantasy.

  Creature      Character traits            Useful sorting properties
  ------------- --------------------------- --------------------------------------
  Unicorn       Magical and elegant         mythical, land, horn, magic
  Baby Dragon   Mischievous                 mythical, land/air, scales, fire
  Phoenix       Fiery and proud             mythical, air, fire, feathers
  Pegasus       Graceful                    mythical, air/land, wings
  Griffin       Brave                       mythical, air/land, wings, claws
  Cerberus      Three-headed troublemaker   mythical, land, three heads
  Fairy Deer    Gentle                      mythical, woodland, land, magic
  Mermaid       Aquatic                     mythical, water, tail
  Yeti          Big and shy                 mythical, snowy, land, large
  Griffin Cub   Playful                     mythical, air/land, wings
  Hydra         Multiple heads              mythical, water/land, multiple heads
  Sea Serpent   Mysterious                  mythical, water, scales

Special variants: **Rainbow Unicorn**, **Crystal Dragon** and **Golden
Phoenix**.

### 5.5 Grand Sanctuary

Grand Sanctuary primarily reuses the animal roster from the previous
worlds. It introduces mixed shipments and classification challenges
rather than requiring a large new collection of species.

### 5.6 Animal data model

Each animal should be represented by a stable identifier and a set of
structured properties. Avoid relying on display names or artwork
filenames to determine game logic.

Illustrative data:

``` ts
type Animal = {
  id: string;
  displayName: string;
  speciesGroup: string;
  world: string;
  habitats: string[];
  movement: string[];
  properties: string[];
  isMythical: boolean;
  assetKey: string;
};
```

Example:

``` js
const penguin = {
  id: "baby_penguin",
  displayName: "Baby Penguin",
  speciesGroup: "bird",
  world: "frozen",
  habitats: ["antarctic"],
  movement: ["land", "swim"],
  properties: ["feathers", "cannot_fly"],
  isMythical: false,
  assetKey: "baby_penguin"
};
```

The exact schema can be refined during implementation, but frontend and
engine must agree on one canonical contract. Keep animal facts and game
properties separate where necessary: for example, the property
`cannot_fly` is useful for gameplay, while a descriptive encyclopaedia
entry can explain the animal in child-friendly language.

------------------------------------------------------------------------

## 6. Core gameplay loop

A normal level follows this loop:

1.  The player enters a level and reads or hears the short mission
    briefing.
2.  The player sees the incoming animals and the available destinations.
3.  The player assembles a program using available blocks.
4.  The player presses **Run**.
5.  The factory simulation executes the program.
6.  Animals travel through conveyors, junctions and gates.
7.  The game displays correct routes, mistakes and useful feedback.
8.  The player adjusts the program and retries if needed.
9.  On completion, the player receives stars and progress.
10. The player can continue, replay or visit the relevant Academy
    lesson.

### 6.1 Level composition

Each level contains **three sorting challenges**. A challenge is a
single task or shipment within the level.

The three challenges should generally progress from simpler to more
demanding:

-   Challenge A: demonstrate the basic rule.
-   Challenge B: apply the rule to a different animal combination.
-   Challenge C: solve a less guided or more complex variation.

The three challenges together contribute to one level result of up to
three stars. A level may introduce a concept, practise it and then test
it. Do not make every challenge a copy of the previous one.

### 6.2 Factory mechanics

The factory should evolve beyond one static conveyor belt. Introduce
mechanics gradually:

1.  Straight conveyor belts.
2.  Branching conveyor junctions.
3.  Automated gates.
4.  Inspection/scanner stations that reveal properties.
5.  Multiple incoming belts.
6.  Habitat destinations.
7.  Later-world magical portals or special routing devices.

New machinery must be explained before it becomes essential to a
challenge. The simulation should remain readable and predictable; avoid
unnecessary physics or complex real-time collisions.

### 6.3 Feedback

Correct routing should produce satisfying visual feedback: a gate opens,
an animal reaches its habitat, and the animal reacts happily.

Incorrect routing should be humorous and informative, never punitive. A
penguin sent towards a warm farm might look confused or slide around,
but the game should explain which rule was not met.

Feedback should identify the relevant animal and decision. Avoid simply
saying "Wrong".

------------------------------------------------------------------------

## 7. Programming language and block system

### 7.1 Design goal

Build a custom, game-specific, semi-Blockly editor rather than a full
general-purpose Blockly clone.

It should be easy to understand, visually attractive, touch-friendly and
expandable. The block editor should support drag-and-drop where
practical, with clear connection points and visual nesting.

### 7.2 Block categories

  -----------------------------------------------------------------------
  Category                Example blocks          Purpose
  ----------------------- ----------------------- -----------------------
  Events                  When animal arrives     Starts processing an
                                                  animal

  Conditions              IF, ELSE, ELSE IF       Makes decisions

  Comparisons             Is equal to, is greater Compares values
                          than                    

  Boolean logic           AND, OR, NOT            Combines or reverses
                                                  conditions

  Loops                   Repeat N times, FOR     Repeats instructions
                          EACH, WHILE             

  Actions                 Send to habitat, open   Changes factory state
                          gate, move belt         

  Properties              Species, habitat, size, Reads animal data
                          movement                

  Debugging               Step, reset, inspect    Helps find program
                                                  errors
  -----------------------------------------------------------------------

### 7.3 Progressive block availability

Do not expose the entire toolbox at the beginning.

-   Early Domestic levels: basic actions and sequences.
-   Domestic decision levels: IF and ELSE.
-   Later Domestic levels: simple repetition and multiple conditions.
-   Frozen Kingdom: properties, comparisons and AND / OR / NOT.
-   Jurassic Jungle: FOR and WHILE loops, lists and loop debugging.
-   Mythical Realms: nested conditions and compound logic.
-   Grand Sanctuary: all previously introduced blocks.

The level configuration should determine which blocks are available. The
editor should not independently invent progression rules.

### 7.4 Block behaviour and safety

-   Programs must have defined execution limits.
-   Loops must not be able to run forever.
-   Invalid or incomplete block arrangements should produce clear
    feedback.
-   The engine must validate the program before execution.
-   The player should be able to reset the simulation and retry.
-   The game should not execute arbitrary JavaScript or Python supplied
    by the player.

### 7.5 Text code and visual blocks

The Academy should show small Python-style examples that correspond to
the concepts represented by visual blocks. These are educational
examples, not arbitrary Python executed by the game.

The code examples should use a small, clearly documented set of
illustrative commands, such as `send_to("farm")` and `move_forward()`.
Explain that the snippets show the idea behind the blocks.

Example --- sequence:

``` python
pick_up_egg()
move_forward()
deliver_egg()
```

Example --- IF / ELSE:

``` python
if animal == "penguin":
    send_to("ice")
else:
    send_to("farm")
```

Example --- FOR loop:

``` python
for i in range(3):
    move_forward()
    sort_animal()
```

Example --- compound condition:

``` python
if animal == "bird" and animal != "penguin":
    send_to("flying_habitat")
```

Example --- NOT:

``` python
if not animal.can_fly:
    send_to("ground_habitat")
```

Examples must match the level's actual block semantics. Do not teach a
Python construct before its equivalent concept has been introduced. For
younger players, explain each line in plain language and highlight the
matching visual block.

------------------------------------------------------------------------

## 8. Learning system and tutorials

### 8.1 Core teaching pattern

Every new concept follows:

**Discover → Learn → Practise → Master**

1.  **Discover:** A short factory problem creates a reason to learn the
    concept.
2.  **Learn:** A mascot explains the concept with a visual
    demonstration.
3.  **Practise:** The player completes a guided task with some
    assistance.
4.  **Master:** The player solves a fresh challenge independently.

Tutorials should be integrated into levels. They are not long separate
lectures.

### 8.2 Tutorial rules

-   A mandatory introductory tutorial appears the first time a new
    concept is needed.
-   Tutorial completion does not consume a star or count as one of the
    three level challenges unless explicitly configured.
-   Players can replay every tutorial in the Programming Academy.
-   Previously introduced concepts can have optional reminders.
-   Hints should guide rather than immediately reveal the full solution.
-   Tutorials should use the same block editor and simulation as normal
    gameplay.
-   Tutorial text should be short, with a visual demonstration for every
    important idea.
-   The player should be able to replay dialogue or instructions.
-   The game should record which lessons the player has completed.

### 8.3 Tutorial interaction pattern

Example: first introduction to IF.

1.  A mixed shipment arrives.
2.  Clucky explains that not every animal should go to the same habitat.
3.  The game highlights the IF block.
4.  A chicken arrives; the IF condition is evaluated.
5.  The farm gate opens.
6.  The player places an IF block into a guided workspace.
7.  The player runs the program on a new animal.
8.  The game gives feedback and transitions to the independent
    challenge.

Do not make a tutorial consist only of a dialogue box followed by a
"Next" button.

### 8.4 Programming Academy

The main menu/world hub should include a separate building or
destination named **Programming Academy**.

It must be accessible independently of the main level progression.
Players should be able to revisit lessons without replaying an entire
level.

Academy topics:

1.  Sequences and instructions.
2.  Events and actions.
3.  Conditions.
4.  IF / ELSE.
5.  Multiple conditions.
6.  Comparisons and animal properties.
7.  AND / OR / NOT.
8.  FOR loops and repetition.
9.  WHILE loops.
10. Lists and groups.
11. Nested conditions.
12. Debugging and testing.
13. Translating visual blocks into code.

The Academy should distinguish between:

-   **Not introduced yet:** visible but marked as locked or
    undiscovered.
-   **Available:** lesson can be opened.
-   **Completed:** lesson can be replayed and practised again.

The Academy must not grant stars or unlock worlds merely for opening a
lesson. It can record lesson completion separately.

### 8.5 Academy lesson format

Each lesson should contain:

1.  **What is it?** A short, age-appropriate explanation.
2.  **Watch it happen:** An animated demonstration using animals.
3.  **Build it:** A visual-block example.
4.  **See the code:** A small Python-style snippet.
5.  **Try it yourself:** A tiny interactive exercise.
6.  **Where is it useful?** A real-world connection.

Example Academy lesson --- IF / ELSE:

**What is it?** A program can choose what to do depending on whether
something is true.

**Demonstration:** If the arriving animal is a penguin, send it to the
Antarctic habitat. Otherwise, send it to the farm.

``` python
if animal == "penguin":
    send_to("antarctic")
else:
    send_to("farm")
```

**Try it yourself:** Change the rule so that chickens go to the farm and
all other animals go to the general habitat.

Academy examples should be editable in a safe, constrained practice
activity where possible. Do not imply that arbitrary Python code is
being run if the implementation only demonstrates predefined commands.

------------------------------------------------------------------------

## 9. The 50-level curriculum

Each level has three challenges. The concept named in the table is the
main focus; previously learned concepts can be reused. Tutorials are
required at the first introduction of every new concept, even if that
introduction occurs in the middle of a level.

### 9.1 World 1 --- Domestic Meadows

**Learning identity:** First steps in programming, instructions,
decisions and basic repetition.

  Level   Name                     Main concept / challenge
  ------- ------------------------ ------------------------------------
  1       Welcome to the Farm      Instructions and sequence
  2       The Missing Chickens     Ordering actions and simple routes
  3       Chicken Crossing         First IF condition
  4       Duck or Chicken?         IF / ELSE
  5       The Unexpected Visitor   ELSE as a default route
  6       The Busy Farm            Repeating a simple action
  7       Two Farm Gates           Multiple conditions
  8       Broken Conveyor          Basic debugging and testing
  9       The Mixed Shipment       Combining sequences and decisions
  10      Farm Factory Master      Independent mixed assessment

**Tutorial introductions:** Level 1 (sequence), Level 3 (IF), Level 4
(ELSE), Level 6 (repetition), Level 7 (multiple conditions), Level 8
(debugging).

**Character focus:** Clucky, chickens, ducks and familiar farm animals.

**Example challenge progression:** Level 3 Challenge A demonstrates an
IF rule; Challenge B changes the target animal; Challenge C gives a new
mixed shipment for independent use.

### 9.2 World 2 --- Frozen Kingdom

**Learning identity:** Animal properties, comparisons and Boolean logic.

  Level   Name                        Main concept / challenge
  ------- --------------------------- --------------------------------
  1       Welcome to the Ice          Refresher: IF / ELSE
  2       Penguin Parade              Reading animal properties
  3       The Swimming Test           Sorting by movement properties
  4       Arctic or Antarctic?        Multiple habitat conditions
  5       The Snowy Conveyor          Comparison operators
  6       The Polar Sorting Machine   AND
  7       The Confused Penguin        OR
  8       The Flying Penguin?!        NOT
  9       The Frozen Factory          Combining conditions
  10      Save the Ice Sanctuary      Independent mixed assessment

**Tutorial introductions:** Level 2 (properties), Level 4 (multiple
habitat conditions), Level 5 (comparisons), Level 6 (AND), Level 7 (OR),
Level 8 (NOT).

**Character focus:** Pip and the penguin family. Include polar bears,
seals, Arctic foxes and other polar animals. Keep Arctic and Antarctic
habitat facts accurate in the animal data.

### 9.3 World 3 --- Jurassic Jungle

**Learning identity:** Repetition, loops, groups and debugging repeated
behaviour.

  Level   Name                         Main concept / challenge
  ------- ---------------------------- -------------------------------------
  1       Welcome to Jurassic Jungle   Refresher: decisions and properties
  2       The Dinosaur Parade          Sequential routing
  3       Too Many Dinosaurs!          FOR loop
  4       Repeat the Operation         Repeated actions
  5       The Endless Conveyor         WHILE loop
  6       The Hungry T-Rex             Conditional loops
  7       Dinosaur Classification      Lists and groups
  8       Broken Dinosaur Machine      Debugging loops
  9       The Prehistoric Mix          Combining loops and conditions
  10      Jurassic Factory Master      Independent mixed assessment

**Tutorial introductions:** Level 3 (FOR), Level 5 (WHILE), Level 6
(loop condition), Level 7 (lists/groups), Level 8 (debugging loops).

**Character focus:** Rex and the dinosaur collection.

### 9.4 World 4 --- Mythical Realms

**Learning identity:** Nested conditions, compound logic and advanced
decision-making.

  Level   Name                          Main concept / challenge
  ------- ----------------------------- -----------------------------------
  1       Welcome to Magic              Refresher: conditions
  2       Unicorn Identification        Reviewing properties
  3       The Magical Gate              Nested IF
  4       The Dragon Test               Compound AND conditions
  5       The Phoenix Problem           Compound OR conditions
  6       The Invisible Creature        NOT in compound rules
  7       The Three-headed Hydra        Multiple nested conditions
  8       The Magic Machine is Broken   Debugging complex logic
  9       The Mythical Mixture          Compound logic and classification
  10      The Great Magical Factory     Independent mixed assessment

**Tutorial introductions:** Level 3 (nested IF), with guided refreshers
for compound AND / OR / NOT and complex debugging. If the player has
already learned a concept, the lesson can be optional rather than
repeated as a mandatory first-time tutorial.

**Character focus:** Lumi, unicorns, dragons, phoenixes and other
fantasy creatures.

### 9.5 World 5 --- Grand Sanctuary

**Learning identity:** Transfer, mastery and combining all previous
concepts. This world should primarily reuse known blocks and mechanics
rather than introduce many new programming constructs.

  Level   Name                          Main concept / challenge
  ------- ----------------------------- ---------------------------------------
  1       The Grand Opening             Mixed animal types and familiar rules
  2       Air, Land and Water           Multi-property classification
  3       Real or Magical?              Real-world and mythical properties
  4       The Great Penguin Escape      Multiple routing decisions
  5       Chicken Invasion              Efficient repetition
  6       Dinosaur Delivery             Nested conditions
  7       The Rare Animal Shipment      Unfamiliar property combinations
  8       The Broken Sanctuary          Complex debugging
  9       The Master Sorter             Multiple simultaneous rules
  10      The Ultimate Animal Factory   Final independent assessment

**Tutorial introductions:** No major new programming concept is
required. Provide optional refreshers for concepts used in each
challenge. Any genuinely new mechanic must still receive a tutorial
before it is assessed.

**Character focus:** Clucky and Pip return as co-supervisors. All
previous animal collections can appear.

------------------------------------------------------------------------

## 10. Level design template

Every level should be defined with a consistent structure. The following
is an illustrative template, not a requirement to hard-code this exact
content.

``` ts
type LevelDefinition = {
  id: string;
  worldId: string;
  order: number;
  title: string;
  briefing: string;
  learningObjectives: string[];
  requiredTutorials: string[];
  availableBlocks: string[];
  challenges: ChallengeDefinition[];
  starCriteria: StarCriteria;
  unlockRequirements?: UnlockRequirement[];
};
```

Each challenge should define:

-   Challenge ID and title.
-   Short instruction.
-   Incoming animal IDs.
-   Factory layout or layout key.
-   Correct routing rules.
-   Available blocks.
-   Optional hints.
-   Expected completion conditions.

The level data must not contain executable arbitrary code. Sorting rules
should be represented using a safe, structured rule format that the
engine understands.

### 10.1 Example level

**Domestic Meadows --- Level 3: Chicken Crossing**

-   Objective: Send chickens to the farm and other animals to the
    general habitat.
-   Tutorial: IF condition.
-   Available blocks: event, IF, animal species property, send to
    habitat.
-   Challenge A: Guided chicken identification.
-   Challenge B: Different animal order.
-   Challenge C: New mixed shipment without step-by-step guidance.

Example expected logic:

``` python
if animal == "chicken":
    send_to("farm")
else:
    send_to("general_sanctuary")
```

The engine should evaluate the equivalent structured block program, not
execute this displayed Python snippet.

------------------------------------------------------------------------

## 11. Stars, scoring and unlocking

### 11.1 Star system

Each level awards up to three stars.

  Stars   Requirement
  ------- -------------------------------------------
  1       Successfully complete the sorting task
  2       Complete without incorrect animal routing
  3       Meet the level's efficiency target

The third-star target must be fair and transparent. It may consider
unnecessary actions, block count or a level-specific efficiency measure,
but it must not reward confusingly short programs over correct,
understandable solutions.

Tutorial completion does not consume stars. Replaying a level must not
erase previously earned stars.

### 11.2 Level progression

-   Level 1 of the first world is available at the beginning.
-   Completing a level unlocks the next level in that world.
-   Players can replay completed levels to improve their star count.
-   Level completion and star collection are recorded separately.
-   Do not require three stars to progress through every ordinary level.

### 11.3 World progression

The initial proposed unlock threshold is **9 stars out of 30** in the
previous world.

-   Frozen Kingdom unlocks after earning 9 Domestic Meadows stars.
-   Jurassic Jungle unlocks after meeting the Frozen Kingdom threshold.
-   Mythical Realms unlocks after meeting the Jurassic Jungle threshold.
-   Grand Sanctuary unlocks after meeting the Mythical Realms threshold.

The threshold should be configurable rather than hard-coded. Later
worlds may use a higher threshold if playtesting shows it is
appropriate.

### 11.4 Progress display

The HUD and world map should display:

-   Current world.
-   Current level.
-   Levels completed.
-   Stars earned out of 30.
-   Next unlock requirement.
-   Locked/unlocked state.

Do not use colour alone to communicate status; use text, icons and
accessible contrast.

------------------------------------------------------------------------

## 12. Visual direction and user interface

### 12.1 Overall visual direction

Aim for a polished, colourful, stylised 2.5D game aesthetic. The
experience should feel like a premium casual puzzle game, not a generic
educational dashboard.

Recommended direction:

-   Expressive stylised animal characters.
-   Carefully composed environments with depth and lighting.
-   Distinct visual identity for every world.
-   Smooth conveyor, gate and animal animations.
-   Clear, readable typography.
-   Friendly, tactile-looking buttons and block components.
-   A consistent visual language across menus, factory and Academy.

Avoid excessive decoration that competes with the programming workspace.

### 12.2 Camera and environment

Recommended default: **2.5D/isometric-inspired factory view**.

This gives the factory depth and visual appeal without requiring a fully
interactive 3D engine. Use layered assets, shadows, parallax and
animated elements where they add value.

The factory must remain readable at typical desktop and classroom
display sizes. The animal route and destination must be easy to follow.

### 12.3 Main screens

1.  **Main menu:** Game title, Play, World Map, Programming Academy,
    Animal Book and Settings.
2.  **World map:** Five world cards or connected regions, progress and
    unlock requirements.
3.  **Level selection:** Ten levels per world, completion states and
    star counts.
4.  **Level briefing:** Short mission, objective and relevant character.
5.  **Factory gameplay:** Conveyor simulation, animals, destinations,
    HUD and block editor.
6.  **Tutorial overlay:** Contextual guidance integrated into the
    factory.
7.  **Results screen:** Stars, feedback, retry and continue.
8.  **Programming Academy:** Lesson categories, status and replay.
9.  **Animal Book:** Discovered species, facts and properties.
10. **Sanctuary:** Visual display of unlocked habitats, animals and
    decorations.
11. **Settings:** Audio, accessibility and other basic preferences.

### 12.4 Factory HUD

The gameplay screen should prioritise:

-   A readable factory simulation.
-   A clear objective.
-   The block palette.
-   A sufficiently large programming workspace.
-   Run, pause/step where supported, reset and hint controls.
-   A compact progress/status area.

The HUD must not overwhelm the animal simulation. The layout should
adapt to smaller screens, but desktop/laptop use is the primary target
unless a later product decision changes it.

### 12.5 Asset strategy and budget

Use reusable assets and a consistent art direction.

Priority order:

1.  Mascot and animal character quality.
2.  Main menu and world-selection presentation.
3.  Factory environment and conveyor machinery.
4.  Block editor and HUD.
5.  Animations and success/error feedback.
6.  Secondary decorative details.

Create a reusable character library. The same chicken or penguin should
be usable in the world map, tutorials, level simulation, Academy and
sanctuary.

Use world-specific background elements, props, lighting and colour
palettes to create variety without producing a unique full scene for
every level.

Avoid unnecessary asset generation, large 3D dependencies or expensive
rendering requirements. The game should perform well on ordinary school
and home computers.

------------------------------------------------------------------------

## 13. Additional game features

These features support the core game but should not delay a working
first release.

### 13.1 Animal Book

An encyclopaedia of discovered animals. Each entry may show:

-   Name and character artwork.
-   Species group.
-   Habitat.
-   Movement abilities.
-   Selected properties used in sorting.
-   A short, age-appropriate fact.

The Animal Book should distinguish factual animal information from
fictional fantasy properties.

### 13.2 Sanctuary builder

Completing levels and worlds can unlock habitats, decorations and animal
arrivals. The sanctuary should visibly grow over time.

Keep the first implementation simple: a persistent visual hub with
unlockable elements is sufficient. Do not build a complex city-building
simulation.

### 13.3 Rare variants

Optional collectible variants include Golden Chicken, Rainbow Duck, Ice
Crystal Penguin, Baby Emperor Penguin, Baby T-Rex, Golden Triceratops,
Rainbow Unicorn, Crystal Dragon and Golden Phoenix.

Rare variants should be cosmetic or optional content. They must not
create unfair advantages or be required to complete programming puzzles.

### 13.4 Challenge mode

A later optional mode may introduce:

-   Limited block count.
-   Limited moves.
-   Mixed shipments.
-   Replayable puzzle variations.

Do not make these restrictions part of the initial learning path unless
a level explicitly teaches the relevant strategy.

### 13.5 Teacher/classroom suitability

The game should support short sessions and independent play. Clear level
objectives, replayable Academy lessons and predictable progress are more
important than complex teacher dashboards in the first release.

A teacher should be able to direct a student to a named Academy lesson,
such as IF / ELSE, without requiring them to replay a full world.

------------------------------------------------------------------------

## 14. Technical architecture

### 14.1 Development separation

Development takes place in two sequential stages.

**Stage 1 --- Frontend and visual experience**

The frontend agent builds the complete user-facing experience with mock
data and mock game behaviour. It is responsible for visual design, React
components, screens, block editor presentation, animal assets,
animations, responsive layout and the frontend handover document.

**Stage 2 --- Game engine and integration**

The game-engine agent implements the actual program interpreter, sorting
simulation, level validation, scoring, unlocks, progress persistence and
integration with the existing frontend.

The second agent must not redesign or rebuild the frontend. It should
preserve working components and integrate through the agreed interfaces.

### 14.2 Recommended technical approach

-   React for the frontend.
-   TypeScript for shared contracts and the game engine.
-   A standalone game-engine module that can run in the browser.
-   Data-driven world, animal, tutorial and level definitions.
-   Local persistence for the first release.
-   A backend server is not required merely to execute sorting puzzles.

A server, accounts or cloud synchronisation can be considered later if
there is a clear product requirement. Do not add infrastructure that
does not materially improve the initial game.

### 14.3 Separation of responsibilities

  -----------------------------------------------------------------------
  Area                    Frontend responsibility Game engine
                                                  responsibility
  ----------------------- ----------------------- -----------------------
  Animal display          Render assets and       Supply animal identity
                          animations              and properties

  Block editor            Let player assemble     Validate and interpret
                          blocks                  program

  Factory                 Render simulation and   Determine routes and
                          events                  outcomes

  Tutorials               Display guidance and    Track completion state
                          interactions            and lesson requirements

  Levels                  Display level           Supply definitions and
                          information             validate completion

  Stars                   Display awarded stars   Calculate star results

  Unlocks                 Display locked/unlocked Determine eligibility
                          states                  

  Saving                  Display saved progress  Store and retrieve
                                                  progress
  -----------------------------------------------------------------------

### 14.4 Suggested engine interface

The frontend should call a stable engine interface. The exact names can
be refined during implementation, but the separation must remain.

``` ts
type RunRequest = {
  levelId: string;
  challengeId: string;
  program: ProgramDefinition;
};

type RunResult = {
  success: boolean;
  animalsSorted: number;
  mistakes: number;
  events: SimulationEvent[];
  feedback: FeedbackMessage[];
};
```

Illustrative use:

``` ts
const result = await GameEngine.run({
  levelId: "domestic-03",
  challengeId: "domestic-03-c",
  program: playerProgram
});
```

Illustrative result:

``` js
{
  success: true,
  animalsSorted: 4,
  mistakes: 0,
  events: [
    { animalId: "chicken", destinationId: "farm" },
    { animalId: "baby_penguin", destinationId: "general" }
  ],
  feedback: []
}
```

This is an example contract, not a demand to use these exact field
names. The final contract must be documented in the frontend handover
and agreed before engine integration.

### 14.5 Program representation

The block editor should serialise the player's blocks into a structured
program representation. The engine should interpret this representation
using a controlled set of supported operations.

Do not evaluate arbitrary strings with `eval`, `Function`, or equivalent
execution mechanisms. Do not run arbitrary Python code from Academy
snippets.

### 14.6 Simulation events

The engine should return ordered events that the frontend can animate.
Examples include:

-   Animal enters conveyor.
-   Scanner reads a property.
-   Condition evaluates true or false.
-   Gate opens.
-   Animal changes route.
-   Animal reaches habitat.
-   Sorting error occurs.
-   Challenge completes.

The frontend controls the visual timing and animation. The engine
determines the logical outcome.

### 14.7 Persistence

For the initial release, local persistence is sufficient.

Persist at least:

-   Completed levels.
-   Best star result per level.
-   Total stars per world.
-   Unlocked worlds and levels, or enough information to derive them.
-   Completed Academy lessons.
-   Discovered animals.
-   Selected settings.

Progress should survive a page refresh. The implementation should use a
versioned save-data structure so future updates can migrate older saves.

------------------------------------------------------------------------

## 15. Development stages and acceptance criteria

### 15.1 Stage 1 --- Frontend

The frontend agent should work with mock data and mock game logic. It
must not invent the final sorting engine.

Required deliverables:

-   Main menu and navigation.
-   Five-world selection screen.
-   Ten-level selection per world.
-   Factory gameplay screen.
-   Reusable animal library and representative animations.
-   Semi-Blockly editor interface.
-   Tutorial UI and sample guided flow.
-   Programming Academy with sample lessons and code examples.
-   Animal Book.
-   Results and star display.
-   Sanctuary screen.
-   Mock simulation events so the experience is demonstrable.
-   Responsive behaviour for the intended desktop/laptop experience.
-   `handover.md` documenting the implementation.

**Frontend acceptance criteria**

-   A user can navigate through all main screens.
-   All five worlds and ten level slots per world are represented.
-   Locked and unlocked states are visually distinct.
-   A representative level can be played using mock simulation.
-   Blocks can be assembled and edited in the interface.
-   Run/reset controls demonstrate the mock factory flow.
-   Tutorial guidance can be entered, completed and replayed.
-   Academy lessons can be opened independently of level progress.
-   Academy examples display visual blocks and corresponding code
    snippets.
-   The animal roster is represented through reusable data/assets.
-   No core screen is merely a placeholder.
-   The frontend runs using documented instructions.

### 15.2 Mandatory `handover.md`

The frontend agent must create a detailed handover document containing:

1.  Project setup and run instructions.
2.  File and folder structure.
3.  Screen and component inventory.
4.  Design system, typography and layout rules.
5.  Asset inventory and asset keys.
6.  Animal IDs and property schema.
7.  Block types and their serialised representation.
8.  Program/workspace data structure.
9.  Level and challenge data structure.
10. Tutorial and Academy data structure.
11. Expected game-engine input.
12. Expected simulation events and output.
13. Progress and save-data expectations.
14. Mock data locations and replacement instructions.
15. Known limitations and unfinished items.
16. Exact integration points for Stage 2.

The handover must describe what exists in the code, not what the agent
intended to build.

### 15.3 Stage 2 --- Game engine and integration

The game-engine agent receives the existing frontend and `handover.md`.

Required deliverables:

-   Program validation.
-   Controlled block-program interpreter.
-   Animal property evaluation.
-   Sorting and routing simulation.
-   Simulation event generation.
-   Challenge completion validation.
-   Tutorial progression state.
-   Star calculation.
-   Level and world unlock logic.
-   Local save/load and migration handling.
-   Integration with the existing frontend.
-   Tests for core rules and progression.

**Backend/game-engine acceptance criteria**

-   Correct programs route every animal to its expected destination.
-   Incorrect programs produce useful feedback and deterministic
    results.
-   Supported conditions and loops behave consistently.
-   Infinite or excessively long execution is prevented.
-   Stars follow the configured criteria.
-   Replaying a level cannot reduce the saved best result.
-   World unlocks use configurable star thresholds.
-   Academy lessons can be replayed independently.
-   Save data survives refresh.
-   The frontend's existing visual components remain intact.
-   Engine tests cover representative examples from all five worlds.

------------------------------------------------------------------------

## 16. Scope control and budget protection

The initial release should prove the full game loop before every piece
of content is polished.

### 16.1 Vertical-slice priority

Build one complete representative world first: Domestic Meadows.

It should include:

-   Ten level definitions.
-   Three challenges per level.
-   At least the core chicken and other farm-animal characters.
-   Sequence, IF, ELSE, repetition and debugging tutorials.
-   A working block editor.
-   A working sorting engine.
-   Star scoring and level progression.
-   A Programming Academy with representative lessons.
-   Save/load.

The remaining four worlds should be represented in the architecture and
world map, with their content added using the same data-driven systems.
Do not build five separate game implementations.

### 16.2 Prioritisation

**P0 --- Required for first playable release**

-   Main navigation.
-   Domestic Meadows.
-   Animal characters and sorting simulation.
-   Block editor.
-   Tutorials for concepts used in the first world.
-   Academy with representative lessons.
-   Scoring, unlocks and persistence.
-   Frontend/backend contract.

**P1 --- Required for complete planned game**

-   All five worlds.
-   All 50 levels.
-   Full animal roster.
-   All curriculum concepts and tutorials.
-   Complete Academy.
-   Sanctuary progression.
-   Animal Book.

**P2 --- Optional polish and later expansion**

-   Rare variants and elaborate unlock animations.
-   Daily challenges.
-   Challenge mode.
-   Additional decorative factory upgrades.
-   Advanced sanctuary customisation.
-   Cloud accounts or multiplayer.

### 16.3 Explicit non-goals for the initial release

-   No multiplayer requirement.
-   No account or authentication system unless separately approved.
-   No complex economy or virtual currency.
-   No arbitrary Python or JavaScript execution.
-   No fully simulated 3D physics factory.
-   No unique hand-built scene for every level.
-   No requirement to generate a unique model for every animal variant.
-   No elaborate teacher administration dashboard.

### 16.4 Agent efficiency rules

Both development agents must:

-   Read this specification before implementation.
-   Follow the assigned stage and avoid taking over the other agent's
    responsibilities.
-   Reuse existing components and assets.
-   Avoid unnecessary dependencies.
-   Avoid broad rewrites of working code.
-   Work in verifiable milestones.
-   Report what is complete and what remains.
-   Avoid implementing unrequested features.
-   Prioritise a working, maintainable result over speculative
    complexity.

The frontend agent must not implement the real sorting engine. The Stage
2 agent must not redesign the frontend.

------------------------------------------------------------------------

## 17. Quality, accessibility and testing

### 17.1 Usability

-   Instructions must be short and understandable.
-   Interactive controls must have clear labels.
-   Drag-and-drop should have an accessible alternative where practical.
-   Important information must not rely on colour alone.
-   Text must remain readable at common classroom display sizes.
-   The player should always know the objective and how to retry.

### 17.2 Error handling

-   Do not punish experimentation.
-   Explain which animal was routed incorrectly and why.
-   Offer a hint related to the relevant concept.
-   Allow reset and retry.
-   Prevent a broken program from freezing the game.

### 17.3 Testing

At minimum, test:

-   One sequence program.
-   One IF program.
-   One IF / ELSE program.
-   One AND / OR / NOT program.
-   One FOR loop.
-   One WHILE loop with a safe termination condition.
-   One nested condition.
-   One debugging scenario.
-   Correct and incorrect animal routes.
-   Three-star and lower-star outcomes.
-   World unlock thresholds.
-   Save/load after refresh.
-   Academy replay independent of level progression.

Animal-property tests must include the distinction between Arctic and
Antarctic destinations and the fact that penguins cannot fly.

------------------------------------------------------------------------

## 18. Open decisions and implementation flexibility

The following can be decided during implementation without changing the
core game:

-   Final game title and mascot names.
-   Exact font and colour tokens.
-   Final asset provider or illustration workflow.
-   Exact animation library.
-   Exact React component naming.
-   Exact serialisation field names, provided the frontend and engine
    agree.
-   Whether the final build uses a lightweight local data layer or
    another approved persistence approach.

The following should not be changed without explicit approval:

-   Five worlds and ten levels per world.
-   Chickens and penguins as prominent recurring favourites.
-   Interactive tutorials for every new concept.
-   A separate, replayable Programming Academy.
-   Python-style educational code examples linked to visual blocks.
-   Three challenges per level as the planned structure.
-   Three-star level scoring.
-   Star-based world unlocks, initially using a configurable nine-star
    threshold.
-   Frontend-first and engine-second development.
-   The requirement for a detailed frontend `handover.md`.
-   The prohibition on Stage 2 redesigning the frontend.

------------------------------------------------------------------------

## 19. Final product definition

WonderPaws is a 50-level, five-world animal-sorting programming game
built around a reusable factory simulation and a child-friendly visual
programming language.

Players learn through a cycle of discovery, interactive tutorials,
guided practice and independent challenges. They can revisit every
learned concept in the Programming Academy, see small Python-style
examples that explain the ideas behind their blocks, collect animals and
expand a persistent sanctuary.

The first development stage creates the polished React experience and a
precise handover. The second stage implements the deterministic game
engine and integrates it without rebuilding the interface.

**This document is the master source of truth.** The two development
prompts should refer to `GAME_DESIGN.md` rather than restating or
independently redefining the game.
