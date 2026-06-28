import { create } from "zustand";
import { GameStore } from "./useGameStore/types";
import { createDraftSlice } from "./useGameStore/draftSlice";
import { createTournamentSlice } from "./useGameStore/tournamentSlice";

export const useGameStore = create<GameStore>((set, get, store) => ({
  ...createDraftSlice(set, get, store),
  ...createTournamentSlice(set, get, store),
}));

export type { GameStore };
