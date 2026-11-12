import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { Battery, Camera, CirclePause, CirclePlay, Compass, Gauge, MapPin, RotateCcw, ShieldAlert, Zap } from "lucide-react";
import { MarsEnvironment } from "@/environment/MarsEnvironment";
import { createWorldHeight } from "./physics";
import { QUALITY } from "@/scene/quality";
import { useLabStore } from "@/state/labStore";
import { useRoverStore } from "@/state/roverStore";
import { useSimulationStore } from "./simulationStore";
import { SimulationRover } from "./SimulationRover";
import { WorldVisuals } from "./WorldVisuals";
import { computeRoverLayout } from "@/rover/layout";
import { computeStats } from "@/rover/stats";
import { computePhysicsProfile } from "@/rover/physicsProfile";
import type { SimulationWorld } from "./types";
import { cn } from "@/lib/utils";

function KeyboardDrive() {
  const setInput = useSimulationStore((s) => s.setInput);
  useEffect(() => {
    const pressed = new Set<string>();
    const update = () => {
      const throttle = pressed.has("w") || pressed.has("arrowup") ? 1 : pressed.has("s") || pressed.has("arrowdown") ? -1 : 0;
      const steer = pressed.has("a") || pressed.has("arrowleft") ? -1 : pressed.has("d") || pressed.has("arrowright") ? 1 : 0;
      setInput({ throttle, steer, brake: pressed.has(" ") });
    };
    const keyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
        event.preventDefault();
        pressed.add(key);
        update();
      }
    };
    const keyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      pressed.delete(key);
      update();
    };
    const clear = () => { pressed.clear(); update(); };
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      window.removeEventListener("blur", clear);
    };
  }, [setInput]);
  return null;
}

function HoldControl({ label, throttle, steer, brake = false, icon }: { label: string; throttle: number; steer: number; brake?: boolean; icon: ReactNode }) {
  const setInput = useSimulationStore((s) => s.setInput);
  const reset = () => setInput({ throttle: 0, steer: 0, brake: false });
  return (
    <button
      type="button"
      aria-label={label}
      className="flex h-11 w-11 select-none items-center justify-center rounded-md border border-white/10 bg-white/10 text-foreground shadow-lg backdrop-blur transition hover:bg-white/20 active:bg-signal/25"
      onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); setInput({ throttle, steer, brake }); }}
      onPointerUp={reset}
      onPointerCancel={reset}
      onLostPointerCapture={reset}
    >
      {icon}
    </button>
  );
}

