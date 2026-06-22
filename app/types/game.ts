export interface PlayerAttributes {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
}

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';

export interface Player {
  id: string;
  name: string;
  overall: number;
  position: PlayerPosition;
  nationality: string;
  club: string;
  attributes: PlayerAttributes;
  price: number;
}

export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2' | '4-2-3-1';

export type PlayStyle = 'attack' | 'defense' | 'balanced';

export interface SquadSlot {
  id: string;
  label: string;
  position: PlayerPosition;
  player: Player | null;
}
