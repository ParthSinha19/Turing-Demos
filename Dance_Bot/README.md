# Teach the Robot to Dance

A classroom lab where students **design their own labels**, build dances from 50 moves, and **teach a robot to recognise them**. It shows how supervised machine learning really works: training data, labels, features, testing on unseen examples, mistakes, and why more or better data matters.

Static site. No build step, no server, no accounts. Double-click `index.html` or host the folder anywhere (GitHub Pages workflow included).

## Two modes, plus Training Camp

| | **Junior** (default, Years 5-6) | **Full** (Years 7+) |
|---|---|---|
| Tabs | Moves, Labels, Try it, My dancer, Extras | adds Lab; Test and Project are the full versions |
| Brain | one friendly brain, the look-alike finder ("it looks for the dances most like yours") | choose Question tree or Look-alike finder |
| Moves | 14 starter moves, "More moves" button for the rest | all 50, in categories |
| Limits | 4 labels, 8 moves per dance | 8 labels, 16 moves |
| Words | plain language, "quiz" instead of "exam", no percentages or tables | exam history, mix-up table, brain battle |

Switch in `js/config.js` (`mode: 'junior'` or `'full'`) or per link with `?mode=full`.

**Training Camp** is a step-by-step tutorial that covers every feature. A coach card says what to do, the right button glows, and the step ticks itself off when the student does it. It appears on a student's first visit and any time from the 🎓 Training Camp button. Stages can be done in order or replayed individually.

| Stage | Teaches |
|---|---|
| Meet your dancer | characters, head, hat, colours, photo head, stages |
| Make a dance | picking moves, previewing, playing, reordering, repeating, removing |
| What are labels? | labels, examples, Show style |
| Teach the robot | training and the brain light |
| Ask the robot | asking and reading the explanation |
| Was the robot right? | revealing what you meant, learning from mistakes |
| Invent your own label | the label designer |
| Teach it your style | saving examples, retraining, testing a new label |
| Quiz the robot | fair testing on unseen dances |
| Look inside the brain, Brain battle | Lab and comparing two brains (Full mode only) |
| Packs, saving and buttons | packs, save and open files, sound, light and dark |

Training Camp uses its own practice labels (Happy and Sleepy). A student's own game is backed up automatically first and can be restored from the "Ready for the main game?" screen. Turn the tutorial off with `tutorial: 'off'`, or hide the first-visit welcome for one link with `?camp=0`.

## What is new in this version

| Area | What changed |
|---|---|
| **Labels** | Students design their own: name, badge emoji, colour and a written "clue". Edit, recolour or delete any time. Six ready-made packs (Dance styles, Moods, Animal moves, Sports, Order puzzle, Blank slate). |
| **Dancer** | Fully customisable SVG character: 7 head types (including **any emoji** or a **student's photo or drawing**), 4 bodies, 3 limb styles, eyes, mouths, hats, chest badge, glasses, headphones, cape, three colours, 7 presets and a randomiser. Any character can do every move. 5 stage backdrops. |
| **Brains** | Two to compare: the **Question tree** (decision tree) and the **Look-alike finder** (nearest neighbours). Each explains its guesses in its own way. |
| **Evaluation** | Fair exam kept separate from training, exam version tracking, mix-up table (confusion matrix), brain-vs-brain comparison, "studied vs understood" gap. |
| **Lab** | "What the robot thinks each label means" set beside the student's own clue. |
| **Package** | Light and dark themes, optional sound, save and open project files, teacher settings in `js/config.js`, printable worksheet, lesson guide, link parameters. |

## Run it

- **Locally:** open `index.html` in any modern browser. Works offline (fonts fall back to system fonts if offline).
- **GitHub Pages:** push to `main`. The workflow in `.github/workflows/pages.yml` publishes the folder. In the repo settings, set Pages source to *GitHub Actions*.
- **Any web host or school server:** upload the folder as is.

## Teacher settings

Edit `js/config.js`:

| Setting | What it does |
|---|---|
| `mode` | `junior` (Years 5-6) or `full` (Years 7+). |
| `tutorial` | `auto` shows the Training Camp welcome on first visit, `off` hides Training Camp. |
| `defaultPack` | Which pack new students start with. `null` uses the mode's default. `blank` means invent everything. |
| `allowPhotos` | Turn the photo head on or off. |
| `theme`, `soundDefault`, `title` | Look and feel. |
| `overrides` | Optional fine-tuning of the mode: `showBrainChoice`, `defaultBrain`, `maxLabels`, `maxMoves`, `showLab`, `starterMovesOnly`. Leave as `null` to keep the mode's setting. |

Link parameters override a few of these: `index.html?mode=full&pack=moods&brain=knn&theme=light&tab=labels&camp=0`.

## Files

```
index.html            page shell
css/styles.css        themes, stage backdrops, layout
js/config.js          teacher settings
js/ml.js              both brains + explanations (no DOM, unit-testable)
js/moves.js           50 moves and their pose frames
js/packs.js           label packs, colour and emoji palettes
js/character.js       customisable SVG rig and photo handling
js/app.js             state, rendering, actions
js/tutorial.js        Training Camp stages, coach card, welcome and menus
teacher/guide.md      lesson plan, vocabulary, misconceptions, questions
teacher/worksheet.html  printable worksheet, Years 7+
teacher/worksheet-junior.html  printable worksheet, Years 5-6
.github/workflows/pages.yml  GitHub Pages deploy
```

## Privacy

Everything happens in the browser. Labels, examples and photos are stored in the browser's own storage on that device and in project files the student chooses to save. Photos are centre-cropped and shrunk to 160 pixels. Nothing is sent anywhere.

## How the brains work (short version)

Both brains see a dance as a list of simple facts: how many times each move appears, which move comes straight after which, the first move, the last move and the length. They cannot see anything else, which is itself a good discussion point.

- **Question tree:** repeatedly picks the yes/no question about those facts that best separates the labels, up to 6 questions deep.
- **Look-alike finder:** scores every training dance for similarity (cosine similarity on the same facts), takes the closest 3 and lets them vote.

Because the pairs are included, both brains can notice order, but only for neighbouring moves.
