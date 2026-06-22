import { create } from 'zustand';
import { Player, Formation, PlayStyle, SquadSlot } from '../app/types/game';
import { getSlotsForFormation } from '../utils/formations';
import { canBuyPlayer } from '../utils/pricing';

interface GameStore {
  budget: number;
  formation: Formation;
  playStyle: PlayStyle;
  squad: SquadSlot[];
  isOnboarded: boolean;
  attackOverall: number;
  defenseOverall: number;
  teamChemistry: number;
  setFormation: (formation: Formation) => void;
  setPlayStyle: (playStyle: PlayStyle) => void;
  buyPlayer: (player: Player, slotId: string) => boolean;
  sellPlayer: (slotId: string) => void;
  resetSquad: () => void;
  completeDraft: () => void;
}

function calculateAttackOverall(squad: SquadSlot[], playStyle: PlayStyle): number {
  const active = squad.map(s => s.player).filter((p): p is Player => p !== null);
  if (active.length === 0) return 0;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const p of active) {
    let weight = 0.5;
    if (p.position === 'GK') weight = 0.1;
    else if (p.position === 'DF') weight = 0.3;
    else if (p.position === 'MF') weight = 0.9;
    else if (p.position === 'FW') weight = 1.6;
    weightedSum += p.overall * weight;
    totalWeight += weight;
  }
  let finalAtk = weightedSum / totalWeight;
  if (playStyle === 'attack') finalAtk += 3;
  return Math.min(99, Math.round(finalAtk));
}

function calculateDefenseOverall(squad: SquadSlot[], playStyle: PlayStyle): number {
  const active = squad.map(s => s.player).filter((p): p is Player => p !== null);
  if (active.length === 0) return 0;
  let totalWeight = 0;
  let weightedSum = 0;
  for (const p of active) {
    let weight = 0.5;
    if (p.position === 'GK') weight = 1.6;
    else if (p.position === 'DF') weight = 1.4;
    else if (p.position === 'MF') weight = 0.7;
    else if (p.position === 'FW') weight = 0.1;
    weightedSum += p.overall * weight;
    totalWeight += weight;
  }
  let finalDef = weightedSum / totalWeight;
  if (playStyle === 'defense') finalDef += 3;
  return Math.min(99, Math.round(finalDef));
}

function calculateChemistry(squad: SquadSlot[], formation: Formation, playStyle: PlayStyle): number {
  const active = squad.map(s => s.player).filter((p): p is Player => p !== null);
  if (active.length === 0) return 0;
  let score = 30;
  for (const slot of squad) {
    if (slot.player && slot.player.position === slot.position) {
      score += 30 / 11;
    }
  }
  const clubs: Record<string, number> = {};
  const nations: Record<string, number> = {};
  for (const p of active) {
    clubs[p.club] = (clubs[p.club] || 0) + 1;
    nations[p.nationality] = (nations[p.nationality] || 0) + 1;
  }
  let clubScore = 0;
  for (const c in clubs) {
    const count = clubs[c];
    if (count >= 4) clubScore += 15;
    else if (count === 3) clubScore += 10;
    else if (count === 2) clubScore += 5;
  }
  score += Math.min(35, clubScore);
  let nationScore = 0;
  for (const n in nations) {
    const count = nations[n];
    if (count >= 4) nationScore += 15;
    else if (count === 3) nationScore += 10;
    else if (count === 2) nationScore += 5;
  }
  score += Math.min(35, nationScore);
  if (
    (formation === '4-3-3' && playStyle === 'attack') ||
    (formation === '5-3-2' && playStyle === 'defense') ||
    (formation === '4-4-2' && playStyle === 'balanced')
  ) {
    score += 5;
  }
  return Math.min(100, Math.round(score));
}

export const useGameStore = create<GameStore>((set, get) => ({
  budget: 100000,
  formation: '4-4-2',
  playStyle: 'balanced',
  squad: getSlotsForFormation('4-4-2'),
  isOnboarded: false,
  attackOverall: 0,
  defenseOverall: 0,
  teamChemistry: 0,

  setFormation: (formation) => {
    const { squad, budget } = get();
    const oldPlayers = squad.map(s => s.player).filter((p): p is Player => p !== null);
    const newSlots = getSlotsForFormation(formation);
    let updatedBudget = budget;

    for (const player of oldPlayers) {
      const emptySlot = newSlots.find(s => s.position === player.position && s.player === null);
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
      attackOverall: calculateAttackOverall(newSlots, get().playStyle),
      defenseOverall: calculateDefenseOverall(newSlots, get().playStyle),
      teamChemistry: calculateChemistry(newSlots, formation, get().playStyle),
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
    const isAlreadyInSquad = squad.some(s => s.player?.id === player.id);
    if (isAlreadyInSquad) return false;

    const currentSquadSize = squad.filter(s => s.player !== null).length;
    if (!canBuyPlayer(player.price, currentSquadSize, budget)) return false;

    const newSquad = squad.map(s => {
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
    const slot = squad.find(s => s.id === slotId);
    if (!slot || !slot.player) return;

    const refundedPrice = slot.player.price;
    const newSquad = squad.map(s => {
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
    const isComplete = squad.every(s => s.player !== null);
    if (isComplete) {
      set({ isOnboarded: true });
    }
  },
}));
