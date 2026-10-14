export const STARTER: string[] = [
  "The cat sat on the mat.", "The cat sat on the chair.", "The cat chased the mouse.", "The cat drank the milk.",
  "The dog chased the ball.", "The dog ate its dinner.", "The dog sat on the mat.", "The dog ran across the garden.",
  "The bird flew over the garden.", "The bird flew into the tree.", "The bird sat in the tree.", "The bird sang a happy song.",
  "The little rabbit hopped into the garden.", "The little rabbit found a carrot.", "The little rabbit ate the carrot.",
  "The little robot opened the door.", "The little robot picked up the box.", "The little robot found a ball.",
  "The robot opened the door.", "The robot picked up the box.", "The robot walked across the room.",
  "The boat sailed across the lake.", "The boat sailed across the sea.", "The boat sailed across the river.",
  "The fish swam across the lake.", "The fish swam in the sea.",
  "I put the book on the table.", "I put the cup on the table.", "I put the book on the shelf.",
  "She put the book on the table.", "The cup sat on the table.",
  "She opened the door.", "She opened the book.", "She opened the box.",
  "He read the book.", "He kicked the ball.",
  "The girl ate a red apple.", "The boy found a shiny coin.",
  "The sun rose over the sea.", "The moon shone over the garden.",
  "The frog jumped into the river.", "The mouse ran into the box.",
];

export const ANIMALS: string[] = [
  "The little rabbit hopped into the garden.", "The little rabbit found a carrot.", "The little rabbit ate the grass.",
  "The little duck swam across the pond.", "The little duck found some bread.", "The little fox ran into the forest.",
  "The little fox chased the mouse.", "The little bird sat in the tree.", "The little bird flew over the lake.",
  "The cat sat on the mat.", "The cat chased the mouse.", "The cat slept in the sun.",
  "The dog ran across the field.", "The dog chased the ball.", "The dog slept in the garden.",
  "The fish swam in the sea.", "The frog jumped into the pond.", "The owl flew over the forest.",
  "The bear walked into the forest.", "The bear found some honey.", "The horse ran across the field.",
  "The bee flew into the garden.",
];

export const ROBOTS: string[] = [
  "The little robot opened the door.", "The little robot picked up the box.", "The little robot rolled across the floor.",
  "The little robot found a battery.", "The little machine lifted the box.", "The little machine made a loud noise.",
  "The robot walked across the room.", "The robot opened the door.", "The robot picked up the tool.",
  "The robot pressed the red button.", "The robot charged its battery.", "The robot fixed the machine.",
  "The machine made a loud noise.", "The machine lifted the heavy box.", "The machine stopped at the door.",
  "The drone flew over the factory.", "The drone lifted the box.", "The truck rolled across the bridge.",
  "The crane lifted the heavy box.", "The crane stopped at the factory.", "The robot arm picked up the tool.",
  "The little drone found the red button.",
];

export const COLLECTIONS = [
  { id: "animals", name: "Animal sentences", list: ANIMALS },
  { id: "robots", name: "Robot sentences", list: ROBOTS },
] as const;

export const SUGGESTIONS = ["The little robot found a carrot.", "The cat sat on the box.", "The dog chased the mouse."];

export const PREDICT = [
  {
    prompt: "The cat sat on the",
    options: [
      { w: "mat", note: "A very popular ending. Lots of people say \"the cat sat on the mat\"." },
      { w: "moon", note: "What a fun idea! It is imaginative, but we do not often read about cats on the moon." },
      { w: "chair", note: "That makes sense. Cats do sit on chairs, so this one fits well." },
      { w: "river", note: "Creative! Cats usually avoid water, so this would be an unusual sentence." },
    ],
  },
  {
    prompt: "The bird flew into the",
    options: [
      { w: "tree", note: "Great guess. Birds fly into trees all the time." },
      { w: "sky", note: "Good thinking. Birds love the sky, though we often say \"up into the sky\"." },
      { w: "window", note: "That can happen! It is a sensible if surprising ending." },
      { w: "pizza", note: "Ha! Imaginative, but it is very unlikely in real sentences." },
    ],
  },
  {
    prompt: "She opened the",
    options: [
      { w: "door", note: "A very common ending. Doors are opened all the time." },
      { w: "book", note: "Lovely. Opening a book is also a common thing to read about." },
      { w: "box", note: "Sensible. A box might have something exciting inside." },
      { w: "ocean", note: "Interesting! It is hard to open an ocean, but stories can do anything." },
    ],
  },
  {
    prompt: "The boat sailed across the",
    options: [
      { w: "sea", note: "A popular choice. Boats and seas go together." },
      { w: "lake", note: "That works too. Boats sail on lakes." },
      { w: "river", note: "Good answer. Rivers have boats too." },
      { w: "desert", note: "Surprising! A boat in the desert would be very strange, but it is a fun thought." },
    ],
  },
];

export const CTX_A = ["I put the book on the", "The little rabbit", "She opened the"];
export const CTX_B = ["The boat sailed across the", "The little robot", "The bird flew into the"];

const BLOCKED = ["stupid", "idiot", "hate", "kill", "dumb", "shut up"];
export function isClassroomSafe(text: string): boolean {
  const t = text.toLowerCase();
  return !BLOCKED.some((b) => t.includes(b));
}
export const SAFE_MESSAGE = "Let's keep our sentences kind and classroom-friendly. Your text stays on this device.";

export const STAGES = [
  { name: "Predict", goal: "Guess the next word the way a person would.", learn: "People use meaning and experience to guess what comes next." },
  { name: "Learn", goal: "See the example sentences a tiny model learns from, then train it.", learn: "A text model learns word patterns from the examples it is given." },
  { name: "Context", goal: "Find out how the words already written change the prediction.", learn: "The model looks at the last few words to find patterns it has seen." },
  { name: "Choose", goal: "Compare picking the most common word with picking with a little randomness.", learn: "A model can have several possible next words and has to choose one." },
  { name: "Generate", goal: "Build a sentence one word at a time.", learn: "Repeating one prediction after another makes longer text." },
  { name: "Experiment", goal: "Change the training sentences and compare what the model writes.", learn: "Different examples can lead to different generated text." },
] as const;
