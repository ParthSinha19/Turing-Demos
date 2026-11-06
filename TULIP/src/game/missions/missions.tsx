import { lazy, Suspense, useEffect, useState } from "react";
import { useGame, type Personality } from "../state";
import { canSpeak, speak } from "../audio";
import { useAssist, useHint } from "../ui/assist";
import { Btn, Choice, Token } from "../ui/kit";
import { Guide, StepTitle } from "../ui/shell";
import { Quiz, RuleBuilder, Sorter } from "../ui/puzzles";
const MazeChallenge = lazy(() => import("./Maze").then((m) => ({ default: m.MazeChallenge })));

export type MissionProps = { onComplete: () => void; setProgress: (p: number) => void };

function usePhases(n: number, setProgress: (p: number) => void, onComplete: () => void) {
  const [p, setP] = useState(0);
  useEffect(() => setProgress(p / n), [p, n, setProgress]);
  return [p, () => (p + 1 >= n ? onComplete() : setP(p + 1))] as const;
}

/* ---------- Mission 1 ---------- */
export function M1({ onComplete, setProgress }: MissionProps) {
  const [p, next] = usePhases(4, setProgress, onComplete);
  const { succeed, fail } = useAssist();
  const [flow, setFlow] = useState(false);
  useHint(p === 0 ? { clue: "Press the big round glowing button!", highlight: "[data-power]" } : null, [p]);
  if (p === 0)
    return (
      <Guide lines={[{ text: "Zzzz... beep... my systems are sleepy.", mood: "asleep" }, { text: "Press the glowing button to wake me up!", mood: "asleep", highlight: "[data-power]" }]}>
        <StepTitle icon="power">Wake TULIP up</StepTitle>
        <div className="flex justify-center py-6">
          <button data-power onClick={() => { useGame.getState().setMood("learning"); succeed("Whoa! I'm awake! But my battery is nearly empty..."); setTimeout(next, 2200); }} className="chunky glow-pulse flex h-44 w-44 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Token name="power" size={110} />
          </button>
        </div>
      </Guide>
    );
  if (p === 1)
    return (
      <Guide lines={[{ text: "I need power! Drag the battery into my power slot.", highlight: '[data-drag="battery"]' }]}>
        <StepTitle icon="zap">Give TULIP energy</StepTitle>
        <Sorter clue="Robots run on electricity." items={[{ id: "battery", icon: "charger", label: "Battery", zone: "slot", why: "Batteries hold power for robots!" }]} zones={[{ id: "slot", label: "Power slot", icon: "zap" }, { id: "bin", label: "Snack box", icon: "cake" }]} cols={2} onDone={next} />
      </Guide>
    );
  if (p === 2)
    return (
      <Guide lines={[{ text: "My parts are all mixed up! Each part has a job." }, { text: "Watch: EYES help me SEE. I put it in for you!", mood: "learning" }, { text: "Now you match the rest!" }]}>
        <StepTitle icon="cpu">Match parts to jobs</StepTitle>
        <Sorter demoFirst clue="Think about what each body part does."
          items={[
            { id: "eye", icon: "eye", label: "Eyes", zone: "see", why: "Eyes are for seeing!" },
            { id: "ear", icon: "ear", label: "Ears", zone: "hear", why: "Ears catch sounds — they help me hear." },
            { id: "spk", icon: "speaker", label: "Speaker", zone: "talk", why: "A speaker makes sound, so I can talk!" },
            { id: "feet", icon: "feet", label: "Feet", zone: "move", why: "Feet are for walking and moving." },
          ]}
          zones={[{ id: "see", label: "See", icon: "glasses" }, { id: "hear", label: "Hear", icon: "music" }, { id: "talk", label: "Talk", icon: "smile" }, { id: "move", label: "Move", icon: "go" }]}
          cols={2} onDone={next} />
      </Guide>
    );
  return (
    <Guide lines={[{ text: "When someone gives me information, I can do something with it!" }, { text: "INPUT goes in. I THINK. Then OUTPUT comes out. Press the button to see!", highlight: "[data-ipo]" }]}>
      <StepTitle icon="brain">Input → Think → Output</StepTitle>
      <div className="mb-4 flex items-center justify-between gap-2" data-ipo>
        {([["hand", "Input"], ["brain", "Think"], ["eye", "Output"]] as const).map(([ic, l], i) => (
          <div key={l} className={`flex flex-col items-center rounded-2xl p-2 transition-all ${flow ? "bg-sun/40" : "bg-muted"}`} style={{ transitionDelay: `${i * 400}ms` }}>
            <Token name={ic} size={56} />
            <b className="font-display text-ink">{l}</b>
          </div>
        ))}
        <Btn variant="sun" onClick={() => { setFlow(true); useGame.getState().setMood("happy", 2000); setTimeout(() => setFlow(false), 2500); }}>Press me</Btn>
      </div>
      <Quiz onDone={next} items={[
        { prompt: "You wave at TULIP. What could he do?", icon: "hand", clue: "A friendly input gets a friendly output.", explain: "You waved (input), I thought, I waved back (output)!", options: [{ label: "Wave back", icon: "hand", ok: true }, { label: "Fall asleep", icon: "battery", why: "Sleeping isn't an answer to a wave!" }, { label: "Eat a sandwich", icon: "sandwich", why: "Robots don't eat! And that doesn't answer a wave." }] },
        { prompt: "You say 'Hello!' What is the output?", icon: "smile", clue: "What would a friend say back?", explain: "Input: hello. Output: hello back!", options: [{ label: "Say hello back", icon: "smile", ok: true }, { label: "Spin in circles", icon: "sparkles", why: "Fun, but not a reply to hello!" }, { label: "Turn off", icon: "power", why: "Then I couldn't answer!" }] },
      ]} />
    </Guide>
  );
}

