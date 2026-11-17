import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp,
  Clock3, Code2, Home, Info, Lightbulb, Lock, PawPrint, Play, Plus, RotateCcw,
  Star, Trash2, Trophy, X,
} from "lucide-react";
import { backgrounds, worlds } from "@/lib/critters";
import { FactoryStage } from "@/components/cw/FactoryStage";
import { Logo } from "@/components/cw/Logo";
import { AnimalSprite, Progress, Rivets, Stars } from "@/components/cw/parts";
import { animalById, animals, propertyLabels, propertyOptions } from "@/game/animals";
import { runChallenge } from "@/game/engine";
import { levels, levelById, worldDefinitions } from "@/game/levels";
import { academyCategories, tutorialById, tutorials } from "@/game/tutorials";
import {
  emptyProgress, isChallengeUnlocked, isLevelUnlocked, isWorldUnlocked,
  levelStars, loadProgress, markAcademyLesson, markAnimalsDiscovered,
  recordChallengeResult, resetProgress, worldProgressPercent, worldStars,
} from "@/game/progress";
import type { AnimalProperty, BlockType, ChallengeRunResult, Condition, ConditionOperator, PlayerProgress, ProgramNode, Scalar } from "@/game/types";

export const Route = createFileRoute("/interface")({
  head: () => ({
    meta: [
      { title: "WonderPaws — The Great Animal Factory" },
      { name: "description", content: "Build clever programs, sort extraordinary animals and grow the greatest sanctuary in the world." },
      { property: "og:title", content: "WonderPaws — The Great Animal Factory" },
      { property: "og:description", content: "A storybook animal-sorting adventure that teaches programming." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WonderPawsGame,
});

type View = "map" | "game" | "academy" | "book" | "sanctuary";
type ProgramUpdate = (nodeId: string, update: (node: ProgramNode) => ProgramNode) => void;

const newId = () => `block-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
const firstDestination = (challenge: (typeof levels)[number]["challenges"][number]) => challenge.defaultDestinationId;
const defaultCondition = (): Condition => ({ kind: "predicate", property: "speciesGroup", operator: "equals", value: "bird" });
const defaultRoute = (destinationId: string): ProgramNode => ({ id: newId(), type: "route", destinationId });
const propertyKeys: AnimalProperty[] = ["id", "speciesGroup", "habitats", "movement", "properties", "climate", "size", "isMythical", "diet", "loopCounter"];

function initialBlock(type: BlockType, challenge: (typeof levels)[number]["challenges"][number]): ProgramNode {
  const destinationId = firstDestination(challenge);
  const targetDestination = challenge.rules[0]?.destinationId ?? challenge.destinations[0]?.id ?? destinationId;
  if (type === "route") return defaultRoute(destinationId);
  if (type === "if") return {
    id: newId(), type: "if", condition: challenge.rules[0]?.condition ?? defaultCondition(),
    then: [defaultRoute(targetDestination)], else: [defaultRoute(destinationId)],
  };
  if (type === "repeat") return { id: newId(), type: "repeat", times: 2, body: [defaultRoute(destinationId)] };
  if (type === "forEach") return { id: newId(), type: "forEach", collection: "animals", body: [defaultRoute(destinationId)] };
  // The loop's own condition stays loopCounter-based so it is guaranteed to terminate (an
  // animal-property condition never changes between iterations, so using one here would
  // just run until the engine's max-iteration safety net kicked in and errored). What was
  // actually missing was a decision INSIDE the loop: a bare route block means every animal
  // gets sent to the same fallback no matter what, which is indistinguishable from having no
  // condition at all. Defaulting the body to an IF — the same rule the IF block itself defaults
  // to — means a freshly added WHILE block visibly sorts by animal property, not just repeats
  // one blind action.
  return {
    id: newId(), type: "while",
    condition: { kind: "predicate", property: "loopCounter", operator: "lessThan", value: 3 },
    body: [{
      id: newId(), type: "if",
      condition: challenge.rules[0]?.condition ?? defaultCondition(),
      then: [defaultRoute(targetDestination)], else: [defaultRoute(destinationId)],
    }],
  };
}

function updateTree(nodes: ProgramNode[], nodeId: string, update: (node: ProgramNode) => ProgramNode): ProgramNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) return update(node);
    if (node.type === "if") return { ...node, then: updateTree(node.then, nodeId, update), else: updateTree(node.else, nodeId, update) };
    if (node.type === "repeat" || node.type === "while" || node.type === "forEach") return { ...node, body: updateTree(node.body, nodeId, update) };
    return node;
  });
}

function deleteTree(nodes: ProgramNode[], nodeId: string): ProgramNode[] {
  return nodes.filter((node) => node.id !== nodeId).map((node) => {
    if (node.type === "if") return { ...node, then: deleteTree(node.then, nodeId), else: deleteTree(node.else, nodeId) };
    if (node.type === "repeat" || node.type === "while" || node.type === "forEach") return { ...node, body: deleteTree(node.body, nodeId) };
    return node;
  });
}

function getSinglePredicate(condition: Condition): Extract<Condition, { kind: "predicate" }> {
  if (condition.kind === "predicate") return condition;
  if (condition.kind === "not") return getSinglePredicate(condition.condition);
  return getSinglePredicate(condition.conditions[0] ?? defaultCondition());
}

function asValue(property: AnimalProperty, value: string): Scalar {
  if (property === "size" || property === "loopCounter") return Number(value);
  if (property === "isMythical") return value === "true";
  return value;
}

function PredicateFields({
  condition, animalIds, onChange,
}: {
  condition: Extract<Condition, { kind: "predicate" }>;
  animalIds: string[];
  onChange: (next: Condition) => void;
}) {
  const choices = propertyOptions(condition.property, animalIds);
  const values = choices.length ? choices : [condition.value];
  const operators: { value: ConditionOperator; label: string }[] = condition.property === "size" || condition.property === "loopCounter"
    ? [{ value: "equals", label: "is" }, { value: "notEquals", label: "is not" }, { value: "greaterThan", label: "is greater than" }, { value: "lessThan", label: "is less than" }]
    : ["habitats", "movement", "properties"].includes(condition.property)
      ? [{ value: "includes", label: "includes" }, { value: "excludes", label: "does not include" }]
      : [{ value: "equals", label: "is" }, { value: "notEquals", label: "is not" }];
  const propertyOptionsList = propertyKeys.map((key) => ({ value: key, label: propertyLabels[key] ?? key }));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select aria-label="Animal property" className="cw-select min-w-32" value={condition.property} onChange={(event) => {
        const property = event.target.value as AnimalProperty;
        const nextChoices = propertyOptions(property, animalIds);
        const operator: ConditionOperator = ["habitats", "movement", "properties"].includes(property) ? "includes" : "equals";
        onChange({ kind: "predicate", property, operator, value: (nextChoices[0] ?? "") as Scalar });
      }}>
        {propertyOptionsList.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <select aria-label="Comparison" className="cw-select" value={condition.operator} onChange={(event) => onChange({ ...condition, operator: event.target.value as ConditionOperator })}>
        {operators.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
      <select aria-label="Property value" className="cw-select min-w-28" value={String(condition.value)} onChange={(event) => onChange({ ...condition, value: asValue(condition.property, event.target.value) })}>
        {values.map((value) => <option key={String(value)} value={String(value)}>{String(value)}</option>)}
      </select>
    </div>
  );
}

function ConditionEditor({ condition, animalIds, onChange }: { condition: Condition; animalIds: string[]; onChange: (next: Condition) => void }) {
  const first = getSinglePredicate(condition);
  const second = condition.kind === "and" || condition.kind === "or" ? getSinglePredicate(condition.conditions[1] ?? defaultCondition()) : null;
  const mode = condition.kind === "and" || condition.kind === "or" ? condition.kind : condition.kind === "not" ? "not" : "single";
  const changeMode = (next: string) => {
    if (next === "single") onChange(first);
    else if (next === "not") onChange({ kind: "not", condition: first });
    else if (next === "and" || next === "or") onChange({ kind: next, conditions: [first, second ?? { kind: "predicate", property: "climate", operator: "equals", value: "temperate" }] });
  };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-display text-xs uppercase tracking-wider text-parchment/65">Check condition</span>
        <select className="cw-select" aria-label="Condition logic" value={mode} onChange={(event) => changeMode(event.target.value)}>
          <option value="single">One clue</option><option value="and">AND</option><option value="or">OR</option><option value="not">NOT</option>
        </select>
      </div>
      {mode === "not" ? (
        <div className="rounded-lg border-l-4 border-tomato bg-ink/30 p-2"><span className="mr-2 font-display text-tomato">NOT</span><PredicateFields condition={getSinglePredicate(condition)} animalIds={animalIds} onChange={(next) => onChange({ kind: "not", condition: next })} /></div>
      ) : mode === "and" || mode === "or" ? (
        <div className="space-y-2 rounded-lg border-l-4 border-plum bg-ink/30 p-2">
          <PredicateFields condition={first} animalIds={animalIds} onChange={(next) => onChange({ kind: mode, conditions: [next, second ?? { kind: "predicate", property: "climate", operator: "equals", value: "temperate" }] })} />
          <div className="pl-2 font-display text-xs text-sun">{mode.toUpperCase()}</div>
          <PredicateFields condition={second ?? { kind: "predicate", property: "climate", operator: "equals", value: "temperate" }} animalIds={animalIds} onChange={(next) => onChange({ kind: mode, conditions: [first, next] })} />
        </div>
      ) : <PredicateFields condition={first} animalIds={animalIds} onChange={onChange} />}
    </div>
  );
}

function DestinationSelect({ value, destinations, onChange, label, allowKeep = false }: { value: string; destinations: { id: string; label: string }[]; onChange: (next: string) => void; label: string; allowKeep?: boolean }) {
  return (
    <label className="flex flex-wrap items-center gap-2 text-sm font-semibold text-parchment/90">
      <span>{label}</span>
      <select className="cw-select min-w-32" value={value} onChange={(event) => onChange(event.target.value)}>
        {allowKeep && <option value="__keep__">Keep previous route</option>}
        {destinations.map((destination) => <option key={destination.id} value={destination.id}>{destination.label}</option>)}
      </select>
    </label>
  );
}

function ProgramBlock({ node, challenge, animalIds, update, remove }: {
  node: ProgramNode;
  challenge: (typeof levels)[number]["challenges"][number];
  animalIds: string[];
  update: (fn: (node: ProgramNode) => ProgramNode) => void;
  remove: () => void;
}) {
  const destinations = challenge.destinations;
  const updateChildDestination = (branch: "then" | "else" | "body", destinationId: string) => update((current) => {
    if (current.type === "if" && (branch === "then" || branch === "else")) {
      const items = [...current[branch]];
      const first = items.find((item) => item.type === "route");
      if (first?.type === "route") items[items.indexOf(first)] = { ...first, destinationId };
      else items.push(defaultRoute(destinationId));
      return { ...current, [branch]: items };
    }
    if ((current.type === "repeat" || current.type === "while" || current.type === "forEach") && branch === "body") {
      const items = [...current.body];
      const first = items.find((item) => item.type === "route");
      if (first?.type === "route") items[items.indexOf(first)] = { ...first, destinationId };
      else items.push(defaultRoute(destinationId));
      return { ...current, body: items };
    }
    return current;
  });

  const destinationIn = (nodes: ProgramNode[], fallback: string) => nodes.find((item) => item.type === "route")?.destinationId ?? fallback;
  const updateChild = (branch: "then" | "else" | "body", childId: string, fn: (child: ProgramNode) => ProgramNode) => update((current) => {
    if (current.type === "if" && (branch === "then" || branch === "else")) return { ...current, [branch]: updateTree(current[branch], childId, fn) };
    if ((current.type === "repeat" || current.type === "while" || current.type === "forEach") && branch === "body") return { ...current, body: updateTree(current.body, childId, fn) };
    return current;
  });
  const removeChild = (branch: "then" | "else" | "body", childId: string) => update((current) => {
    if (current.type === "if" && (branch === "then" || branch === "else")) return { ...current, [branch]: deleteTree(current[branch], childId) };
    if ((current.type === "repeat" || current.type === "while" || current.type === "forEach") && branch === "body") return { ...current, body: deleteTree(current.body, childId) };
    return current;
  });
  const addNestedIf = (branch: "then" | "else" | "body") => update((current) => {
    const child = initialBlock("if", challenge);
    if (current.type === "if" && (branch === "then" || branch === "else")) return { ...current, [branch]: [...current[branch], child] };
    if ((current.type === "repeat" || current.type === "while" || current.type === "forEach") && branch === "body") return { ...current, body: [...current.body, child] };
    return current;
  });
  const nestedBlocks = (branch: "then" | "else" | "body", children: ProgramNode[]) => children.map((child) => (
    <ProgramBlock
      key={child.id}
      node={child}
      challenge={challenge}
      animalIds={animalIds}
      update={(fn) => updateChild(branch, child.id, fn)}
      remove={() => removeChild(branch, child.id)}
    />
  ));
  const addIfButton = (branch: "then" | "else" | "body") => challenge.availableBlocks.includes("if") ? (
    <button type="button" onClick={() => addNestedIf(branch)} className="mt-2 rounded-lg border border-dashed border-white/50 px-3 py-1.5 text-[11px] font-bold text-white/90 hover:bg-white/10">+ Add nested IF</button>
  ) : null;

  return (
    <article className="relative rounded-xl border-[3px] border-ink p-3 shadow-[0_4px_0_var(--ink)]" style={{ background: node.type === "route" ? "linear-gradient(180deg, oklch(0.62 0.09 185), oklch(0.46 0.1 185))" : node.type === "if" ? "linear-gradient(180deg, oklch(0.63 0.2 30), oklch(0.48 0.15 30))" : "linear-gradient(180deg, oklch(0.55 0.14 300), oklch(0.42 0.12 300))" }}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="font-display text-sm uppercase tracking-wider text-white">{node.type === "if" ? "IF / ELSE decision" : node.type === "route" ? "Send to habitat" : node.type === "repeat" ? "Repeat loop" : node.type === "forEach" ? "FOR EACH animal" : "WHILE loop"}</div>
        <button type="button" aria-label="Remove block" onClick={remove} className="rounded-full bg-ink/25 p-1.5 text-white transition hover:bg-ink/45"><Trash2 size={15} /></button>
      </div>
      {node.type === "route" && <DestinationSelect label="Send animal to" value={node.destinationId} destinations={destinations} onChange={(value) => update((current) => current.type === "route" ? { ...current, destinationId: value } : current)} />}
      {node.type === "if" && (
        <div className="space-y-3">
          <ConditionEditor condition={node.condition} animalIds={animalIds} onChange={(condition) => update((current) => current.type === "if" ? { ...current, condition } : current)} />
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border-2 border-ink/50 bg-leaf/20 p-2">
              <div className="mb-1 font-display text-xs uppercase text-white">THEN · if true</div>
              <DestinationSelect label="Send to" value={destinationIn(node.then, destinations[0]?.id ?? "")} destinations={destinations} onChange={(value) => updateChildDestination("then", value)} />
              <div className="mt-2 space-y-2">{nestedBlocks("then", node.then.filter((item) => item.type !== "route"))}</div>
              {addIfButton("then")}
            </div>
            <div className="rounded-lg border-2 border-ink/50 bg-sun/15 p-2">
              <div className="mb-1 font-display text-xs uppercase text-white">ELSE · if false</div>
              <DestinationSelect label="Send to" allowKeep value={node.else.length ? destinationIn(node.else, challenge.defaultDestinationId) : "__keep__"} destinations={destinations} onChange={(value) => { if (value === "__keep__") update((current) => current.type === "if" ? { ...current, else: [] } : current); else updateChildDestination("else", value); }} />
              <div className="mt-2 space-y-2">{nestedBlocks("else", node.else.filter((item) => item.type !== "route"))}</div>
              {addIfButton("else")}
            </div>
          </div>
        </div>
      )}
      {node.type === "repeat" && (
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-white">Repeat
            <select className="cw-select" value={node.times} onChange={(event) => update((current) => current.type === "repeat" ? { ...current, times: Number(event.target.value) } : current)}>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => <option key={value} value={value}>{value}</option>)}
            </select> times
          </label>
          <DestinationSelect label="Inside loop, send to" value={destinationIn(node.body, destinations[0]?.id ?? "")} destinations={destinations} onChange={(value) => updateChildDestination("body", value)} />
          <div className="w-full space-y-2">{nestedBlocks("body", node.body.filter((item) => item.type !== "route"))}</div>
          {addIfButton("body")}
        </div>
      )}
      {node.type === "forEach" && (
        <div>
          <DestinationSelect label="For every animal, send to" value={destinationIn(node.body, destinations[0]?.id ?? "")} destinations={destinations} onChange={(value) => updateChildDestination("body", value)} />
          <div className="mt-2 space-y-2">{nestedBlocks("body", node.body.filter((item) => item.type !== "route"))}</div>
          {addIfButton("body")}
        </div>
      )}
      {node.type === "while" && (
        <div className="space-y-3">
          <ConditionEditor condition={node.condition} animalIds={animalIds} onChange={(condition) => update((current) => current.type === "while" ? { ...current, condition } : current)} />
          <DestinationSelect label="Inside loop, send to" value={destinationIn(node.body, destinations[0]?.id ?? "")} destinations={destinations} onChange={(value) => updateChildDestination("body", value)} />
          <div className="space-y-2">{nestedBlocks("body", node.body.filter((item) => item.type !== "route"))}</div>
          {addIfButton("body")}
        </div>
      )}
    </article>
  );
}

function WonderPawsGame() {
  const [view, setView] = useState<View>("map");
  const [progress, setProgress] = useState<PlayerProgress>(() => emptyProgress());
  const [selectedWorldId, setSelectedWorldId] = useState("meadows");
  const [activeLevelId, setActiveLevelId] = useState("meadows-01");
  const [challengeIndex, setChallengeIndex] = useState(0);
  const [program, setProgram] = useState<ProgramNode[]>([]);
  const [result, setResult] = useState<ChallengeRunResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [tutorialId, setTutorialId] = useState<string | null>(null);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [academyLessonId, setAcademyLessonId] = useState("sequence");
  const [bookFilter, setBookFilter] = useState("all");
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => setProgress(loadProgress()), []);

  const activeLevel = levelById[activeLevelId] ?? levels[0];
  const activeChallenge = activeLevel.challenges[challengeIndex] ?? activeLevel.challenges[0];
  const selectedWorld = worldDefinitions.find((world) => world.id === selectedWorldId) ?? worldDefinitions[0];
  const selectedWorldArt = worlds.find((world) => world.id === selectedWorldId) ?? worlds[0];
  const activeAnimals = activeChallenge.animalIds.map((id) => animalById[id]).filter(Boolean);
  // Use the real animals, not just their shared archetype id — a dedupe by assetKey is why the
  // conveyor used to show far fewer distinct-looking riders than animals actually in the shipment
  // (e.g. an arctic fox and an arctic hare both collapse to "rabbit"). Each rider still carries its
  // own id so FactoryStage can give it its own tint/badge even when the base sprite is shared.
  const riders = activeAnimals;
  const routeFeedback = result ? activeAnimals.map((animal) => {
    const event = result.events.find((item) => item.animalId === animal.id && (item.type === "animal-sorted-correctly" || item.type === "animal-sorted-incorrectly"));
    const destinationId = event?.destinationId;
    return { id: animal.id, name: animal.displayName, animal, destination: activeChallenge.destinations.find((item) => item.id === destinationId)?.shortLabel ?? "No route", passed: event?.type === "animal-sorted-correctly" };
  }) : [];
  const currentTutorial = tutorialId ? tutorialById[tutorialId] : null;
  const currentAcademyLesson = tutorialById[academyLessonId] ?? tutorials[0];
  const selectedWorldLevels = levels.filter((level) => level.worldId === selectedWorldId);
  const currentLevelProgress = progress.levels[activeLevelId];
  const levelStarsEarned = levelStars(progress, activeLevelId);

  const openLevel = (levelId: string) => {
    if (!isLevelUnlocked(progress, levelId)) return;
    setActiveLevelId(levelId);
    setChallengeIndex(0);
    setProgram([]);
    setResult(null);
    setShowHint(false);
    setView("game");
    const level = levelById[levelId];
    const requestedTutorial = level?.challenges[0]?.tutorialId;
    if (requestedTutorial && !progress.academyCompletedIds.includes(requestedTutorial)) {
      setTutorialId(requestedTutorial);
      setTutorialStep(0);
    } else setTutorialId(null);
  };

  const startNextChallenge = () => {
    if (challengeIndex < 2) {
      const nextChallenge = activeLevel.challenges[challengeIndex + 1];
      if (!isChallengeUnlocked(progress, activeLevelId, nextChallenge.id)) return;
      setChallengeIndex((value) => value + 1);
      setProgram([]);
      setResult(null);
      setShowHint(false);
    } else {
      setView("map");
      setResult(null);
      setProgram([]);
    }
  };

  const updateBlock: ProgramUpdate = (nodeId, update) => {
    setProgram((nodes) => updateTree(nodes, nodeId, update));
    setResult(null);
  };

  const addBlock = (type: BlockType) => {
    if (!activeChallenge.availableBlocks.includes(type)) return;
    setProgram((nodes) => [...nodes, initialBlock(type, activeChallenge)]);
    setResult(null);
  };

  const run = () => {
    const nextResult = runChallenge(activeLevelId, activeChallenge.id, program);
    setResult(nextResult);
    if (nextResult.completed) {
      setProgress((current) => {
        const withResult = recordChallengeResult(current, activeChallenge.id, nextResult);
        return markAnimalsDiscovered(withResult, activeChallenge.animalIds);
      });
    }
  };

  const finishTutorial = () => {
    if (!tutorialId) return;
    setProgress((current) => markAcademyLesson(current, tutorialId));
    setTutorialId(null);
    setTutorialStep(0);
  };

  const resetPlayerProgress = () => {
    setProgress(resetProgress());
    setConfirmReset(false);
    setView("map");
    setProgram([]);
    setResult(null);
  };

  const gotoMap = () => {
    setView("map");
    setTutorialId(null);
  };

  const gameHeader = (
    <header className="relative z-20 flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-ink bg-ink/85 px-5 py-3 text-parchment shadow-lg backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <button onClick={gotoMap} aria-label="Back to world map" className="cw-btn cw-btn-ghost cw-round"><Home size={19} /></button>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-parchment/65">{activeLevel.worldName} · Level {activeLevel.order}</div>
          <div className="font-display text-lg leading-tight">{activeLevel.title}</div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-xl border-2 border-parchment/20 bg-white/5 px-3 py-1 text-center">
          <div className="font-display text-[10px] uppercase tracking-widest text-parchment/65">Challenge</div>
          <div className="font-display">{challengeIndex + 1} / 3</div>
        </div>
        <div className="rounded-xl border-2 border-parchment/20 bg-white/5 px-3 py-1 text-center">
          <div className="font-display text-[10px] uppercase tracking-widest text-parchment/65">Level stars</div>
          <div className="flex justify-center"><Stars value={levelStarsEarned} size={16} /></div>
        </div>
        <button onClick={() => setView("academy")} className="cw-btn cw-btn-teal text-sm"><BookOpen size={16} /> Academy</button>
      </div>
    </header>
  );

  if (view === "map") {
    return (
      <main className="relative min-h-screen overflow-hidden pb-12">
        <img src={backgrounds.menu} alt="" className="fixed inset-0 h-full w-full object-cover" />
        <div className="fixed inset-0 bg-ink/65" />
        <div className="relative z-10 mx-auto max-w-[1500px] px-5 pb-8 pt-5">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="scale-[.52] origin-left sm:scale-[.65]"><Logo size="sm" /></div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="cw-panel-dark flex items-center gap-3 px-4 py-2 text-parchment"><Trophy className="text-sun" size={20} /><span className="font-display">{worldDefinitions.reduce((sum, world) => sum + worldStars(progress, world.id), 0)} / 150 stars</span></div>
              <button onClick={() => setView("academy")} className="cw-btn cw-btn-teal text-sm"><BookOpen size={16} /> Academy</button>
              <button onClick={() => setView("book")} className="cw-btn cw-btn-teal text-sm"><PawPrint size={16} /> Animal Book</button>
              <button onClick={() => setView("sanctuary")} className="cw-btn cw-btn-teal text-sm"><Trophy size={16} /> Sanctuary</button>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-end justify-between gap-2 text-parchment">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.28em] text-sun">Choose your next adventure</div>
              <h2 className="cw-title-stroke mt-1 text-4xl sm:text-5xl">Explore the five worlds</h2>
            </div>
            <div className="text-sm font-semibold text-parchment/75">Worlds unlock as you earn stars.</div>
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            {worlds.map((world, index) => {
              const unlocked = isWorldUnlocked(progress, world.id);
              const selected = selectedWorldId === world.id;
              const percent = worldProgressPercent(progress, world.id);
              return (
                <button key={world.id} onClick={() => unlocked && setSelectedWorldId(world.id)} disabled={!unlocked}
                  className={`group relative h-44 overflow-hidden rounded-2xl border-[4px] border-ink text-left transition ${selected ? "-translate-y-2 ring-4 ring-sun" : unlocked ? "hover:-translate-y-1" : "cursor-not-allowed opacity-70"}`}
                  style={{ boxShadow: "0 7px 0 var(--ink), 0 16px 25px oklch(0 0 0 / .35)" }}>
                  <img src={world.img} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                  {!unlocked && <div className="absolute inset-0 grid place-items-center bg-ink/55"><Lock className="text-parchment" size={38} /></div>}
                  <div className="absolute left-3 top-3 grid h-8 w-8 place-items-center rounded-full border-2 border-ink font-display text-ink" style={{ background: world.accent }}>{index + 1}</div>
                  <div className="absolute inset-x-3 bottom-3 text-parchment">
                    <div className="font-display text-lg leading-tight">{world.name}</div>
                    <div className="mt-1 flex items-center justify-between text-xs font-bold"><span>{percent}% explored</span><span>{worldStars(progress, world.id)} / 30 <Star size={12} className="inline fill-sun text-sun" /></span></div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full border border-ink bg-ink/70"><div className="h-full rounded-full bg-leaf" style={{ width: `${percent}%` }} /></div>
                  </div>
                </button>
              );
            })}
          </div>

          <section className="cw-panel relative mt-6 p-5">
            <Rivets />
            <div className="grid gap-5 lg:grid-cols-[minmax(220px,.7fr)_minmax(0,2fr)]">
              <div>
                <div className="cw-plate inline-block px-4 py-1 font-display">WORLD {selectedWorld.order}</div>
                <h3 className="mt-2 font-display text-3xl text-ink">{selectedWorld.name}</h3>
                <p className="mt-1 text-sm text-ink-soft">{selectedWorld.concept}</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="h-20 w-28 overflow-hidden rounded-xl border-[3px] border-ink"><img src={selectedWorldArt.img} alt="" className="h-full w-full object-cover" /></div>
                  <div className="text-xs font-semibold text-ink-soft"><div>10 levels</div><div>3 challenges per level</div><div>{selectedWorld.focus}</div></div>
                </div>
                {selectedWorld.order > 1 && <p className="mt-3 rounded-lg bg-ink/5 p-2 text-xs font-semibold text-ink-soft">Unlock requirement: earn at least 9 stars in the previous world.</p>}
              </div>
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="font-display text-xl text-ink">Level map</div>
                  <div className="text-xs font-bold uppercase tracking-wider text-ink-soft">Select an unlocked level to play</div>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                  {selectedWorldLevels.map((level) => {
                    const unlocked = isLevelUnlocked(progress, level.id);
                    const saved = progress.levels[level.id];
                    return (
                      <button key={level.id} disabled={!unlocked} onClick={() => openLevel(level.id)} className={`relative min-h-[95px] rounded-xl border-[3px] border-ink p-2 text-left transition ${unlocked ? "bg-parchment hover:-translate-y-1 hover:bg-white" : "bg-ink/10 opacity-55"}`} style={{ boxShadow: "0 4px 0 var(--ink)" }}>
                        <div className="flex items-center justify-between"><span className="font-display text-xl text-ink">{String(level.order).padStart(2, "0")}</span>{unlocked ? <Play size={15} className="text-leaf" /> : <Lock size={14} className="text-ink/60" />}</div>
                        <div className="mt-1 line-clamp-2 text-xs font-bold leading-tight text-ink">{level.title}</div>
                        <div className="mt-1"><Stars value={saved?.stars ?? 0} size={11} /></div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-parchment/65">
            <div className="text-xs font-semibold tracking-wider">WONDERPAWS · BUILD CLEVER PROGRAMS · GROW YOUR SANCTUARY</div>
            <button onClick={() => setConfirmReset(true)} className="text-xs font-bold underline decoration-parchment/40 underline-offset-4 hover:text-parchment">Reset saved progress</button>
          </div>
        </div>
        {confirmReset && <ConfirmDialog title="Reset your progress?" description="This clears completed challenges, stars, discovered animals and Academy progress from this browser." onCancel={() => setConfirmReset(false)} onConfirm={resetPlayerProgress} />}
      </main>
    );
  }

  if (view === "game") {
    return (
      <main className="relative min-h-screen overflow-x-hidden bg-ink pb-8">
        <div className="relative h-[470px] min-h-[430px] overflow-hidden">
          <FactoryStage riders={riders.length ? riders : ["chicken", "penguin", "rabbit"]} routes={routeFeedback} worldId={activeLevel.worldId} />
          <div className="absolute inset-x-0 top-0 z-20">{gameHeader}</div>
          <aside className="cw-panel absolute left-5 top-24 z-10 w-[min(310px,calc(100%-2.5rem))] p-4">
            <Rivets />
            <div className="cw-plate -mt-8 mb-2 inline-block px-4 py-0.5 font-display">MISSION</div>
            <div className="font-display text-xl leading-tight text-ink">{activeChallenge.title}</div>
            <p className="mt-2 text-sm font-semibold leading-snug text-ink-soft">{activeChallenge.briefing}</p>
            <div className="mt-3 flex flex-wrap gap-1.5">{activeAnimals.map((animal) => <span key={animal.id} className="rounded-full border border-ink/20 bg-white/60 px-2 py-1 text-[10px] font-bold text-ink">{animal.displayName}</span>)}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={() => setShowHint((value) => !value)} className="cw-btn cw-btn-teal text-xs"><Lightbulb size={14} /> Hint</button>
              <button onClick={() => { setProgram([]); setResult(null); }} className="cw-btn cw-btn-tomato text-xs"><RotateCcw size={14} /> Clear blocks</button>
            </div>
            {showHint && <div className="mt-3 rounded-lg border-2 border-sun bg-sun/25 p-2 text-xs font-semibold text-ink"><strong>Clucky's hint:</strong> {activeChallenge.hint}</div>}
          </aside>
          <aside className="cw-panel absolute right-5 top-24 z-10 hidden w-64 p-3 lg:block">
            <Rivets />
            <div className="font-display text-ink">Shipment inspector</div>
            <div className="mt-2 flex flex-wrap gap-2">{activeAnimals.slice(0, 4).map((animal) => <div key={animal.id} className="flex w-full items-center gap-2 rounded-lg bg-white/55 p-1.5"><AnimalSprite animal={animal} className="h-9 w-9 object-contain" badgeSize={14} /><div className="min-w-0"><div className="text-xs font-bold text-ink">{animal.displayName}</div><div className="text-[10px] text-ink-soft">{animal.speciesGroup} · size {animal.size}</div></div></div>)}</div>
          </aside>
        </div>

        <section className="cw-wood border-t-[4px] border-ink px-4 py-4 sm:px-6">
          <div className="mx-auto grid max-w-[1500px] gap-4 xl:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="cw-panel-dark p-3">
              <div className="mb-3 flex items-center justify-between"><div className="font-display tracking-widest text-parchment/80">BLOCKS</div><Code2 size={18} className="text-sun" /></div>
              <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
                {activeChallenge.availableBlocks.map((type) => {
                  const labels: Record<BlockType, string> = { route: "Send to", if: "IF / ELSE", repeat: "Repeat", while: "WHILE", forEach: "FOR EACH" };
                  const descriptions: Record<BlockType, string> = { route: "Choose a habitat", if: "Make a decision", repeat: "Repeat an action", while: "Repeat while true", forEach: "Visit every animal" };
                  return <button key={type} onClick={() => addBlock(type)} className="group rounded-xl border-[3px] border-ink bg-teal px-3 py-2 text-left text-parchment shadow-[0_4px_0_var(--ink)] transition hover:-translate-y-0.5 hover:brightness-110">
                    <div className="flex items-center justify-between font-display"><span>{labels[type]}</span><Plus size={15} /></div><div className="text-[10px] font-semibold text-parchment/75">{descriptions[type]}</div>
                  </button>;
                })}
              </div>
              <div className="mt-4 rounded-lg border border-parchment/15 bg-ink/25 p-2 text-xs text-parchment/70"><div className="mb-1 flex items-center gap-1 font-display text-parchment"><Info size={14} /> Your toolbox</div>Only blocks introduced for this challenge are available. Add blocks to the program area, then edit their clues and destinations.</div>
              {activeChallenge.tutorialId && <button onClick={() => { setTutorialId(activeChallenge.tutorialId ?? null); setTutorialStep(0); }} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-parchment/10 px-3 py-2 text-xs font-bold text-parchment hover:bg-parchment/20"><BookOpen size={14} /> Replay lesson</button>}
            </aside>

            <div className="min-w-0 rounded-2xl border-[3px] border-ink p-3 sm:p-4" style={{ background: "repeating-linear-gradient(0deg, oklch(0.3 0.04 220) 0 1px, transparent 1px 24px), repeating-linear-gradient(90deg, oklch(0.3 0.04 220) 0 1px, transparent 1px 24px), oklch(0.24 0.04 225)", boxShadow: "inset 0 6px 14px oklch(0 0 0 / .5)" }}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div><div className="font-display text-lg text-parchment">YOUR PROGRAM</div><div className="text-xs font-semibold text-parchment/55">Instructions run from top to bottom for each animal.</div></div>
                <div className="flex items-center gap-2"><span className="rounded-full bg-ink/70 px-3 py-1 text-xs font-bold text-parchment/70">{program.length} top-level blocks</span><button onClick={() => { setProgram([]); setResult(null); }} className="cw-btn cw-btn-ghost text-xs"><RotateCcw size={14} /> Reset</button></div>
              </div>
              <div className="max-h-[330px] space-y-2 overflow-y-auto rounded-xl border-2 border-ink/70 bg-ink/45 p-3">
                {program.length === 0 ? (
                  <div className="grid min-h-36 place-items-center rounded-lg border-2 border-dashed border-parchment/25 p-4 text-center text-parchment/55"><div><Plus size={24} className="mx-auto mb-2" /><div className="font-display">Your program is empty</div><div className="mt-1 text-xs">Add a block from the toolbox to begin.</div></div></div>
                ) : program.map((node) => <ProgramBlock key={node.id} node={node} challenge={activeChallenge} animalIds={activeChallenge.animalIds} update={(fn) => updateBlock(node.id, fn)} remove={() => { setProgram((current) => deleteTree(current, node.id)); setResult(null); }} />)}
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] font-semibold text-parchment/55">No Python or JavaScript is executed. Blocks are checked by WonderPaws' safe game engine.</div>
                <button onClick={run} className="cw-btn shine px-7 py-3 text-xl"><Play size={20} fill="currentColor" /> RUN BELT</button>
              </div>
              {result && <div className="mt-4 rounded-xl border-[3px] border-ink bg-parchment p-3 text-ink shadow-[0_5px_0_var(--ink)]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><div className="font-display text-xl">{result.completed ? "Shift complete!" : result.error ? "Let's repair the program" : "A few animals need help"}</div><div className="text-xs font-semibold text-ink-soft">{result.correct} of {result.totalAnimals} animals sorted correctly · {result.mistakes} mistakes · {result.blockCount} blocks</div></div>
                  <div className="text-center"><Stars value={result.stars} size={21} /><div className="text-[10px] font-bold uppercase text-ink-soft">Challenge result</div></div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {activeAnimals.map((animal) => {
                    const event = result.events.find((item) => item.animalId === animal.id && (item.type === "animal-sorted-correctly" || item.type === "animal-sorted-incorrectly"));
                    const destinationId = event?.destinationId;
                    const correct = event?.type === "animal-sorted-correctly";
                    const destinationLabel = activeChallenge.destinations.find((item) => item.id === destinationId)?.label ?? (destinationId ? destinationId : "No route");
                    return <div key={animal.id} className={`flex items-center gap-2 rounded-lg border-2 p-2 ${correct ? "border-leaf bg-leaf/15" : "border-tomato bg-tomato/10"}`}>
                      <AnimalSprite animal={animal} className="h-10 w-10 object-contain" badgeSize={16} />
                      <div className="min-w-0"><div className="text-xs font-bold">{animal.displayName}</div><div className="truncate text-[10px] text-ink-soft">{destinationLabel}</div></div>
                      {correct ? <Check size={17} className="ml-auto text-leaf" /> : <X size={17} className="ml-auto text-tomato" />}
                    </div>;
                  })}
                </div>
                <div className="mt-3 space-y-1">{result.feedback.slice(0, 4).map((item, index) => <p key={index} className={`text-xs font-semibold ${item.tone === "success" ? "text-green-800" : item.tone === "error" ? "text-red-800" : "text-amber-800"}`}>{item.message}</p>)}</div>
                {result.completed && <div className="mt-3 flex flex-wrap justify-end gap-2"><button onClick={startNextChallenge} className="cw-btn px-4 py-2">{challengeIndex < 2 ? "NEXT CHALLENGE" : "BACK TO LEVEL MAP"} <ArrowRight size={16} /></button></div>}
              </div>}
            </div>
          </div>
        </section>

        {currentTutorial && <TutorialDialog lesson={currentTutorial} step={tutorialStep} onNext={() => tutorialStep < currentTutorial.steps.length - 1 ? setTutorialStep((value) => value + 1) : finishTutorial()} onClose={() => { setTutorialId(null); setTutorialStep(0); }} />}
      </main>
    );
  }

  if (view === "academy") {
    return <AcademyScreen progress={progress} onBack={gotoMap} onComplete={(id) => setProgress((current) => markAcademyLesson(current, id))} initialLessonId={academyLessonId} onSelectLesson={setAcademyLessonId} />;
  }

  if (view === "book") {
    const displayedAnimals = bookFilter === "all" ? animals : animals.filter((animal) => animal.worldId === bookFilter);
    return (
      <LibraryShell title="Animal Book" subtitle="Meet the animals of WonderPaws" onBack={gotoMap}>
        <div className="mb-4 flex flex-wrap gap-2">{[{ id: "all", name: "All worlds" }, ...worldDefinitions.map((world) => ({ id: world.id, name: world.name }))].map((world) => <button key={world.id} onClick={() => setBookFilter(world.id)} className={`rounded-full border-2 border-ink px-3 py-1.5 text-xs font-bold ${bookFilter === world.id ? "bg-sun text-ink" : "bg-parchment text-ink"}`}>{world.name}</button>)}</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedAnimals.map((animal) => {
            const discovered = progress.discoveredAnimalIds.includes(animal.id);
            return <article key={animal.id} className="cw-panel relative flex gap-3 p-3">
              <Rivets /><div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border-[3px] border-ink" style={{ background: "var(--parchment-deep)" }}><AnimalSprite animal={animal} className="h-full w-full object-contain" grayscaleUndiscovered={!discovered} showBadge={discovered} badgeSize={18} /></div>
              <div className="min-w-0"><div className="font-display text-lg text-ink">{discovered ? animal.displayName : "Unknown visitor"}</div><div className="text-[10px] font-bold uppercase tracking-wider text-copper-deep">{discovered ? animal.speciesGroup : "Not discovered yet"}</div><p className="mt-1 text-xs leading-snug text-ink-soft">{discovered ? animal.description : "Complete a sorting challenge to discover this animal."}</p>{discovered && <div className="mt-1 flex flex-wrap gap-1">{[...animal.habitats.slice(0, 2), ...animal.movement.slice(0, 1)].map((tag) => <span key={tag} className="rounded bg-ink/5 px-1.5 py-0.5 text-[9px] font-bold text-ink-soft">{tag}</span>)}</div>}</div>
            </article>;
          })}
        </div>
        <div className="mt-4 text-right text-xs font-bold text-parchment">Discovered {progress.discoveredAnimalIds.length} of {animals.length} animals</div>
      </LibraryShell>
    );
  }

  return (
    <LibraryShell title="Grand Sanctuary" subtitle="A home that grows with every successful shift" onBack={gotoMap}>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <section className="cw-panel relative p-4"><Rivets /><div className="font-display text-2xl text-ink">Your sanctuary map</div><p className="mt-1 text-sm text-ink-soft">Every completed world adds new habitats to your sanctuary.</p><div className="mt-3 grid grid-cols-2 gap-2">{worlds.map((world) => <div key={world.id} className="relative h-32 overflow-hidden rounded-xl border-[3px] border-ink"><img src={world.img} alt="" className="h-full w-full object-cover" /><div className="absolute inset-x-0 bottom-0 bg-ink/75 px-2 py-1 text-parchment"><div className="font-display text-sm">{world.name}</div><div className="text-[10px] font-semibold">{worldProgressPercent(progress, world.id)}% explored · {worldStars(progress, world.id)} stars</div></div></div>)}</div></section>
        <section className="cw-panel relative p-4"><Rivets /><div className="font-display text-2xl text-ink">Sanctuary collection</div><p className="mt-1 text-sm text-ink-soft">The animals you have successfully welcomed home.</p><div className="mt-4 grid grid-cols-3 gap-3">{progress.discoveredAnimalIds.slice(0, 18).map((id) => { const animal = animalById[id]; if (!animal) return null; return <div key={id} className="rounded-xl bg-ink/5 p-2 text-center"><AnimalSprite animal={animal} className="mx-auto h-16 w-16 object-contain" badgeSize={18} /><div className="truncate text-[10px] font-bold text-ink">{animal.displayName}</div></div>; })}</div>{progress.discoveredAnimalIds.length === 0 && <div className="mt-6 rounded-xl border-2 border-dashed border-ink/25 p-6 text-center text-sm font-semibold text-ink-soft">Your sanctuary is waiting for its first visitors. Complete a challenge to welcome an animal.</div>}<div className="mt-4 text-right text-xs font-bold text-ink-soft">{progress.discoveredAnimalIds.length} animals welcomed</div></section>
      </div>
    </LibraryShell>
  );
}

function TutorialDialog({ lesson, step, onNext, onClose }: { lesson: NonNullable<ReturnType<typeof getLesson>>; step: number; onNext: () => void; onClose: () => void }) {
  const current = lesson.steps[Math.min(step, lesson.steps.length - 1)];
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-ink/75 p-4 backdrop-blur-sm">
      <div className="cw-panel relative w-full max-w-xl p-6 shadow-2xl"><Rivets /><div className="cw-plate inline-block px-4 py-1 font-display">PROGRAMMING ACADEMY · FIRST LESSON</div><div className="mt-3 flex items-start justify-between gap-3"><div><div className="text-xs font-bold uppercase tracking-widest text-copper-deep">{lesson.mascot} is showing you the ropes</div><h3 className="mt-1 font-display text-3xl text-ink">{lesson.title}</h3></div><button onClick={onClose} aria-label="Close tutorial" className="rounded-full bg-ink/10 p-2 text-ink hover:bg-ink/20"><X size={18} /></button></div><p className="mt-2 text-sm text-ink-soft">{lesson.summary}</p><div className="mt-5 rounded-xl border-[3px] border-ink bg-white/70 p-4"><div className="flex items-center justify-between"><div className="font-display text-xl text-ink">{current.title}</div><div className="text-xs font-bold text-copper-deep">STEP {step + 1} / {lesson.steps.length}</div></div><p className="mt-2 text-sm leading-relaxed text-ink-soft">{current.explanation}</p><div className="mt-3 rounded-lg bg-teal/15 p-3 text-sm font-semibold text-ink"><span className="font-display">TRY THIS: </span>{current.action}</div>{current.code && <pre className="mt-3 overflow-x-auto rounded-lg bg-ink p-3 text-xs text-leaf">{current.code}</pre>}</div><div className="mt-4 flex items-center justify-between gap-3"><div className="flex gap-1">{lesson.steps.map((_, index) => <span key={index} className={`h-2 w-8 rounded-full ${index <= step ? "bg-leaf" : "bg-ink/15"}`} />)}</div><button onClick={onNext} className="cw-btn px-5 py-2">{step < lesson.steps.length - 1 ? "NEXT STEP" : "START CHALLENGE"} <ChevronRight size={16} /></button></div></div>
    </div>
  );
}

function getLesson(id: string) { return tutorialById[id]; }

function AcademyScreen({ progress, onBack, onComplete, initialLessonId, onSelectLesson }: {
  progress: PlayerProgress; onBack: () => void; onComplete: (id: string) => void; initialLessonId: string; onSelectLesson: (id: string) => void;
}) {
  const [lessonId, setLessonId] = useState(initialLessonId);
  const [step, setStep] = useState(0);
  const lesson = tutorialById[lessonId] ?? tutorials[0];
  const current = lesson.steps[Math.min(step, lesson.steps.length - 1)];
  return (
    <main className="relative min-h-screen overflow-hidden bg-ink px-4 pb-10 pt-5">
      <img src={backgrounds.menu} alt="" className="fixed inset-0 h-full w-full object-cover opacity-45" /><div className="fixed inset-0 bg-ink/60" />
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-5 flex items-center justify-between gap-3"><button onClick={onBack} className="cw-btn cw-btn-ghost text-sm"><ArrowLeft size={16} /> Back to worlds</button><div className="cw-plate px-5 py-1 font-display">WONDERPAWS PROGRAMMING ACADEMY</div></div>
        <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
          <aside className="cw-panel relative p-4"><Rivets /><div className="font-display text-2xl text-ink">Lesson shelf</div><p className="mt-1 text-xs text-ink-soft">Learn a concept whenever you like. Academy lessons do not depend on world progress.</p>{academyCategories.map((category) => <div key={category.id} className="mt-4"><div className="mb-2 font-display text-sm uppercase tracking-wider text-copper-deep">{category.title}</div><div className="space-y-1">{category.lessons.map((id) => { const item = tutorialById[id]; if (!item) return null; const selected = lessonId === id; const completed = progress.academyCompletedIds.includes(id); return <button key={id} onClick={() => { setLessonId(id); onSelectLesson(id); setStep(0); }} className={`flex w-full items-center justify-between rounded-lg border-2 px-3 py-2 text-left text-sm font-bold ${selected ? "border-ink bg-sun text-ink" : "border-ink/10 bg-white/45 text-ink hover:bg-white"}`}><span>{item.title}</span>{completed && <Check size={15} className="text-leaf" />}</button>; })}</div></div>)}</aside>
          <section className="cw-panel relative p-5 sm:p-7"><Rivets /><div className="flex flex-wrap items-center justify-between gap-2"><div className="cw-plate inline-block px-4 py-1 font-display">{lesson.mascot}'S LESSON</div><div className="text-xs font-bold text-ink-soft">{progress.academyCompletedIds.includes(lesson.id) ? "COMPLETED · REPLAY ANYTIME" : "INDEPENDENT LESSON"}</div></div><h2 className="mt-3 font-display text-4xl text-ink">{lesson.title}</h2><p className="mt-2 max-w-2xl text-ink-soft">{lesson.summary}</p>
            <div className="mt-6 rounded-2xl border-[3px] border-ink bg-parchment-deep/40 p-5"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-display text-2xl text-ink">{current.title}</h3><div className="text-xs font-bold text-copper-deep">STEP {step + 1} OF {lesson.steps.length}</div></div><p className="mt-3 text-base leading-relaxed text-ink-soft">{current.explanation}</p><div className="mt-4 rounded-xl border-2 border-ink bg-white/60 p-4"><div className="font-display text-xs uppercase tracking-widest text-copper-deep">Try it in the game</div><p className="mt-1 text-sm font-semibold text-ink">{current.action}</p></div><div className="mt-4"><div className="mb-2 font-display text-xs uppercase tracking-widest text-ink-soft">Python-style idea · illustrative only</div><pre className="overflow-x-auto rounded-xl border-[3px] border-ink bg-ink p-4 text-sm leading-relaxed text-leaf">{lesson.example}</pre><p className="mt-2 text-xs font-semibold text-ink-soft">This example explains the idea behind the visual blocks. WonderPaws does not run arbitrary Python code.</p></div></div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3"><div className="flex gap-1">{lesson.steps.map((_, index) => <button key={index} onClick={() => setStep(index)} aria-label={`Go to step ${index + 1}`} className={`h-2.5 w-8 rounded-full ${index === step ? "bg-teal" : "bg-ink/15"}`} />)}</div><div className="flex gap-2"><button disabled={step === 0} onClick={() => setStep((value) => value - 1)} className="cw-btn cw-btn-teal px-4 py-2 disabled:opacity-40">BACK</button><button onClick={() => { if (step < lesson.steps.length - 1) setStep((value) => value + 1); else { onComplete(lesson.id); setStep(0); } }} className="cw-btn px-4 py-2">{step < lesson.steps.length - 1 ? "NEXT" : "MARK LESSON COMPLETE"} <Check size={15} /></button></div></div>
          </section>
        </div>
      </div>
    </main>
  );
}

function LibraryShell({ title, subtitle, onBack, children }: { title: string; subtitle: string; onBack: () => void; children: ReactNode }) {
  return <main className="relative min-h-screen overflow-hidden bg-ink px-4 pb-10 pt-5"><img src={backgrounds.menu} alt="" className="fixed inset-0 h-full w-full object-cover opacity-40" /><div className="fixed inset-0 bg-ink/65" /><div className="relative z-10 mx-auto max-w-7xl"><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><button onClick={onBack} className="cw-btn cw-btn-ghost text-sm"><ArrowLeft size={16} /> Back to worlds</button><div className="cw-plate px-5 py-1 font-display">WONDERPAWS COLLECTIONS</div></div><div className="mb-5 text-parchment"><h2 className="cw-title-stroke text-4xl sm:text-5xl">{title}</h2><p className="mt-1 text-sm font-semibold text-parchment/75">{subtitle}</p></div>{children}</div></main>;
}

function ConfirmDialog({ title, description, onCancel, onConfirm }: { title: string; description: string; onCancel: () => void; onConfirm: () => void }) {
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-ink/75 p-4"><div className="cw-panel relative w-full max-w-md p-6"><Rivets /><h3 className="font-display text-2xl text-ink">{title}</h3><p className="mt-2 text-sm text-ink-soft">{description}</p><div className="mt-5 flex justify-end gap-2"><button onClick={onCancel} className="cw-btn cw-btn-teal px-4 py-2">Cancel</button><button onClick={onConfirm} className="cw-btn cw-btn-tomato px-4 py-2">Reset progress</button></div></div></div>;
}
