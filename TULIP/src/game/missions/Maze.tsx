import { useEffect, useRef, useState } from "react";
import { useGame } from "../state";
import { MAIN_MAP, PRACTICE_MAP, find, flatten, ghost, step, type Cmd, type Program } from "../maze";
import { useAssist, useHint } from "../ui/assist";
import { Btn } from "../ui/kit";
import { sfx } from "../audio";

const TOOLBOX = {
  kind: "flyoutToolbox",
  contents: [
    { kind: "block", type: "t_forward" },
    { kind: "block", type: "t_left" },
    { kind: "block", type: "t_right" },
    { kind: "block", type: "t_repeat" },
  ],
};

let defined = false;
function defineBlocks(B: any) {
  if (defined) return;
  defined = true;
  B.common.defineBlocksWithJsonArray([
    { type: "t_forward", message0: "⬆ move forward", previousStatement: null, nextStatement: null, colour: 170 },
    { type: "t_left", message0: "↺ turn left", previousStatement: null, nextStatement: null, colour: 30 },
    { type: "t_right", message0: "↻ turn right", previousStatement: null, nextStatement: null, colour: 330 },
    {
      type: "t_repeat",
      message0: "repeat %1 times %2 %3",
      args0: [{ type: "field_number", name: "N", value: 2, min: 1, max: 9, precision: 1 }, { type: "input_dummy" }, { type: "input_statement", name: "DO" }],
      previousStatement: null,
      nextStatement: null,
      colour: 260,
    },
  ]);
}

const KIND: Record<string, Cmd> = { t_forward: "forward", t_left: "left", t_right: "right" };

function readProgram(ws: any): { prog: Program; ids: string[] } {
  const top = ws.getTopBlocks(true)[0];
  const prog: Program = [];
  const ids: string[] = [];
  let b = top;
  while (b) {
    if (b.type === "t_repeat") {
      const body: Cmd[] = [];
      let c = b.getInputTargetBlock("DO");
      while (c) {
        const command = KIND[c.type];
        if (command) body.push(command);
        c = c.getNextBlock();
      }
      const n = Number(b.getFieldValue("N"));
      prog.push({ repeat: n, body });
      for (let i = 0; i < n; i++) body.forEach(() => ids.push(b.id));
    } else if (KIND[b.type]) {
      const command = KIND[b.type];
      if (command) prog.push(command);
      ids.push(b.id);
    }
    b = b.getNextBlock();
  }
  return { prog, ids };
}

