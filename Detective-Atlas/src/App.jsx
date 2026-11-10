import React from 'react';
import { useGame } from './state/GameContext';
import MainMenu from './screens/MainMenu';
import Customise from './screens/Customise';
import Headquarters from './screens/Headquarters';
import MissionScreen from './screens/MissionScreen';
import Cinematic from './screens/Cinematic';
import { MapOverlay, BoardOverlay, NotebookOverlay, WorkshopOverlay, SettingsOverlay } from './screens/Overlays';
import TransitionLayer from './components/Transition';
import { ToastLayer } from './components/Feedback';
import Intro from './screens/Intro';
import { SafetyCodeOverlay } from './screens/SafetyCode';

const SCREENS = { menu: MainMenu, customise: Customise, hq: Headquarters, mission: MissionScreen, cinematic: Cinematic, intro: Intro };
const OVERLAYS = { map: MapOverlay, board: BoardOverlay, notebook: NotebookOverlay, workshop: WorkshopOverlay, settings: SettingsOverlay, code: SafetyCodeOverlay };

export default function App() {
  const { state } = useGame();
  const Screen = SCREENS[state.screen];
  const Ov = state.overlay ? OVERLAYS[state.overlay] : null;
  return (
    <div className="app" data-reduce-motion={state.settings.reduceMotion} data-big-text={state.settings.bigText}>
      <Screen key={state.screen === 'mission' ? `m-${state.activeMissionId}` : state.screen} />
      {Ov && <Ov />}
      <ToastLayer />
      <TransitionLayer />
    </div>
  );
}
