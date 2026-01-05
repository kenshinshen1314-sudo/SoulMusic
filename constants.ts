import { ThemeConfig, ThemeType } from './types';

export const THEMES: Record<ThemeType, ThemeConfig> = {
  [ThemeType.RAIN]: {
    type: ThemeType.RAIN,
    label: 'RAIN',
    gradient: 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900',
    accentColor: 'text-slate-200',
    quote: '"Some people feel the rain. Others just get wet."',
    searchTerm: "rain nature sounds sleep",
  },
  [ThemeType.BIRDS]: {
    type: ThemeType.BIRDS,
    label: 'BIRDS',
    gradient: 'bg-gradient-to-b from-sky-700 via-teal-800 to-emerald-900',
    accentColor: 'text-sky-100',
    quote: '"The bird who dares to fall is the bird who learns to fly."',
    searchTerm: "forest bird nature sounds",
  },
  [ThemeType.WAVES]: {
    type: ThemeType.WAVES,
    label: 'WAVES',
    gradient: 'bg-gradient-to-b from-cyan-800 via-blue-900 to-slate-900',
    accentColor: 'text-cyan-100',
    quote: '"You are not a drop in the ocean. You are the ocean in a drop."',
    searchTerm: "ocean waves nature sounds sleep",
  },
  [ThemeType.FIRE]: {
    type: ThemeType.FIRE,
    label: 'FIRE',
    gradient: 'bg-gradient-to-b from-red-900 via-orange-950 to-black',
    accentColor: 'text-orange-100',
    quote: '"From a small spark may burst a flame."',
    searchTerm: "crackling fire nature sounds",
  },
  [ThemeType.FOREST]: {
    type: ThemeType.FOREST,
    label: 'FOREST',
    gradient: 'bg-gradient-to-b from-emerald-800 via-green-900 to-slate-900',
    accentColor: 'text-emerald-100',
    quote: '"Adopt the pace of nature: her secret is patience."',
    searchTerm: "forest night nature sounds",
  }
};