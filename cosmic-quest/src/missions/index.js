import { lazy } from 'react';

// Each mission is its own lazily-loaded chunk exporting a 3D `Scene` and an HTML `UI`.
// To add a mission: create src/missions/Name.jsx, then register it here and in game/flow.js (STORY).
const loaders = {
  earth: () => import('./Earth.jsx'),
  mars: () => import('./Mars.jsx'),
  jupiter: () => import('./Jupiter.jsx'),
  saturn: () => import('./Saturn.jsx'),
  neptune: () => import('./Neptune.jsx'),
  final: () => import('./Final.jsx'),
};
export const SCENES = {};
export const UIS = {};
Object.entries(loaders).forEach(([id, load]) => {
  SCENES[id] = lazy(() => load().then((m) => ({ default: m.Scene })));
  UIS[id] = lazy(() => load().then((m) => ({ default: m.UI })));
});
