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

export type Formation = '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2' | '4-2-3-1' | '3-4-3' | '4-5-1' | '4-3-2-1' | '5-4-1';

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

export interface SimPlayer {
  name: string;
  overall: number;
  position: PlayerPosition;
}

export enum Tactic {
  VeryDefensive = 'Muito Defensiva',
  Defensive = 'Defensiva',
  Neutral = 'Neutra',
  Offensive = 'Ofensiva',
  VeryOffensive = 'Muito Ofensiva',
}

export interface SimTeam {
  name: string;
  overall: number;
  players: SimPlayer[];
  chemistry: number;
  formation: string;
  tactic: Tactic;
}

export interface MatchEvent {
  minute: number;
  type: 'goal' | 'shot' | 'foul';
  teamName: string;
  description: string;
  scorer?: string;
}

export interface MatchStats {
  possessionA: number;
  possessionB: number;
  shotsA: number;
  shotsB: number;
  foulsA: number;
  foulsB: number;
}

export interface PenaltyKick {
  teamId: 'A' | 'B';
  kickerName: string;
  kickerOverall: number;
  gkName: string;
  gkOverall: number;
  probability: number;
  isGoal: boolean;
  scoreA: number;
  scoreB: number;
}

export interface PenaltyShootoutResult {
  winnerId: string;
  goalsA: number;
  goalsB: number;
  kicks: PenaltyKick[];
}

export interface MatchResult {
  goalsA: number;
  goalsB: number;
  events: MatchEvent[];
  stats: MatchStats;
  penalties?: PenaltyShootoutResult;
}

export interface UserEliminationStatus {
  eliminatedAt: string;
  standingsPosition?: number;
}
