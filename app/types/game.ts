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
export type TeamTier = 'very_good' | 'good' | 'medium' | 'bad';

export interface OpponentTeam {
  id: string;
  name: string;
  tier: TeamTier;
  country: string;
  attackOverall: number;
  defenseOverall: number;
  teamChemistry: number;
  logoColor: string;
}

export interface GroupStandingRow {
  teamId: string;
  name: string;
  logoColor: string;
  country: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface KnockoutMatch {
  id: string;
  teamA: OpponentTeam;
  teamB: OpponentTeam;
  winnerId?: string | null;
  scores?: { home: number; away: number }[];
}

