import { createStore } from './mini.js';
import { save, markComplete } from './save.js';
import { sfx } from './sound.js';
import { react } from '../scenes/Robot.jsx';

// Which screen we are on. (Progress lives in save.js; this is only the "where am I" state.)
export const flow = createStore({ screen: 'title', selected: null, mission: null, launching: null, reward: null });

export const go = (screen, extra = {}) => flow.set({ screen, ...extra });

export function launch(id) {
  sfx('launch');
  flow.set({ launching: id });
}
export function finishMission(id) {
  markComplete(id);
  sfx(id === 'final' ? 'win' : 'unlock');
  react('celebrate', 4000);
  flow.set({ reward: id });
}
export function leaveMission() {
  flow.set({ screen: 'map', mission: null, reward: null, launching: null });
}

export const STORY = {
  earth: { name: 'Earth', title: 'Welcome to Intelligence', emoji: '🌍', intro: 'Your robot has just woken up and knows nothing! Help it learn about the world.', concept: 'Learning from examples' },
  mars: { name: 'Mars', title: 'The Lost Rover', emoji: '🔴', intro: 'A rover is stranded on Mars. Plan a safe route to bring it home.', concept: 'Planning a route' },
  jupiter: { name: 'Jupiter', title: 'The Great Space Rescue', emoji: '🟠', intro: 'Visitors near Jupiter need help. Teach your robot rules so it picks the right help.', concept: 'If this, then that' },
  saturn: { name: 'Saturn', title: 'The Mystery Scanner', emoji: '🪐', intro: 'Strange objects drift through the rings. Train your robot to recognise them!', concept: 'Training and testing' },
  neptune: { name: 'Neptune', title: 'The Unknown Galaxy', emoji: '🔵', intro: 'Mysterious creatures live here and nobody knows their groups. Can the robot find them?', concept: 'Finding groups' },
  final: { name: 'Mystery Ship', title: 'Restore the Galactic Network', emoji: '🛸', intro: 'A giant ship near Neptune is sending strange signals. Use everything you have learned!', concept: 'Putting it all together' },
};
