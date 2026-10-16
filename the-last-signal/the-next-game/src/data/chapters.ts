export type ChapterId = 'trail' | 'laboratory' | 'factory' | 'control-room' | 'central-system' | 'tower'

export interface ChapterDefinition {
  id: ChapterId
  number: string
  title: string
  shortTitle: string
  subtitle: string
  concept: string
  duration: string
  accent: string
  icon: string
  brief: string
  objective: string
  completion: string
  learning: string
  hints: [string, string, string]
}

export const CHAPTERS: ChapterDefinition[] = [
  {
    id: 'trail', number: '01', title: 'The Overgrown Trail', shortTitle: 'Overgrown Trail', subtitle: 'Make the first move.',
    concept: 'Sequencing · loops · debugging', duration: '8 min', accent: 'moss', icon: 'route',
    brief: 'NOVA has found a path to an abandoned communications hut. The route is simple… until it isn’t.',
    objective: 'Program NOVA to reach the signal marker without bumping into anything.',
    completion: 'NOVA reaches the hut and recovers a field note about the station’s last software update.',
    learning: 'A program is a sequence of precise instructions. Loops repeat instructions without rewriting them.',
    hints: ['Look at where NOVA is facing before choosing a move.', 'Try repeating the same move when the path is straight.', 'Run a few steps at a time. A collision tells you where the plan needs changing.'],
  },
  {
    id: 'laboratory', number: '02', title: 'The Locked Laboratory', shortTitle: 'Locked Laboratory', subtitle: 'The door has rules.',
    concept: 'Variables · Boolean values · conditionals', duration: '10 min', accent: 'blue', icon: 'key',
    brief: 'A security door guards the power records. The terminal keeps asking for proof that NOVA is allowed inside.',
    objective: 'Change NOVA’s state, then satisfy the door’s access condition.',
    completion: 'The laboratory opens. Its logs show that a system update changed how commands were checked.',
    learning: 'A variable stores information. A Boolean is true or false. A condition checks that information before an action happens.',
    hints: ['The card is an item NOVA must actually collect.', 'Read the condition shown at the terminal; every required part must be true.', 'For the advanced lock, check both the access card and the power switch.'],
  },
  {
    id: 'factory', number: '03', title: 'The Battery Factory', shortTitle: 'Battery Factory', subtitle: 'Looks can be misleading.',
    concept: 'Classification · properties · edge cases', duration: '10 min', accent: 'amber', icon: 'battery',
    brief: 'The factory has sorted its batteries by colour. A few faulty cells have slipped into the good pile.',
    objective: 'Choose a rule that separates usable batteries from faulty ones.',
    completion: 'A reliable rule identifies every usable cell, including the ones that do not look the way you expect.',
    learning: 'A rule should use relevant properties, not a shortcut that happens to work on a few examples. Test it on edge cases.',
    hints: ['Inspect charge and damage as well as colour.', 'A high charge does not make a damaged battery safe to use.', 'Try a rule that checks charge and damage together, then test every example.'],
  },
  {
    id: 'control-room', number: '04', title: 'The Broken Control Room', shortTitle: 'Control Room', subtitle: 'Find the bug, not a shortcut.',
    concept: 'Debugging · tracing · conditions', duration: '10 min', accent: 'coral', icon: 'terminal',
    brief: 'The control room is issuing commands in the wrong order. One tiny logic error can keep a whole system offline.',
    objective: 'Repair the program so the relay checks the battery and powers the switch before activation.',
    completion: 'The relay stabilises. The repaired procedure gives the central system the checks it was missing.',
    learning: 'Debugging means tracing what a program actually does, finding the cause, and testing a correction.',
    hints: ['Read the steps in order. The first missing action may explain the failure.', 'The relay needs a battery check and an active switch.', 'Power the switch before checking it, then use AND so both checks must pass.'],
  },
  {
    id: 'central-system', number: '05', title: 'The Central System', shortTitle: 'Central System', subtitle: 'Put the pieces together.',
    concept: 'Planning · state · sequencing · conditionals', duration: '10 min', accent: 'violet', icon: 'core',
    brief: 'The station’s core is almost ready. NOVA must collect the right components and follow a sound repair route.',
    objective: 'Plan a route that collects the access card and battery, activates the switch, and reaches the core.',
    completion: 'The core restarts. The station’s timeline points to an automated update as the source of the failure.',
    learning: 'A plan works when its steps change the real state of the world and satisfy the final conditions.',
    hints: ['The core needs three things: a card, a battery, and an active switch.', 'Items are collected when NOVA moves onto their tile.', 'Plan the route through the card, battery, switch, then the core. Obstacles block direct movement.'],
  },
  {
    id: 'tower', number: '06', title: 'The Communications Tower', shortTitle: 'Communications Tower', subtitle: 'Send the last signal.',
    concept: 'Program tracing · evidence · reflection', duration: '7 min', accent: 'teal', icon: 'signal',
    brief: 'The tower is online, but the final transmission sequence is scrambled. One last procedure stands between the island and the truth.',
    objective: 'Put the transmission steps in a safe order, then inspect the recovered message.',
    completion: 'The signal returns. The station failed because a software update changed the order and logic of its automated repair checks.',
    learning: 'Good engineers test assumptions, use evidence, and explain why a fix works—not just that it works.',
    hints: ['Sending the signal first will not prove the system is ready.', 'Check power before verifying the repairs.', 'The safe order is: check power, verify repairs, then send the signal.'],
  },
]

export const CHAPTER_BY_ID = Object.fromEntries(CHAPTERS.map((chapter) => [chapter.id, chapter])) as Record<ChapterId, ChapterDefinition>