/* ---------- Mission 2 ---------- */
export function M2({ onComplete, setProgress }: MissionProps) {
  const [p, next] = usePhases(3, setProgress, onComplete);
  if (p === 0)
    return (
      <Guide lines={[{ text: "I have to deliver a birthday present to Mia!" }, { text: "But I don't know how to make choices. Help me decide what to do!", mood: "confused" }]}>
        <StepTitle icon="gift">Help TULIP choose</StepTitle>
        <Quiz onDone={next} items={[
          { prompt: "It is raining. What should I take?", icon: "rain", clue: "What keeps you dry?", explain: "If it's raining, take an umbrella!", options: [{ label: "An umbrella", icon: "umbrella", ok: true }, { label: "Sunglasses", icon: "glasses", why: "Sunglasses are for sunny days." }, { label: "Ice cream", icon: "icecream", why: "Yummy, but I'll get soggy!" }] },
          { prompt: "The traffic light is red. What do I do?", icon: "light", clue: "Red means...", explain: "Red light means STOP!", options: [{ label: "Stop", icon: "stop", ok: true }, { label: "Run across", icon: "go", why: "Never cross on red! It's not safe." }, { label: "Dance", icon: "music", why: "Not now! Red means something important." }] },
          { prompt: "The door is locked. What should I find?", icon: "lock", clue: "What opens a lock?", explain: "Locked door? Find the key!", options: [{ label: "A key", icon: "key", ok: true }, { label: "A cake", icon: "cake", why: "Cake can't open doors!" }, { label: "A ball", icon: "football", why: "A ball won't open a lock." }] },
          { prompt: "My battery is empty! What do I need?", icon: "battery", clue: "What gives robots power?", explain: "Empty battery? Find a charger!", options: [{ label: "A charger", icon: "charger", ok: true }, { label: "A flower", icon: "flower", why: "Pretty, but no power in there!" }, { label: "A book", icon: "book", why: "Books feed brains, not batteries." }] },
        ]} />
      </Guide>
    );
  if (p === 1)
    return (
      <Guide lines={[{ text: "Now let's make a RULE. Watch my example!" }, { text: "IF it's raining... YES: take an umbrella. NO: wear sunglasses.", highlight: "[data-rule-question]" }, { text: "Press Test to see it work!", highlight: "[data-test-rule]" }]}>
        <StepTitle icon="idea">A rule: IF ... YES / NO</StepTitle>
        <RuleBuilder prefilled question="Is it raining?" qIcon="rain" yes="umb" no="sun" cards={[{ id: "umb", icon: "umbrella", label: "Take umbrella" }, { id: "sun", icon: "glasses", label: "Wear sunglasses" }]} tests={[{ label: "Raining", icon: "rain", answer: "yes" }, { label: "Sunny", icon: "sun", answer: "no" }]} onDone={() => { useGame.getState().remember("umbrella"); next(); }} />
      </Guide>
    );
  return (
    <Guide lines={[{ text: "Your turn! Build a rule for the traffic light." }, { text: "Drag a card to YES and a card to NO.", highlight: "[data-drop]" }]}>
      <StepTitle icon="light">Build your own rule</StepTitle>
      <RuleBuilder question="Is the light red?" qIcon="light" yes="stop" no="go" cards={[{ id: "stop", icon: "stop", label: "Stop" }, { id: "go", icon: "go", label: "Go" }, { id: "umb", icon: "umbrella", label: "Umbrella" }, { id: "cake", icon: "cake", label: "Eat cake" }]} tests={[{ label: "Red light", icon: "light", answer: "yes" }, { label: "Green light", icon: "go", answer: "no" }]} onDone={next} />
    </Guide>
  );
}

