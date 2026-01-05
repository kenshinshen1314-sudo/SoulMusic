export enum ThemeType {
  RAIN = 'RAIN',
  BIRDS = 'BIRDS',
  WAVES = 'WAVES',
  FIRE = 'FIRE',
  FOREST = 'FOREST'
}

export interface Track {
  id: string;
  title: string;
  src: string; // URL to the audio file
  artworkUrl?: string; // URL to the album artwork
}

export interface ThemeConfig {
  type: ThemeType;
  label: string;
  gradient: string; // Tailwind background gradient classes
  accentColor: string; // Text accent color
  quote: string;
  searchTerm: string; // Term to query iTunes API
}

export type TimerDuration = 15 | 30 | 60 | null; // Minutes, null = infinity