function CameraFeed({ world }: { world: SimulationWorld }) {
  const config = useRoverStore((s) => s.config);
  const snapshot = useSimulationStore((s) => s.snapshot);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const installed = config.sensors.includes("sensor-camera");
  const pose = snapshot?.pose;
  const visible = useMemo(() => {
    if (!pose) return [];
    const c = Math.cos(pose.yaw);
    const s = Math.sin(pose.yaw);
    return world.obstacles.map((o) => {
      const dx = o.x - pose.x;
      const dz = o.z - pose.z;
      const forward = dx * c + dz * s;
      const right = -dx * s + dz * c;
      const angle = Math.atan2(right, forward) * 180 / Math.PI;
      return { ...o, forward, right, angle };
    }).filter((o) => o.forward > 0.45 && o.forward < 25 && Math.abs(o.angle) <= 22.5);
  }, [world.obstacles, pose?.x, pose?.z, pose?.yaw]);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    const horizon = height * 0.38;
    const sky = context.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, "#45332d");
    sky.addColorStop(1, "#92654b");
    context.fillStyle = sky;
    context.fillRect(0, 0, width, horizon);
    const ground = context.createLinearGradient(0, horizon, 0, height);
    ground.addColorStop(0, "#996648");
    ground.addColorStop(1, "#bd8960");
    context.fillStyle = ground;
    context.fillRect(0, horizon, width, height - horizon);
    context.beginPath();
    context.moveTo(0, horizon + 7);
    context.quadraticCurveTo(width * 0.5, horizon - 9, width, horizon + 4);
    context.strokeStyle = "rgba(42,28,21,.5)";
    context.lineWidth = 2;
    context.stroke();
    const focal = width * 0.92;
    const floor = height * 0.94;
    [...visible].sort((a, b) => b.forward - a.forward).forEach((obstacle) => {
      const scale = focal / obstacle.forward;
      const x = width / 2 + obstacle.right * scale;
      const w = Math.max(2, obstacle.radius * scale * 1.45);
      const h = Math.max(3, obstacle.height * scale * 0.72);
      const y = floor - h;
      context.fillStyle = "rgba(35,22,16,.22)";
      context.beginPath();
      context.ellipse(x, floor - 1, w * 1.1, Math.max(1.5, w * 0.23), 0, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = obstacle.kind === "barrier" ? "#665447" : obstacle.kind === "boulder" ? "#574438" : "#725848";
      context.beginPath();
      context.moveTo(x - w, floor - h * 0.35);
      context.lineTo(x - w * 0.72, y + h * 0.2);
      context.lineTo(x - w * 0.18, y);
      context.lineTo(x + w * 0.62, y + h * 0.08);
      context.lineTo(x + w, floor - h * 0.25);
      context.closePath();
      context.fill();
      context.strokeStyle = "rgba(218,177,143,.22)";
      context.lineWidth = Math.max(0.5, scale * 0.02);
      context.stroke();
    });
    context.strokeStyle = "rgba(149,232,244,.8)";
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(width / 2 - 8, height / 2);
    context.lineTo(width / 2 + 8, height / 2);
    context.moveTo(width / 2, height / 2 - 8);
    context.lineTo(width / 2, height / 2 + 8);
    context.stroke();
    context.fillStyle = "rgba(12,12,12,.55)";
    context.fillRect(5, 5, 74, 12);
    context.fillStyle = "#d9f3f5";
    context.font = "8px monospace";
    context.fillText(`FOV 45°  ${visible.length} RETURNS`, 9, 14);
  }, [visible]);
  if (!installed) return null;
  return (
    <div className="panel w-[228px] overflow-hidden p-2">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="label-caps flex items-center gap-1.5"><Camera className="h-3 w-3 text-signal" /> Mast camera</span>
        <span className="font-mono text-[9px] text-muted-foreground">LIVE PREVIEW</span>
      </div>
      <canvas ref={canvasRef} width={320} height={160} className="h-[120px] w-full rounded border border-white/10" aria-label="Simplified geometric view from the rover's forward camera" />
      <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">A perspective preview built from nearby world geometry and the installed camera's 45° field of view.</p>
    </div>
  );
}