/* ---------- Mission 3 ---------- */
export function M3({ onComplete, setProgress }: MissionProps) {
  const [p, next] = usePhases(2, setProgress, onComplete);
  if (p === 0)
    return (
      <Guide lines={[
        { text: "Oh no! A little robot called Pip is stuck across the garden!", mood: "sad" },
        { text: "I move forward ONE tile at a time. I can turn left or right.", mood: "thinking" },
        { text: "I can't walk through bushes. I follow blocks in order, top to bottom." },
        { text: "Practice first: drag blocks from the left into the white space, snap them together, then press RUN.", highlight: "[data-run]" },
      ]}>
        <StepTitle icon="feet">Practice path</StepTitle>
        <Suspense fallback={<p className="text-2xl font-bold text-ink">Loading the garden…</p>}><MazeChallenge level="practice" onDone={next} /></Suspense>
      </Guide>
    );
  return (
    <Guide lines={[{ text: "Now the real garden! It's foggy — I can only see the start and Pip." }, { text: "Pip sent a map sketch. 'Repeat' does the same thing many times!", highlight: "[data-map]" }]}>
      <StepTitle icon="pin">Rescue Pip!</StepTitle>
      <Suspense fallback={<p className="text-2xl font-bold text-ink">Loading the garden…</p>}><MazeChallenge level="main" onDone={next} /></Suspense>
    </Guide>
  );
}

/* ---------- Mission 4 ---------- */
export function M4({ onComplete, setProgress }: MissionProps) {
  const [p, next] = usePhases(3, setProgress, onComplete);
  if (p === 0)
    return (
      <Guide lines={[{ text: "I made it to town! But I don't know what anything is.", mood: "confused" }, { text: "Help me sort things into groups. I'll do the apple: it's FOOD!", mood: "learning" }]}>
        <StepTitle icon="eye">Sort what TULIP sees</StepTitle>
        <Sorter demoFirst clue="Ask: what is it used for?" cols={3} onDone={next}
          items={[
            { id: "apple", icon: "apple", label: "Apple", zone: "food", why: "You can eat an apple!" },
            { id: "ball", icon: "football", label: "Football", zone: "toys", why: "You play with a football." },
            { id: "dog", icon: "dog", label: "Dog", zone: "animals", why: "A dog is alive — it's an animal!" },
            { id: "car", icon: "car", label: "Car", zone: "transport", why: "A car takes you places." },
            { id: "flower", icon: "flower", label: "Flower", zone: "plants", why: "A flower grows in soil — it's a plant." },
            { id: "chair", icon: "chair", label: "Chair", zone: "home", why: "You sit on a chair at home." },
          ]}
          zones={[{ id: "food", label: "Food", icon: "food" }, { id: "animals", label: "Animals", icon: "cat" }, { id: "transport", label: "Transport", icon: "bus" }, { id: "toys", label: "Toys", icon: "blocks" }, { id: "plants", label: "Plants", icon: "tree" }, { id: "home", label: "Home", icon: "sofa" }]} />
      </Guide>
    );
  if (p === 1)
    return (
      <Guide lines={[{ text: "Hmm! An apple and a tomato. They're both red and round...", mood: "thinking" }]}>
        <Quiz onDone={next} items={[{ prompt: "Are these both food?", icon: "tomato", clue: "Can you eat both of them?", explain: "Yes! Different shapes and tastes, but both are food.", options: [{ label: "Yes, both are food", icon: "food", ok: true }, { label: "No, tomato is a toy", icon: "blocks", why: "You can eat a tomato — in salad or on pizza!" }, { label: "No, they're balls", icon: "football", why: "Round, but you can't kick them!" }] }]} />
      </Guide>
    );
  return (
    <Guide lines={[{ text: "I spotted a pattern! Cars and buses have WHEELS. They're transport!", mood: "learning" }]}>
      <Quiz onDone={next} items={[{ prompt: "Use my pattern. Which one is transport?", icon: "idea", clue: "Look for wheels!", explain: "A bike has wheels and takes you places. Pattern found!", options: [{ label: "Bike", icon: "bike", ok: true }, { label: "Cat", icon: "cat", why: "No wheels on a cat! It's an animal." }, { label: "Carrot", icon: "carrot", why: "No wheels! A carrot is food." }] }]} />
    </Guide>
  );
}

