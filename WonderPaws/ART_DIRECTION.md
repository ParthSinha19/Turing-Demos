# WonderPaws — Art Direction

**Theme name: "Tin & Timber."** A storybook miniature-diorama factory: painted tin machinery, warm timber, copper trim and parchment labels, lit by golden afternoon sun. Characters are soft, plush, animated-film-style 3D renders that read clearly at small sizes.

## 1. Colour palette
All tokens live in `src/styles.css` (oklch) and are available as Tailwind classes (`bg-teal`, `text-ink`, …).

| Token | Role | Value |
|---|---|---|
| `--ink` | Outlines, text, drop-edges | `oklch(0.24 0.04 250)` deep navy |
| `--parchment` / `--parchment-deep` | Panels, labels | warm cream / tan |
| `--teal` / `--teal-deep` | Factory paint, secondary buttons | `oklch(0.62 0.09 185)` |
| `--copper` / `--copper-deep` | Pipes, plates, panel borders | `oklch(0.66 0.13 55)` |
| `--sun` / `--sun-deep` | Primary action, stars, active tab | `oklch(0.85 0.16 85)` |
| `--tomato` / `--tomato-deep` | Danger, hearts, close | `oklch(0.63 0.2 30)` |
| `--leaf` | Success, progress fill | `oklch(0.7 0.16 140)` |
| `--plum`, `--ice` | Mythical / Frozen accents | — |
| `--glow` | Sparkles, highlights | warm near-white |

Rule: **ink outlines everything interactive** (3px) so UI matches the cartoon character silhouettes.

## 2. Typography
- **Lilita One** (display) — titles, buttons, labels, numbers. Chunky, friendly, not preschool.
- **Figtree** (body) — descriptions and small text, 400–800.
- Logo: Lilita One with a 6px ink stroke (`paint-order: stroke fill`) + 8px ink drop. "Wonder" in sun, "Paws" in tomato, a teal spinning gear as the mark, and a copper "THE GREAT ANIMAL FACTORY" plate.
Loaded from Google Fonts in `src/routes/__root.tsx`.

## 3. Character design
- Rendered as stylised 3D plush characters: big glossy eyes, rounded chunky proportions, one prop/costume item each to give a job and silhouette (cap, scarf, wrench + bell, goggles, hard hat, golden horn).
- Six mascots: Henrietta & Pip (hen + chick), Admiral Waddle & Puff (penguin + chick), Bessie Bolt (cow), Juniper Jump (rabbit), Rexford (T-Rex), Lumi (unicorn).
- Each has a signature tint token used for its card background and stat bars.
- Motion is done in CSS: `anim-bob` (idle), `anim-hop` (happy squash-and-stretch), `anim-sway` (curious), mirrored (turn). Characters always carry a soft ink drop-shadow (`cw-char`).

## 4. Environment design
- Same lens for every scene: tilt-shift miniature diorama, warm key light, soft depth of field, rich foreground framing.
- Factory: interior hall with four colour-coded sorting machines, copper pipes, hanging lamps, arched windows. A CSS-animated foreground belt, SVG gears, light-shaft overlay and dust motes add depth and life.
- Worlds keep the lens but change palette/material/sky:
  - Domestic Meadows — honey sunlight, greens, red barn.
  - Frozen Kingdom — twilight cyan, ice, aurora.
  - Jurassic Jungle — amber haze, ferns, volcano.
  - Mythical Realms — violet dusk, floating isles, rainbow falls.
  - Grand Sanctuary — sunset gold uniting all four around a golden factory dome.

## 5. UI design system
- **Panels:** `cw-panel` (parchment with copper border, inner bevel, rivets) and `cw-panel-dark` (painted teal tin).
- **Plates/ribbons:** `cw-plate` — engraved copper name plates for headings.
- **Buttons:** `cw-btn` (sun), `cw-btn-teal`, `cw-btn-tomato`, `cw-btn-ghost`, `cw-round`. All have a top highlight, inner bottom bevel and a 6px ink "base" that compresses on press — tactile like a toy.
- **Feedback:** hover lift, press-down, `shine` sweep on hero buttons, pulsing notification dot.
- **Indicators:** 3-star rating (middle star larger), segmented stat meters, rounded progress bar with shine, pill status chips.
- Motion respects `prefers-reduced-motion`.

## 6. Asset sources & licensing
- All character and environment images in `src/assets/` were **AI-generated for this project** (Lovable image generation) from original prompts. No commercial game characters or stock images were used. Usage rights follow the generation service's terms — confirm before commercial release.
- Gears, rivets, motes, belt and all UI are original SVG/CSS in the source.
- Icons: [Lucide](https://lucide.dev) (ISC licence).
- Fonts: Lilita One and Figtree via Google Fonts (SIL Open Font Licence).
