# Teacher guide: Teach the Robot to Dance

**Age:** Years 5-6 in the default **Junior mode**; set `mode: 'full'` in `js/config.js` for Year 7 up to GCSE.
**Time:** Junior: a 15 to 20 minute Training Camp, then a 40 minute lesson. Full: one 45 to 60 minute lesson, or two shorter ones.
**Needs:** one device per pair, any modern browser. No accounts, no installs.

## Learning goals

Students can:
1. Explain that a machine learning system learns from **labelled examples** that people choose.
2. Say why a robot should be tested on dances it has **never studied**.
3. Spot how too few, unbalanced or mislabelled examples cause mistakes.
4. Describe, at their level, how a brain reached a guess (a chain of questions, or "most like these").
5. Compare two different brains fairly.

## Vocabulary

training data, label, example, feature, model ("brain"), prediction, test data ("exam"), accuracy, overfitting ("memorised, not understood"), bias, confusion.

## Years 5-6 quick plan (Junior mode)

1. **Training Camp (15-20 min).** Students open the page and press *Start Training Camp*. The coach walks through every stage and ticks each step off. Pairs can stop after *Was the robot right?* and carry on in the next lesson. Teachers can ask: "What did the robot get wrong, and why?"
2. **Main lesson (40 min).** Pick *Start from a blank slate* (or a pack). Each pair invents two labels, builds 3 or 4 example dances for each, teaches the robot, then tries new dances and runs the Robot quiz.
3. **Plenary.** Which label fooled the robot? What would help it learn? Use the printable `teacher/worksheet-junior.html`.

Junior mode hides the brain choice, Lab and exam tables on purpose. Students meet the same ideas (examples, labels, teaching, testing on unseen dances, mistakes) in simple words. The robot's "look-alike" brain explains itself by showing the example dances it found most similar.

## Lesson outline for Years 7+ (50 minutes)

| Min | Activity | Where |
|---|---|---|
| 0-5 | **Hook.** Show the robot doing three different dances. "How would you tell these apart? How would you teach someone who has never seen them?" | Stage |
| 5-15 | **Design labels.** Pairs invent two or three labels (name, badge, colour, a one-line clue). Or load a pack. | Labels tab |
| 15-25 | **Teach.** Build 4 dances per label and save them as examples. Press Teach the robot. | Moves, Labels |
| 25-35 | **Test.** Invent new dances, ask the robot, reveal what you meant. Collect a mistake and work out why. | Test tab |
| 35-45 | **Fair exam.** Add 2 unseen dances per label to the exam and run it. Change something (more examples, fixed label) and run it again. | Test tab |
| 45-50 | **Plenary.** What did the robot learn that you did not intend? | Lab tab |

Extension: **Brain battle** (switch brain, teach, run the same exam) and **My dancer** (design a character and stage).

## Suggested starting points

- **Younger classes:** `?pack=blank` or `?pack=animals`, set `starterMovesOnly: true`, `showLab: false`, `defaultBrain: 'tree'`.
- **Upper KS2 / KS3:** `?pack=moods`, full moves, Lab tab on.
- **KS4:** `?pack=order` for sequences, then compare both brains and discuss which features each can and cannot see.

## Common misconceptions

| Students say | What is happening | Prompt |
|---|---|---|
| "The robot is just wrong." | The robot only knows what its examples taught it. | "What would you need to show it so it gets this one right?" |
| "It got the training dances right, so it's perfect." | It may have memorised them. | "Now try dances it has never seen." Use *Studied or understood?* |
| "More data is always better." | Wrong or lopsided data can mislead. | Try *The misleading teacher* and *Is the data balanced?* |
| "The robot understands dance." | It counts moves and pairs. | Read *How the robot sees your dance* aloud. |
| "The two brains should give the same answers." | Different methods, different mistakes. | Compare the mix-up tables. |

## Questions to ask while circulating

- What is the clue for your label? Does the robot's version match yours?
- Which dance fooled the robot? Which two labels are most alike?
- If you could add just one example, which would help most?
- Is this exam fair? Were any exam dances also used for training? (The app flags this.)
- Did the order of moves matter? Try *Compare with reversed*.

## Assessment ideas

- Screenshot or write down one mistake and explain it using the Lab tab.
- "Design a new label that the robot will find hard. Predict why. Test it."
- Two scores on the same exam, before and after a change: what changed and why?
- Printable worksheets: `teacher/worksheet-junior.html` (Years 5-6) and `teacher/worksheet.html` (Years 7+).

## Practical notes

- Students' work saves automatically in the browser on that device. Use *Save project file* to move work between devices or to submit it. The brain itself is not saved; teach it again after opening.
- Photos for the dancer's head are optional (`allowPhotos`), shrunk to 160 px and never uploaded.
- Sound is off by default. The speaker button turns it on.
- To reset a shared device between classes: Project tab (Extras in Junior), *Start again from scratch*. To show the Training Camp welcome again, clear the site's data for the page.
- Training Camp swaps in practice labels (Happy and Sleepy). Students' own work is backed up first and can be restored from the last screen.