/* ---------- Mission 5 ---------- */
export function M5({ onComplete, setProgress }: MissionProps) {
  const [p, next] = usePhases(1, setProgress, onComplete);
  void p;
  return (
    <Guide lines={[{ text: "People say funny things! I take every word exactly as it is.", mood: "confused" }, { text: "Help me work out what they REALLY mean. Look at the clues!" }]}>
      <StepTitle icon="ear">What do they mean?</StepTitle>
      <Quiz onDone={next} items={[
        { speaker: { name: "Sam", line: "It's freezing outside!", tulip: "Where is the freezer?" }, prompt: "What does Sam mean?", clue: "Sam is outside, not in a kitchen. How does Sam feel?", explain: "Sam feels very cold! 'Freezing' means really cold.", options: [{ label: "Sam feels cold", icon: "snow", ok: true }, { label: "Sam wants ice cream", icon: "icecream", why: "No ice cream here! Think about the weather." }, { label: "Sam wants a freezer", icon: "door", why: "That's my silly literal idea!" }] },
        { speaker: { name: "Leo", line: "Can you give me a hand?", tulip: "But I only have two hands!" }, prompt: "What does Leo want?", clue: "Leo is carrying a big heavy box.", explain: "'Give me a hand' means 'help me'!", options: [{ label: "Leo wants help", icon: "help", ok: true }, { label: "Leo wants a robot hand", icon: "hand", why: "Leo has hands already! It means something else." }, { label: "Leo wants football", icon: "football", why: "No ball around. Look at the clue!" }] },
        { speaker: { name: "Mia", line: "I'm so hungry I could eat a horse!", tulip: "Oh no! Hide the horses!" }, prompt: "What does Mia mean?", clue: "Is Mia really going to eat a horse? No way!", explain: "Mia is just VERY hungry!", options: [{ label: "Mia is very hungry", icon: "sandwich", ok: true }, { label: "Mia wants a horse", icon: "dog", why: "Nobody eats horses! It's a funny saying." }, { label: "Mia is sleepy", icon: "battery", why: "She said hungry, not tired." }] },
        { speaker: { name: "Ava", line: "Break a leg in your show!", tulip: "Break a leg?! That sounds painful!" }, prompt: "What does Ava mean?", clue: "Ava is smiling. Friends say nice things before a show.", explain: "It means 'good luck'!", options: [{ label: "Good luck!", icon: "sparkles", ok: true }, { label: "Hurt yourself", icon: "stop", why: "Ava is smiling — she's being kind!" }, { label: "Go home", icon: "door", why: "Not quite. It's a wish!" }] },
      ]} />
    </Guide>
  );
}

/* ---------- Mission 6 ---------- */
const STYLE_LINES: Record<Personality, string> = {
  friendly: "Hello, friend! I'm so happy you're here!",
  funny: "Beep boop! I'm TULIP — the only robot who dances like a toaster!",
  helpful: "Hi! I'm TULIP. Can I help you find anything today?",
};

