import { StateCreator } from "zustand";
import {
  Player,
  Formation,
  PlayStyle,
  SquadSlot,
  OpponentTeam,
  GroupStandingRow,
  KnockoutMatch,
  MatchResult,
} from "@/types/game";

export interface DraftSlice {
  budget: number;
  formation: Formation;
  playStyle: PlayStyle;
  squad: SquadSlot[];
  isOnboarded: boolean;
  attackOverall: number;
  defenseOverall: number;
  teamChemistry: number;
  teamName: string;
  setTeamName: (name: string) => void;
  setFormation: (formation: Formation) => void;
  setPlayStyle: (playStyle: PlayStyle) => void;
  buyPlayer: (player: Player, slotId: string) => boolean;
  sellPlayer: (slotId: string) => void;
  resetSquad: () => void;
  completeDraft: () => void;
}

export interface TournamentSlice {
  pots: {
    pot1: OpponentTeam[];
    pot2: OpponentTeam[];
    pot3: OpponentTeam[];
    pot4: OpponentTeam[];
  } | null;
  groups: Record<string, OpponentTeam[]> | null;
  isDrawCompleted: boolean;
  groupStandings: Record<string, GroupStandingRow[]> | null;
  isGroupSimulated: boolean;
  currentGroupRound: number;
  knockoutPots: { potA: OpponentTeam[]; potB: OpponentTeam[] } | null;
  knockoutMatches: KnockoutMatch[] | null;
  isKnockoutDrawCompleted: boolean;
  knockoutRound: "R16" | "QF" | "SF" | "F" | "ended";
  qfMatches: KnockoutMatch[] | null;
  sfMatches: KnockoutMatch[] | null;
  fMatch: KnockoutMatch | null;
  champion: OpponentTeam | null;
  matchResults: Record<string, MatchResult>;
  initializePots: (userTeam: OpponentTeam) => void;
  runGroupDraw: () => void;
  resetDraw: () => void;
  simulateGroupStage: () => void;
  runKnockoutDraw: () => void;
  resetKnockoutDraw: () => void;
  preSimulateKnockoutRoundMatches: () => void;
  advanceKnockoutRound: () => void;
  advanceGroupRound: () => void;
  updateGroupStandingsForRound: (round: number) => void;
}

export type GameStore = DraftSlice & TournamentSlice;

export type DraftSliceCreator = StateCreator<GameStore, [], [], DraftSlice>;
export type TournamentSliceCreator = StateCreator<GameStore, [], [], TournamentSlice>;
