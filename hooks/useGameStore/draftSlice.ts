import { Player } from "@/types/game";
import { getSlotsForFormation } from "../../utils/formations";
import { canBuyPlayer } from "../../utils/pricing";
import {
  calculateAttackOverall,
  calculateDefenseOverall,
  calculateChemistry,
} from "../../utils/function";
import { DraftSliceCreator } from "./types";

export const createDraftSlice: DraftSliceCreator = (set, get) => ({
  budget: 100000,
  formation: "4-4-2",
  playStyle: "balanced",
  squad: getSlotsForFormation("4-4-2"),
  isOnboarded: false,
  attackOverall: 0,
  defenseOverall: 0,
  teamChemistry: 0,
  teamName: "Seu Time (Draft)",

  setTeamName: (name) => set({ teamName: name }),

  setFormation: (formation) => {
    const { squad, budget, playStyle } = get();
    const oldPlayers = squad
      .map((s) => s.player)
      .filter((p): p is Player => p !== null);
    const newSlots = getSlotsForFormation(formation);
    let updatedBudget = budget;

    for (const player of oldPlayers) {
      const emptySlot = newSlots.find(
        (s) => s.position === player.position && s.player === null,
      );
      if (emptySlot) {
        emptySlot.player = player;
      } else {
        updatedBudget += player.price;
      }
    }

    set({
      formation,
      squad: newSlots,
      budget: updatedBudget,
      attackOverall: calculateAttackOverall(newSlots, playStyle),
      defenseOverall: calculateDefenseOverall(newSlots, playStyle),
      teamChemistry: calculateChemistry(newSlots, formation, playStyle),
    });
  },

  setPlayStyle: (playStyle) => {
    const { squad, formation } = get();
    set({
      playStyle,
      attackOverall: calculateAttackOverall(squad, playStyle),
      defenseOverall: calculateDefenseOverall(squad, playStyle),
      teamChemistry: calculateChemistry(squad, formation, playStyle),
    });
  },

  buyPlayer: (player, slotId) => {
    const { squad, budget, formation, playStyle } = get();
    const isAlreadyInSquad = squad.some((s) => s.player?.id === player.id);
    if (isAlreadyInSquad) return false;

    const currentSquadSize = squad.filter((s) => s.player !== null).length;
    if (!canBuyPlayer(player.price, currentSquadSize, budget)) return false;

    const newSquad = squad.map((s) => {
      if (s.id === slotId) {
        return { ...s, player };
      }
      return s;
    });

    set({
      squad: newSquad,
      budget: budget - player.price,
      attackOverall: calculateAttackOverall(newSquad, playStyle),
      defenseOverall: calculateDefenseOverall(newSquad, playStyle),
      teamChemistry: calculateChemistry(newSquad, formation, playStyle),
    });
    return true;
  },

  sellPlayer: (slotId) => {
    const { squad, budget, formation, playStyle } = get();
    const slot = squad.find((s) => s.id === slotId);
    if (!slot?.player) return;

    const refundedPrice = slot.player.price;
    const newSquad = squad.map((s) => {
      if (s.id === slotId) {
        return { ...s, player: null };
      }
      return s;
    });

    set({
      squad: newSquad,
      budget: budget + refundedPrice,
      attackOverall: calculateAttackOverall(newSquad, playStyle),
      defenseOverall: calculateDefenseOverall(newSquad, playStyle),
      teamChemistry: calculateChemistry(newSquad, formation, playStyle),
    });
  },

  resetSquad: () => {
    const { formation } = get();
    const newSquad = getSlotsForFormation(formation);
    set({
      budget: 100000,
      squad: newSquad,
      attackOverall: 0,
      defenseOverall: 0,
      teamChemistry: 0,
    });
  },

  completeDraft: () => {
    const { squad } = get();
    const isComplete = squad.every((s) => s.player !== null);
    if (isComplete) {
      set({ isOnboarded: true });
    }
  },
});