export function M6({ onComplete, setProgress }: MissionProps) {
  const [p, next] = usePhases(3, setProgress, onComplete);
  if (p === 0)
    return (
      <Guide lines={[{ text: "I understand people now! But what should I SAY back?", mood: "thinking" }, { text: "Pick the reply a good friend would give." }]}>
        <StepTitle icon="volume">Choose kind replies</StepTitle>
        <Quiz onDone={next} items={[
          { speaker: { name: "Visitor", line: "Hello! Nice to meet you." }, prompt: "What should TULIP say?", clue: "Say something kind back.", explain: "A friendly hello back makes people feel welcome!", options: [{ label: "Hello! Nice to meet you too!", icon: "smile", ok: true }, { label: "Go away!", icon: "stop", why: "That would hurt their feelings." }, { label: "The weather is 20 degrees.", icon: "sun", why: "True, but it doesn't answer hello!" }] },
          { speaker: { name: "Child", line: "I dropped my ice cream..." }, prompt: "What should TULIP say?", clue: "How does the child feel? Sad!", explain: "Being kind when someone is sad is very human!", options: [{ label: "Oh no! Can I help you get another?", icon: "help", ok: true }, { label: "Ha ha!", icon: "laugh", why: "Laughing would make them sadder." }, { label: "Beep.", icon: "speaker", why: "Too short! Show you care." }] },
          { speaker: { name: "Grandad", line: "Thank you for your help!" }, prompt: "What should TULIP say?", clue: "What do we say after 'thank you'?", explain: "You're welcome! Polite and kind.", options: [{ label: "You're welcome!", icon: "smile", ok: true }, { label: "Give me a cookie.", icon: "cake", why: "That's a bit rude!" }, { label: "Who are you?", icon: "idea", why: "Grandad just thanked me — reply to that!" }] },
        ]} />
      </Guide>
    );
  if (p === 1) return <ConvoBuilder onDone={next} />;
  return <PersonalityPick onDone={next} />;
}