function TelemetryPanel({ world }: { world: SimulationWorld }) {
  const snapshot = useSimulationStore((s) => s.snapshot);
  const mode = useSimulationStore((s) => s.mode);
  const config = useRoverStore((s) => s.config);
  const telemetry = snapshot?.telemetry;
  const distance = telemetry?.frontDistanceM;
  const sensorNames = config.sensors;
  const lidarCount = telemetry?.sensors.filter((s) => s.kind === "lidar" && s.distanceM !== null).length ?? 0;
  return (
    <div className="panel w-[252px] p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="label-caps">Rover telemetry</div>
          <div className="font-display text-sm font-semibold text-foreground">{world.name}</div>
        </div>
        <span className={cn("rounded px-2 py-1 text-[9px] font-bold uppercase tracking-wider", telemetry?.health === "moving" ? "bg-positive/15 text-positive" : telemetry?.health === "stuck" || telemetry?.health === "tipped" ? "bg-negative/15 text-negative" : telemetry?.health === "obstructed" || telemetry?.health === "low-battery" ? "bg-caution/15 text-caution" : "bg-white/10 text-muted-foreground")}>{telemetry?.health ?? "ready"}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Metric icon={<Gauge className="h-3 w-3" />} label="Speed" value={`${(telemetry?.speedMs ?? 0).toFixed(2)} m/s`} />
        <Metric icon={<Battery className="h-3 w-3" />} label="Battery" value={`${(telemetry?.batteryPercent ?? 100).toFixed(0)}%`} />
        <Metric icon={<Zap className="h-3 w-3" />} label={telemetry?.charging ? "Charging" : "Energy"} value={`${Math.round(telemetry?.energyW ?? 0)} W`} />
        <Metric icon={<ShieldAlert className="h-3 w-3" />} label="Motor load" value={`${Math.round(telemetry?.motorLoadPercent ?? 0)}%`} />
      </div>
      <div className="mt-2.5 space-y-2 border-t border-white/10 pt-2.5">
        <div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">Incline</span><span className="font-mono text-foreground">{(telemetry?.slopeDeg ?? 0).toFixed(1)}°</span></div>
        <div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">Side tilt</span><span className="font-mono text-foreground">{(telemetry?.crossSlopeDeg ?? 0).toFixed(1)}°</span></div>
        <div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">Stability</span><span className="font-mono text-foreground">{Math.round(telemetry?.stabilityPercent ?? 100)}%</span></div>
        <div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">Front sensor</span><span className="font-mono text-foreground">{distance === null || distance === undefined ? "No reading" : `${distance.toFixed(1)} m`}</span></div>
        {sensorNames.includes("sensor-lidar") && <div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">LiDAR returns</span><span className="font-mono text-foreground">{lidarCount}/48</span></div>}
        {world.sample && <div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">Sample</span><span className={cn("font-mono", snapshot?.collectedSamples ? "text-positive" : "text-foreground")}>{snapshot?.collectedSamples ? "Collected" : "Not collected"}</span></div>}
        {world.sample && !config.attachments.some((id) => id === "attach-collector" || id === "attach-arm") && <p className="text-[10px] leading-snug text-caution">Install a sample collector or robotic arm in the Design Lab to retrieve this sample.</p>}
        <div className="flex items-center justify-between text-[11px]"><span className="text-muted-foreground">Terrain</span><span className="font-mono text-foreground">{telemetry?.terrain ?? "Regolith"}</span></div>
        {world.target && <div className="flex items-center justify-between gap-2 text-[11px]"><span className="text-muted-foreground">{world.target.label}</span><span className={cn("font-mono", snapshot && Math.hypot(snapshot.pose.x - world.target.x, snapshot.pose.z - world.target.z) <= world.target.radius ? "text-positive" : "text-foreground")}>{snapshot && Math.hypot(snapshot.pose.x - world.target.x, snapshot.pose.z - world.target.z) <= world.target.radius ? "Reached" : `${Math.hypot((snapshot?.pose.x ?? world.start.x) - world.target.x, (snapshot?.pose.z ?? world.start.z) - world.target.z).toFixed(1)} m`}</span></div>}
      </div>
      <div className="mt-3 rounded-md border border-white/10 bg-white/[0.035] p-2">
        <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-signal"><Compass className="h-3 w-3" /> {mode === "autonomous" ? "Robot brain" : "Drive status"}</div>
        <p className="text-[11px] leading-relaxed text-foreground/90">{mode === "autonomous" ? snapshot?.autonomousDecision ?? "Waiting for sensor input." : telemetry?.status ?? "Ready for driving"}</p>
      </div>
      {telemetry?.collision && <p className="mt-2 text-[10px] leading-snug text-caution">The rover is in contact with an obstacle. Reverse or steer around it.</p>}
    </div>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="rounded border border-white/10 bg-white/[0.035] p-2">
    <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
    <div className="mt-1 font-mono text-[13px] font-semibold text-foreground">{value}</div>
  </div>;
}

export function SandboxPage({ world, missionId, heading, subheading }: { world: SimulationWorld; missionId?: string; heading?: string; subheading?: string }) {
  const qualityLevel = useLabStore((s) => s.quality);
  const quality = QUALITY[qualityLevel];
  const paused = useSimulationStore((s) => s.paused);
  const mode = useSimulationStore((s) => s.mode);
  const setPaused = useSimulationStore((s) => s.setPaused);
  const setMode = useSimulationStore((s) => s.setMode);
  const follow = useSimulationStore((s) => s.followCamera);
  const setFollow = useSimulationStore((s) => s.setFollowCamera);
  const snapshot = useSimulationStore((s) => s.snapshot);
  const config = useRoverStore((s) => s.config);
  const [showSensors, setShowSensors] = useState(true);
  const layout = useMemo(() => computeRoverLayout(config), [config]);
  const stats = useMemo(() => computeStats(config, layout), [config, layout]);
  const profile = useMemo(() => computePhysicsProfile(config, layout, stats), [config, layout, stats]);
  const height = useMemo(() => createWorldHeight(world), [world]);

  const reset = () => {
    const store = useSimulationStore.getState();
    store.requestReset();
    store.setPaused(false);
  };
  const installRequired = mode === "autonomous" && (!profile.sensors.some((s) => s.kind === "distance" || s.kind === "lidar") || (!profile.sensors.some((s) => s.kind === "lidar") && !profile.sensors.some((s) => s.kind === "side")));

  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      <KeyboardDrive />
      <div className="relative flex-1 overflow-hidden">
        <Canvas shadows dpr={quality.dpr} gl={{ antialias: quality.antialias, powerPreference: "high-performance" }} camera={{ fov: 47, near: 0.05, far: 900, position: [-7, 5.5, 0] }}>
          <MarsEnvironment quality={quality} definition={world.environment} />
          <WorldVisuals world={world} height={height} showSensors={showSensors} />
          <SimulationRover world={world} {...(missionId ? { missionId } : {})} height={height} />
        </Canvas>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(14,10,8,0.28)_100%)]" />
        <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1">
          <div className="panel max-w-[340px] px-3 py-2">
            <div className="label-caps">{heading ?? "Simulation sandbox"}</div>
            <div className="font-display text-base font-semibold text-foreground">{world.name}</div>
            {subheading && <p className="mt-0.5 text-[11px] text-muted-foreground">{subheading}</p>}
          </div>
        </div>
        <div className="pointer-events-none absolute right-3 top-3">
          <TelemetryPanel world={world} />
        </div>
        <div className="pointer-events-auto absolute bottom-3 left-3 flex flex-col gap-2">
          <div className="panel flex items-center gap-2 p-2">
            <HoldControl label="Steer left" throttle={0} steer={-1} icon={<span className="text-lg">←</span>} />
            <div className="flex flex-col gap-1">
              <HoldControl label="Forward" throttle={1} steer={0} icon={<span className="text-lg">↑</span>} />
              <HoldControl label="Brake" throttle={0} steer={0} brake icon={<span className="text-xs font-bold">STOP</span>} />
              <HoldControl label="Reverse" throttle={-1} steer={0} icon={<span className="text-lg">↓</span>} />
            </div>
            <HoldControl label="Steer right" throttle={0} steer={1} icon={<span className="text-lg">→</span>} />
          </div>
          <div className="panel flex flex-wrap items-center gap-1.5 p-2">
            <button className="flex items-center gap-1.5 rounded px-2 py-1.5 text-[10px] font-semibold text-foreground hover:bg-white/10" onClick={() => setPaused(!paused)}>{paused ? <CirclePlay className="h-3.5 w-3.5 text-signal" /> : <CirclePause className="h-3.5 w-3.5 text-signal" />}{paused ? "Resume" : "Pause"}</button>
            <button className="flex items-center gap-1.5 rounded px-2 py-1.5 text-[10px] font-semibold text-foreground hover:bg-white/10" onClick={reset}><RotateCcw className="h-3.5 w-3.5" />Reset rover</button>
            <button className="flex items-center gap-1.5 rounded px-2 py-1.5 text-[10px] font-semibold text-foreground hover:bg-white/10" onClick={() => setFollow(!follow)}><Camera className="h-3.5 w-3.5" />{follow ? "Free camera" : "Follow rover"}</button>
            <button className={cn("rounded px-2 py-1.5 text-[10px] font-semibold", mode === "manual" ? "bg-signal/15 text-signal" : "text-muted-foreground hover:bg-white/10")} onClick={() => setMode("manual")}>Manual</button>
            <button className={cn("rounded px-2 py-1.5 text-[10px] font-semibold", mode === "autonomous" ? "bg-signal/15 text-signal" : "text-muted-foreground hover:bg-white/10")} onClick={() => setMode("autonomous")}>Autonomous</button>
            <button className={cn("rounded px-2 py-1.5 text-[10px] font-semibold", showSensors ? "bg-white/10 text-foreground" : "text-muted-foreground hover:bg-white/10")} onClick={() => setShowSensors((v) => !v)}>Sensor rays</button>
          </div>
          {installRequired && <div className="max-w-[360px] rounded border border-caution/30 bg-panel-strong/95 px-3 py-2 text-[11px] leading-snug text-caution">Autonomous driving is stopped. Fit a front distance sensor and side sensors, or a LiDAR scanner, in the Design Lab.</div>}
        </div>
        <div className="pointer-events-none absolute bottom-3 right-3 flex flex-col items-end gap-2">
          <CameraFeed world={world} />
          <div className="panel px-2.5 py-1.5 text-[9px] text-muted-foreground">
            <span className="font-mono text-foreground">W A S D</span> drive · <span className="font-mono text-foreground">SPACE</span> brake · Orbit / zoom in free camera
          </div>
        </div>
        {!showSensors && <div className="pointer-events-none absolute right-3 top-[330px] rounded bg-panel-strong/90 px-2 py-1 text-[10px] text-muted-foreground">Sensor rays hidden</div>}
        {showSensors && snapshot?.telemetry.sensors.length === 0 && <div className="pointer-events-none absolute bottom-[155px] right-3 rounded bg-panel-strong/90 px-2 py-1 text-[10px] text-muted-foreground">No active sensors installed</div>}
      </div>
    </div>
  );
}
