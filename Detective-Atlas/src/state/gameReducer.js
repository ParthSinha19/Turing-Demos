import { EVIDENCE } from '../data/evidence.js';

export const DEFAULT_PLAYER = {
  name: 'Sam', skin: '#e8b48a', hair: 'short', hairColor: '#2a1d16',
  outfit: 'trench', outfitColor: '#3d6fb6', accessory: 'glasses', gadget: 'magnifier',
};

export const initialState = {
  screen: 'menu', overlay: null, hasSave: false, player: DEFAULT_PLAYER,
  hqLevel: 1, hqJustExpanded: false, activeMissionId: null,
  missionSession: null,
  completed: [], unlocked: ['forest-1'], evidence: [], gadgets: ['magnifier'], concepts: [], discoveries: [],
  characters: ['detective', 'fern'], links: [], storyFlags: [],
  settings: { sound: true, reduceMotion: false, textSpeed: 'normal', bigText: false },
  transition: null, toast: null,
};

const unique = (items) => [...new Set(items.filter(Boolean))];

export function gameReducer(s, a) {
  switch (a.type) {
    case 'SCREEN':
      return { ...s, screen: a.screen, overlay: null, hasSave: s.hasSave || a.screen !== 'menu', activeMissionId: a.missionId ?? s.activeMissionId };
    case 'OVERLAY': return { ...s, overlay: a.overlay };
    case 'PLAYER': return { ...s, player: { ...s.player, ...a.patch }, hasSave: true };
    case 'TRANSITION': return { ...s, transition: a.transition };
    case 'TOAST': return { ...s, toast: a.toast };
    case 'SETTINGS': return { ...s, settings: { ...s.settings, ...a.patch }, hasSave: true };
    case 'NEW_GAME': return { ...initialState, settings: s.settings, hasSave: true };
    case 'FLAG': return s.storyFlags.includes(a.flag) ? s : { ...s, storyFlags: [...s.storyFlags, a.flag], hasSave: true };
    case 'HQ_SEEN': return { ...s, hqJustExpanded: false };
    case 'MISSION_SESSION':
      if (!s.activeMissionId || (a.missionId && a.missionId !== s.activeMissionId)) return s;
      return { ...s, missionSession: { ...(s.missionSession || { missionId: s.activeMissionId }), ...a.patch }, hasSave: true };
    case 'START_MISSION':
      return {
        ...s, screen: 'mission', overlay: null, activeMissionId: a.missionId, hasSave: true,
        missionSession: { missionId: a.missionId, phase: 'intro', value: null, status: 'idle', message: '', hintLevel: 0 },
      };
    case 'COLLECT_EVIDENCE':
      if (!EVIDENCE.some((item) => item.id === a.id) || s.evidence.includes(a.id)) return s;
      return { ...s, evidence: [...s.evidence, a.id], hasSave: true };
    case 'LINK':
      if (s.links.includes(a.id)) return s;
      return { ...s, links: [...s.links, a.id], hasSave: true };
    case 'COMPLETE_MISSION': {
      const m = a.mission;
      if (!m || !s.activeMissionId || s.activeMissionId !== m.id || s.missionSession?.status !== 'success') return s;
      const hq = Math.max(s.hqLevel, m.hqLevelAfter || 1);
      const completed = unique([...s.completed, m.id]);
      const unlocked = unique([...s.unlocked, ...(m.unlocks || [])]);
      const discoveries = s.discoveries.some((d) => d.missionId === m.id)
        ? s.discoveries
        : [...s.discoveries, { id: `d-${m.id}`, missionId: m.id, text: m.discovery }];
      return {
        ...s,
        completed,
        unlocked,
        evidence: unique([...s.evidence, ...(m.evidence || [])]),
        gadgets: unique([...(s.gadgets || ['magnifier']), ...(m.gadgets || [])]),
        concepts: unique([...s.concepts, m.concept, ...(m.concepts || [])]),
        characters: unique([...s.characters, ...(m.meets || [])]),
        discoveries,
        storyFlags: unique([...s.storyFlags, `completed:${m.id}`, ...(m.storyFlags || [])]),
        hqLevel: hq,
        hqJustExpanded: hq > s.hqLevel,
        missionSession: { ...s.missionSession, phase: 'complete', status: 'success' },
        hasSave: true,
      };
    }
    default: return s;
  }
}