function ConvoBuilder({ onDone }: { onDone: () => void }) {
  const cards = [
    { id: "g", slot: 0, label: "Hi there!", icon: "hand" },
    { id: "q", slot: 1, label: "What's your name?", icon: "idea" },
    { id: "r", slot: 2, label: "Lovely to meet you!", icon: "smile" },
    { id: "x1", slot: -1, label: "Go away!", icon: "stop" },
    { id: "x2", slot: -1, label: "Beep. Error.", icon: "speaker" },
  ];
  const slots = ["Greeting", "Ask a question", "Friendly reply"];
  const [filled, setFilled] = useState<(string | null)[]>([null, null, null]);
  const { fail, succeed } = useAssist();
  const nextSlot = filled.findIndex((f) => !f);
  const put = (id: string) => {
    const c = cards.find((x) => x.id === id)!;
    if (nextSlot < 0) return;
    if (c.slot !== nextSlot) return fail(c.slot < 0 ? "That's not friendly. Pick a kinder card!" : `First we need: ${slots[nextSlot]}.`);
    const f = [...filled];
    f[nextSlot] = id;
    setFilled(f);
    if (nextSlot === 2) {
      succeed("A whole conversation! Listen!");
      speak(f.map((i) => cards.find((x) => x.id === i)!.label).join(" "));
      setTimeout(onDone, 3000);
    }
  };
  useHint(nextSlot >= 0 ? { clue: `Next is: ${slots[nextSlot]}.`, highlight: `[data-choice="c-${cards.find((c) => c.slot === nextSlot)!.id}"]`, demo: { say: "This one goes next!", run: () => put(cards.find((c) => c.slot === nextSlot)!.id) } } : null, [nextSlot]);
  return (
    <Guide lines={[{ text: "A good chat goes: Greeting → Question → Friendly reply." }, { text: "Tap the cards in the right order!" }]}>
      <StepTitle icon="smile">Build a conversation</StepTitle>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {slots.map((s, i) => (
          <div key={s} className={`flex min-h-24 flex-col items-center justify-center rounded-2xl border-4 border-dashed p-2 text-center ${i === nextSlot ? "border-sun" : "border-primary/30"}`}>
            <b className="text-sm uppercase text-muted-foreground">{i + 1}. {s}</b>
            {filled[i] && <span className="pop-in font-display text-lg font-bold text-ink">{cards.find((c) => c.id === filled[i])!.label}</span>}
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        {cards.filter((c) => !filled.includes(c.id)).map((c) => <Choice key={c.id} id={`c-${c.id}`} icon={c.icon} label={c.label} onClick={() => put(c.id)} />)}
      </div>
    </Guide>
  );
}

function PersonalityPick({ onDone }: { onDone: () => void }) {
  const { personality, setPersonality } = useGame();
  const { say } = useAssist();
  const [msg, setMsg] = useState("");
  useHint({ clue: "Tap a style, then press HEAR TULIP!", highlight: "[data-hear]" }, []);
  return (
    <Guide lines={[{ text: "What kind of festival host should I be? You choose!" }]}>
      <StepTitle icon="sparkles">Pick TULIP's style</StepTitle>
      <div className="grid gap-3">
        {(["friendly", "funny", "helpful"] as Personality[]).map((p) => (
          <Choice key={p} icon={p === "friendly" ? "smile" : p === "funny" ? "laugh" : "help"} label={p.charAt(0).toUpperCase() + p.slice(1)} state={personality === p ? "right" : null} onClick={() => { setPersonality(p); say(STYLE_LINES[p], p === "funny" ? "happy" : "speaking", 3000); }} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Btn variant="sun" data-hear onClick={() => { if (!speak(STYLE_LINES[personality])) setMsg("Your device can't speak out loud — read TULIP's bubble instead!"); say(STYLE_LINES[personality], "speaking", 3000); }}>HEAR TULIP</Btn>
        <Btn onClick={onDone}>That's me!</Btn>
      </div>
      {msg && <p className="mt-2 font-semibold text-muted-foreground">{msg}</p>}
      {!canSpeak() && <p className="mt-2 text-sm text-muted-foreground">Voice isn't available here, so TULIP will show his words.</p>}
    </Guide>
  );
}

/* ---------- Mission 7 ---------- */
export function M7({ onComplete, setProgress }: MissionProps) {
  const [p, next] = usePhases(3, setProgress, onComplete);
  const { memories, personality, remember } = useGame();
  useEffect(() => {
    if (p === 1) remember("festival-rain-now");
    return () => {
      const s = useGame.getState();
      useGame.setState({ memories: s.memories.filter((m) => m !== "festival-rain-now") });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p]);
  if (p === 0)
    return (
      <Guide lines={[{ text: "The Welcome Festival! I'm so excited!", mood: "happy" }, { text: "Someone needs help. Let's use everything you taught me!" }]}>
        <StepTitle icon="pin">Help a visitor</StepTitle>
        <Quiz onDone={next} items={[{ speaker: { name: "Visitor", line: "Could you help me find the food stall?" }, prompt: "Where should TULIP take them?", clue: "They asked for FOOD. Which stall has food?", explain: "The food stall! Follow me — forward, forward, turn left!", options: [{ label: "Food stall", icon: "food", ok: true }, { label: "Games stall", icon: "game", why: "They want food, not games." }, { label: "Music stall", icon: "music", why: "Listen again: FOOD stall!" }, { label: "Book stall", icon: "book", why: "Books can't fill a tummy!" }] }]} />
      </Guide>
    );
  if (p === 1)
    return (
      <Guide lines={[{ text: memories.includes("umbrella") ? "Uh oh, rain! Remember when you taught me to take an umbrella when it rains? I think I need that lesson today!" : "Uh oh, it's starting to rain!", mood: "thinking" }]}>
        <StepTitle icon="rain">The weather changes</StepTitle>
        <RuleBuilder question="Is it raining?" qIcon="rain" yes="umb" no="dance" cards={[{ id: "umb", icon: "umbrella", label: "Open umbrella" }, { id: "dance", icon: "music", label: "Keep dancing" }, { id: "ice", icon: "icecream", label: "Eat ice cream" }]} tests={[{ label: "Raining now", icon: "rain", answer: "yes" }, { label: "Sun is back", icon: "sun", answer: "no" }]} onDone={next} />
      </Guide>
    );
  return (
    <Guide lines={[{ text: "Someone new is coming over! Help me greet them." }]}>
      <StepTitle icon="smile">Meet a new friend</StepTitle>
      <Quiz onDone={next} items={[{ speaker: { name: "Maya", line: "Hi! It's my first festival. I don't know anyone..." }, prompt: "What should TULIP say?", clue: "Maya feels shy. Say hello and make her feel welcome!", explain: "Now Maya has a new friend — me!", options: [{ label: STYLE_LINES[personality] + " Want to explore with me?", icon: "smile", ok: true }, { label: "Bye!", icon: "door", why: "Maya would feel lonely." }, { label: "I am busy.", icon: "stop", why: "That's not welcoming!" }] }]} />
    </Guide>
  );
}

export const MISSIONS = [M1, M2, M3, M4, M5, M6, M7];
export const REWARD_LINES = [
  "TULIP is awake and full of energy!",
  "TULIP can now make simple decisions!",
  "TULIP can follow instructions and find his way!",
  "TULIP can recognise everyday things!",
  "TULIP understands what people really mean!",
  "TULIP can talk kindly to everyone!",
  "TULIP is ready to be part of the festival!",
];
