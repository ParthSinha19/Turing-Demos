<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Rover Lab architecture
- `src/rover/` (catalogue, configuration, layout, stats, physicsProfile, joints) is pure TS with no React/three.js; every number shown or simulated derives from it, so the model and figures never disagree.
- `computeRoverLayout` is the single source of part positions; the 3D assembly, stats and physics profile all read it.
- The 3D rover (`src/rover/model/`) is a joint tree (body → rocker → bogie → steering → wheel spin) that only reads `RoverJointState`; physics must write joints, never move meshes directly.
- Physics (Phase 3+) consumes only `RoverPhysicsProfile`, never catalogue entries, to keep the design/physics contract in one place.
- Environments are data (`EnvironmentDefinition`) plus a shared height function and rock placement, so custom levels and collision reuse the same source.
- Rover parts are built with `PartBuilder` (merged geometry per pooled material) to keep draw calls low on school computers.
- `noUncheckedIndexedAccess` and `noPropertyAccessFromIndexSignature` are off in tsconfig: the geometry/noise code is index-heavy and the checks added noise without catching real bugs.
- The rover design persists in localStorage via `useRoverStore` (one authoritative config for all sections); `window.__roverLab` is a dev-only test handle.
