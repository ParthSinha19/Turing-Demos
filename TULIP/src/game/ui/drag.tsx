import { useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { sfx } from "../audio";

/**
 * Touch-friendly drag & drop: drag with pointer, OR tap an item then tap a target.
 * Targets are any element with data-drop="id".
 */
let selected: { id: string; onDrop: (t: string) => void } | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export function Draggable({ id, onDrop, children, className, disabled }: { id: string; onDrop: (target: string) => void; children: ReactNode; className?: string; disabled?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number; moved: boolean } | null>(null);
  const selId = useSyncExternalStore(subscribe, () => selected?.id ?? null, () => null);
  const isSel = selId === id;

  return (
    <div
      ref={ref}
      data-drag={id}
      className={cn("touch-none select-none", disabled ? "opacity-40 pointer-events-none" : "cursor-grab", isSel && "ring-4 ring-sun rounded-2xl", className)}
      style={drag ? { transform: `translate(${drag.x}px, ${drag.y}px) scale(1.08)`, zIndex: 50, position: "relative", pointerEvents: "none" } : undefined}
      onPointerDown={(e) => {
        if (disabled) return;
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        start.current = { x: e.clientX, y: e.clientY, moved: false };
      }}
      onPointerMove={(e) => {
        if (!start.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        if (!start.current.moved && Math.hypot(dx, dy) > 8) {
          start.current.moved = true;
          sfx.pick();
        }
        if (start.current.moved) setDrag({ x: dx, y: dy });
      }}
      onPointerUp={(e) => {
        const s = start.current;
        start.current = null;
        setDrag(null);
        if (!s) return;
        if (s.moved) {
          const el = document.elementsFromPoint(e.clientX, e.clientY).find((n) => (n as HTMLElement).dataset?.['drop']) as HTMLElement | undefined;
          const target = el?.dataset['drop'];
          if (target) {
            selected = null;
            notify();
            onDrop(target);
          }
        } else {
          sfx.pick();
          selected = isSel ? null : { id, onDrop };
          notify();
        }
      }}
    >
      {children}
    </div>
  );
}

export function DropZone({ id, children, className }: { id: string; children?: ReactNode; className?: string }) {
  return (
    <div
      data-drop={id}
      className={className}
      onClick={() => {
        if (selected) {
          const s = selected;
          selected = null;
          notify();
          s.onDrop(id);
        }
      }}
    >
      {children}
    </div>
  );
}
