import React, { createContext, useContext, useReducer, useRef, useCallback, useMemo, useEffect } from 'react';
import { getMission } from '../data/missions';
import { EVIDENCE, CONNECTIONS } from '../data/evidence';
import { validateActivity } from '../lib/validate';
import { loadSave, saveState, clearSave } from './save';

export { DEFAULT_PLAYER, initialState, gameReducer } from './gameReducer';
import { initialState, gameReducer } from './gameReducer';

function initialise(initial) {
  if (initial) return {
    ...initialState,
    ...initial,
    missionSession: initial.missionSession ?? null,
    settings: { ...initialState.settings, ...(initial.settings || {}) },
  };
  const loaded = loadSave();
  if (!loaded) return initialState;
  return {
    ...initialState,
    ...loaded,
    hasSave: true,
    overlay: null,
    transition: null,
    toast: null,
    settings: { ...initialState.settings, ...(loaded.settings || {}) },
  };
}

const Ctx = createContext(null);
export const useGame = () => {
  const value = useContext(Ctx);
  if (!value) throw new Error('useGame must be used inside GameProvider');
  return value;
};

export function GameProvider({ children, initial }) {
  const [state, dispatch] = useReducer(gameReducer, initial, initialise);
  const timers = useRef([]);
  const later = useCallback((fn, ms) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
    return t;
  }, []);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    if (state.hasSave) saveState(state);
    else clearSave();
  }, [state]);

  const go = useCallback((screen, opts = {}) => {
    const { kind = 'iris', missionId } = opts;
    if (kind === 'none' || state.settings.reduceMotion) {
      dispatch({ type: 'SCREEN', screen, missionId });
      return;
    }
    dispatch({ type: 'TRANSITION', transition: { kind } });
    later(() => dispatch({ type: 'SCREEN', screen, missionId }), kind === 'warp' ? 700 : 520);
    later(() => dispatch({ type: 'TRANSITION', transition: null }), kind === 'warp' ? 1500 : 1100);
  }, [later, state.settings.reduceMotion]);

  const notify = useCallback((toast) => {
    const id = Math.random().toString(36).slice(2);
    dispatch({ type: 'TOAST', toast: { id, kind: 'evidence', ...toast } });
    later(() => dispatch({ type: 'TOAST', toast: null }), 3200);
  }, [later]);

  const api = useMemo(() => ({
    state,
    dispatch,
    go,
    notify,
    openOverlay: (overlay) => dispatch({ type: 'OVERLAY', overlay }),
    closeOverlay: () => dispatch({ type: 'OVERLAY', overlay: null }),
    setPlayer: (patch) => dispatch({ type: 'PLAYER', patch }),
    setMissionSession: (patch) => dispatch({ type: 'MISSION_SESSION', missionId: state.activeMissionId, patch }),
    newGame: () => dispatch({ type: 'NEW_GAME' }),
    startMission: (id, kind = 'iris') => {
      const mission = getMission(id);
      if (!mission || (!state.unlocked.includes(id) && !state.completed.includes(id))) {
        notify({ title: 'Case locked', text: 'Finish the earlier investigation to unlock this case.', kind: 'warning' });
        return false;
      }
      dispatch({ type: 'START_MISSION', missionId: id });
      if (kind !== 'none' && !state.settings.reduceMotion) {
        dispatch({ type: 'TRANSITION', transition: { kind } });
        later(() => dispatch({ type: 'TRANSITION', transition: null }), kind === 'warp' ? 1500 : 1100);
      }
      return true;
    },
    collectEvidence: (id) => {
      if (!EVIDENCE.some((item) => item.id === id) || state.evidence.includes(id)) return;
      dispatch({ type: 'COLLECT_EVIDENCE', id });
      const ev = EVIDENCE.find((item) => item.id === id);
      notify({ title: 'Evidence found', text: ev?.title, glyph: ev?.glyph, realm: ev?.realm });
    },
    completeMission: (id) => {
      const mission = getMission(id);
      if (mission && state.missionSession?.status === 'success' && state.activeMissionId === id) {
        dispatch({ type: 'COMPLETE_MISSION', mission });
      }
    },
    submitActivity: (missionId, value) => {
      const mission = getMission(missionId);
      if (!mission) return { ok: false, message: 'This case file could not be found.' };
      return validateActivity({ ...mission.activity, validation: mission.validation || mission.activity.validation }, value);
    },
    tryLink: (a, b) => {
      if (!state.evidence.includes(a) || !state.evidence.includes(b)) return null;
      const c = CONNECTIONS.find((item) => (item.a === a && item.b === b) || (item.a === b && item.b === a));
      if (c && !state.links.includes(c.id)) dispatch({ type: 'LINK', id: c.id });
      return c || null;
    },
  }), [state, go, notify, later]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
