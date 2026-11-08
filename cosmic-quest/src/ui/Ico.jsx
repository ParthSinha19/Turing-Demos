import { isValidElement } from 'react';
import {
  Rocket, Apple, PawPrint, Blocks, Gem, Mountain, Leaf, Satellite, Palette, Ruler, Eye, Footprints, RadioTower,
  Globe, Circle, Orbit, Radar, Wind, Wrench, Utensils, Smile, Droplets, Hammer, Hand, Feather, BicepsFlexed, Medal,
  Camera, Compass, Brain, Telescope, TreePine, Pointer, Sparkles, Activity, Bot, Search, ArrowRight, CircleCheck,
  CircleX, Flag, Shield, Zap, RotateCcw, RotateCw, Magnet, Network, Puzzle, Play, Ghost, User, MessageCircle,
  ArrowUp, ArrowDown, Trash2, Undo2, Star, SquareCheck, Snowflake, Dumbbell, FlaskConical, Tag, Plus, House, Dices,
  PartyPopper, Frown, Lock, X, Printer, Check, VolumeX, Volume2, Speech, Turtle, Target, CircleQuestionMark, Hexagon, ArrowUpDown,
} from 'lucide-react';

// Emoji -> line icon. Game data still stores emoji; this only changes how they are drawn.
const MAP = {
  '🚀': [Rocket], '🍎': [Apple], '🐾': [PawPrint], '🧸': [Blocks], '💎': [Gem], '🪨': [Mountain], '🌿': [Leaf],
  '🛰': [Satellite], '🎨': [Palette], '📏': [Ruler], '👁': [Eye], '🦵': [Footprints], '📡': [RadioTower], '🔷': [Hexagon],
  '🌍': [Globe, '#4cc9f0'], '🔴': [Circle, '#ff6b4a', true], '🟠': [Circle, '#ffa24a', true], '🪐': [Orbit, '#ffd166'],
  '🔵': [Circle, '#4c8bff', true], '🛸': [Radar], '😮‍💨': [Wind], '🔧': [Wrench], '😋': [Utensils], '😊': [Smile],
  '🫧': [Droplets], '🧰': [Hammer], '👋': [Hand], '🪽': [Feather], '🦾': [BicepsFlexed], '🏅': [Medal], '📷': [Camera],
  '🧭': [Compass], '🧠': [Brain], '🔭': [Telescope], '🌳': [TreePine], '👆': [Pointer], '🔮': [Sparkles], '🏃': [Activity],
  '🤖': [Bot], '🔎': [Search], '🔍': [Search], '➜': [ArrowRight], '➡': [ArrowRight], '→': [ArrowRight],
  '✅': [CircleCheck, '#3ddc84'], '❌': [CircleX, '#ff6b6b'], '🏁': [Flag], '😌': [Smile], '🛡': [Shield], '💥': [Zap],
  '🔁': [RotateCcw], '🧲': [Magnet], '🌐': [Network], '🧩': [Puzzle], '▶': [Play], '👽': [Ghost], '🧑‍🚀': [User],
  '🤔': [MessageCircle], '⬆': [ArrowUp], '⬇': [ArrowDown], '👇': [ArrowDown], '↺': [RotateCcw], '↻': [RotateCw],
  '✨': [Sparkles], '🗑': [Trash2], '↩': [Undo2], '⭐': [Star, '#ffd166', true], '☆': [Star], '☑': [SquareCheck],
  '🧊': [Snowflake], '🏋': [Dumbbell], '🧪': [FlaskConical], '🏷': [Tag], '➕': [Plus], '🏠': [House], '🎲': [Dices],
  '🎉': [PartyPopper], '😬': [Frown], '🔒': [Lock], '✕': [X], '🖨': [Printer], '✓': [Check], '🔇': [VolumeX],
  '🔊': [Volume2], '🗣': [Speech], '🐢': [Turtle], '🎯': [Target], '❓': [CircleQuestionMark], '↕': [ArrowUpDown],
};

const clean = (e) => String(e).replace(/\uFE0F/g, '').trim();

export function Ico({ e, size = '1.1em', className = '' }) {
  if (e == null || e === '') return null;
  if (isValidElement(e)) return e;
  const hit = MAP[clean(e)];
  if (!hit) return <span className={`ico ${className}`}>{e}</span>;
  const [C, color, fill] = hit;
  return (
    <C className={`ico ${className}`} size={size} strokeWidth={2.2} aria-hidden="true"
      style={color ? { color } : undefined} fill={fill ? 'currentColor' : 'none'} />
  );
}

export const stripEmoji = (s) => String(s).replace(EMOJI_RE, '').replace(/\s{2,}/g, ' ').trim();
export const EMOJI_RE = /(?:🧑‍🚀|😮‍💨|[\u{1F300}-\u{1FAFF}\u2600-\u27BF\u2B50\u2B06\u2B07\u2190-\u21FF\u2705\u274C\u25B6\u2714\u2716\u2713\u2715])\uFE0F?/gu;