const SOLUTIONS: Record<string, string> = {
  practice: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="t_forward" x="20" y="20"><next><block type="t_forward"/></next></block></xml>`,
  main: `<xml xmlns="https://developers.google.com/blockly/xml"><block type="t_repeat" x="20" y="20"><field name="N">3</field><statement name="DO"><block type="t_forward"/></statement><next><block type="t_right"><next><block type="t_repeat"><field name="N">2</field><statement name="DO"><block type="t_forward"/></statement><next><block type="t_left"><next><block type="t_repeat"><field name="N">3</field><statement name="DO"><block type="t_forward"/></statement></block></next></block></next></block></next></block></next></block></xml>`,
};

export function MazeChallenge({ level, onDone }: { level: "practice" | "main"; onDone: () => void }) {
  const map = level === "practice" ? PRACTICE_MAP : MAIN_MAP;
  const div = useRef<HTMLDivElement>(null);
  const ws = useRef<any>(null);
  const B = useRef<any>(null);
  const [running, setRunning] = useState(false);
  const stepIdx = useRef(0);
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  const { fail, succeed, say } = useAssist();
  const setMaze = useGame((s) => s.setMaze);

  const resetPos = (revealed = false) => {
    const s = find(map, "S");
    setMaze({ map, x: s.x, y: s.y, dir: 0, revealed, ghost: [], bump: 0 });
    stepIdx.current = 0;
  };

  useEffect(() => {
    resetPos(level === "practice");
    let disposed = false;
    import("blockly").then((Blockly) => {
      if (disposed || !div.current) return;
      B.current = Blockly;
      defineBlocks(Blockly);
      ws.current = Blockly.inject(div.current, { toolbox: TOOLBOX as any, trashcan: true, scrollbars: true, zoom: { startScale: 1.25 }, renderer: "zelos" });
      ws.current.addChangeListener(() => {
        const g = useGame.getState().maze;
        if (!g || !ws.current) return;
        const { prog } = readProgram(ws.current);
        useGame.getState().setMaze({ ...g, ghost: ghost(map, flatten(prog)) });
      });
    });
    return () => {
      disposed = true;
      ws.current?.dispose();
      ws.current = null;
      setMaze(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);

  const exec = async (single: boolean) => {
    if (!ws.current || running) return;
    const { prog, ids } = readProgram(ws.current);
    const cmds = flatten(prog);
    if (!cmds.length) return fail("I need some blocks first! Drag 'move forward' into the white space.");
    let m = useGame.getState().maze;
    if (!m) return;
    setRunning(true);
    const goal = find(map, "G");
    if (!single || stepIdx.current === 0) {
      const s = find(map, "S");
      m = { ...m, x: s.x, y: s.y, dir: 0, revealed: true };
      setMaze(m);
      if (!single) stepIdx.current = 0;
      await wait(500);
      if (!alive.current) return;
    }
    const end = single ? Math.min(stepIdx.current + 1, cmds.length) : cmds.length;
    for (let i = stepIdx.current; i < end; i++) {
      const command = cmds[i];
      if (!command) continue;
      ws.current?.highlightBlock(ids[i] ?? null);
      const r = step(map, m, command);
      if (!r.ok) {
        sfx.bonk();
        setMaze({ ...m, bump: Date.now() });
        setRunning(false);
        stepIdx.current = 0;
        fail(`Bonk! A bush was in the way at step ${i + 1}. Check the blocks before it!`);
        return;
      }
      sfx.step();
      m = { ...m, x: r.x, y: r.y, dir: r.dir };
      setMaze(m);
      useGame.getState().setMood("walking", 600);
      stepIdx.current = i + 1;
      await wait(650);
      if (!alive.current) return;
      if (m.x === goal.x && m.y === goal.y) {
        ws.current?.highlightBlock(null);
        setRunning(false);
        succeed(level === "practice" ? "I did it! Forward, forward!" : "I reached Pip! My program worked!");
        setTimeout(() => { if (alive.current) onDone(); }, 2200);
        return;
      }
    }
    setRunning(false);
    if (!single || stepIdx.current >= cmds.length) {
      stepIdx.current = 0;
      fail("I stopped before the goal. I need more steps!");
    }
  };

  useHint(
    {
      clue: level === "practice" ? "The goal is 2 tiles ahead. Use 'move forward' two times." : "Pip's map: go 3 forward, turn right, 2 forward, turn left, 3 forward. 'Repeat' saves blocks!",
      highlight: ".blocklyFlyout .blocklyDraggable",
      solve: {
        say: "Here's a program that works. Each block is one instruction, in order. Press RUN!",
        run: () => {
          if (!ws.current || !B.current) return;
          ws.current.clear();
          B.current.Xml.domToWorkspace(B.current.utils.xml.textToDom(SOLUTIONS[level]), ws.current);
        },
      },
    },
    [level],
  );

  return (
    <div className="flex flex-col gap-3">
      {level === "main" && (
        <div className="flex items-center gap-3 rounded-2xl bg-sun/40 p-3 font-display text-lg font-bold text-ink" data-map>
          Pip's map sketch: ➡➡➡ then ⬇⬇ then ➡➡➡. The bushes are hidden in the fog!
        </div>
      )}
      <div ref={div} className="tulip-blockly h-[340px] w-full overflow-hidden rounded-2xl border-4 border-primary/30" />
      <div className="flex flex-wrap gap-2">
        <Btn onClick={() => exec(false)} disabled={running} data-run>▶ RUN</Btn>
        <Btn variant="sun" onClick={() => exec(true)} disabled={running}>Step</Btn>
        <Btn variant="soft" onClick={() => { resetPos(level === "practice"); ws.current?.highlightBlock(null); say("Back to the start!", "idle"); }}>Reset</Btn>
      </div>
    </div>
  );
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
