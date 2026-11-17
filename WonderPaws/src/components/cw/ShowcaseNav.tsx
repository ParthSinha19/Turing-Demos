import { Link } from "@tanstack/react-router";
import { Home, PawPrint, Factory, Globe2, Gamepad2, Shapes } from "lucide-react";

const items = [
  { to: "/", label: "Menu", icon: Home },
  { to: "/characters", label: "Critters", icon: PawPrint },
  { to: "/factory", label: "Factory", icon: Factory },
  { to: "/worlds", label: "Worlds", icon: Globe2 },
  { to: "/interface", label: "In-Game UI", icon: Gamepad2 },
  { to: "/components", label: "UI Kit", icon: Shapes },
] as const;

/** Floating showcase switcher — styled as a riveted tin tab bar. */
export function ShowcaseNav() {
  return (
    <nav className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="cw-panel-dark flex items-center gap-1 rounded-full px-2 py-1.5">
        {items.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-sm text-parchment/80 transition hover:bg-parchment/10 hover:text-parchment"
            activeProps={{ className: "!bg-sun !text-ink shadow-[inset_0_-3px_0_var(--sun-deep)]" }}
            activeOptions={{ exact: true }}
          >
            <Icon className="h-4 w-4" strokeWidth={2.5} />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
