import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Feather, PawPrint, Cog, Cpu, Leaf, Gem, SatelliteDish, Globe, Activity, Eye, Droplet, TreePine, Star, Moon, Rocket, Radio, Bug, Orbit, Snowflake, Mountain, Flame, HelpCircle } from 'lucide-react';

const MAP = { feather: Feather, paw: PawPrint, cog: Cog, cpu: Cpu, leaf: Leaf, gem: Gem, satellite: SatelliteDish, globe: Globe, activity: Activity, eye: Eye, droplet: Droplet, treepine: TreePine, star: Star, moon: Moon, rocket: Rocket, radio: Radio, bug: Bug, orbit: Orbit, snowflake: Snowflake, mountain: Mountain, flame: Flame };

Object.assign(MAP, { shield: Shield, shieldalert: ShieldAlert, shieldcheck: ShieldCheck });
// <Glyph name="feather" size={24} />  — one place to swap icon sets.
export default function Glyph({ name, size = 22, ...rest }) {
  const Icon = MAP[name] || HelpCircle;
  return <Icon size={size} strokeWidth={1.8} {...rest} />;
}
