import { create } from 'zustand';
import { Player, Formation, PlayStyle, SquadSlot, OpponentTeam, GroupStandingRow, KnockoutMatch } from '../app/types/game';
import { getSlotsForFormation } from '../utils/formations';
import { canBuyPlayer } from '../utils/pricing';
import { opponentTeams } from '../utils/teams';

interface GameStore {
  budget: number;
  formation: Formation;
  playStyle: PlayStyle;
  squad: SquadSlot[];
  isOnboarded: boolean;
  attackOverall: number;
  defenseOverall: number;
  teamChemistry: number;
  pots: { pot1: OpponentTeam[], pot2: OpponentTeam[], pot3: OpponentTeam[], pot4: OpponentTeam[] } | null;
  groups: Record<string, OpponentTeam[]> | null;
  isDrawCompleted: boolean;
  groupStandings: Record<string, GroupStandingRow[]> | null;
  isGroupSimulated: boolean;
  knockoutPots: { potA: OpponentTeam[], potB: OpponentTeam[] } | null;
  knockoutMatches: KnockoutMatch[] | null;
  isKnockoutDrawCompleted: boolean;
  setFormation: (formation: Formation) => void;
  setPlayStyle: (playStyle: PlayStyle) => void;
  buyPlayer: (player: Player, slotId: string) => boolean;
  sellPlayer: (slotId: string) => void;
  resetSquad: () => void;
  completeDraft: () => void;
  initializePots: (userTeam: OpponentTeam) => void;
  runGroupDraw: () => void;
  resetDraw: () => void;
  simulateGroupStage: () => void;
  runKnockoutDraw: () => void;
  resetKnockoutDraw: () => void;
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
  pots: null,
  groups: null,
  isDrawCompleted: false,
  groupStandings: null,
  isGroupSimulated: false,
  knockoutPots: null,
  knockoutMatches: null,
  isKnockoutDrawCompleted: false,

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

  initializePots: (userTeam) => {
    const sameTierIndex = opponentTeams.findIndex(t => t.tier === userTeam.tier);
    const filteredOpponents = sameTierIndex !== -1
      ? opponentTeams.filter((_, idx) => idx !== sameTierIndex)
      : opponentTeams.slice(0, 31);
    const combined = [userTeam, ...filteredOpponents];
    const sorted = [...combined].sort((a, b) => {
      const avgA = (a.attackOverall + a.defenseOverall) / 2;
      const avgB = (b.attackOverall + b.defenseOverall) / 2;
      return avgB - avgA;
    });
    const pot1 = sorted.slice(0, 8);
    const pot2 = sorted.slice(8, 16);
    const pot3 = sorted.slice(16, 24);
    const pot4 = sorted.slice(24, 32);
    set({
      pots: { pot1, pot2, pot3, pot4 },
      groups: null,
      isDrawCompleted: false,
      groupStandings: null,
      isGroupSimulated: false,
      knockoutPots: null,
      knockoutMatches: null,
      isKnockoutDrawCompleted: false,
    });
  },

  runGroupDraw: () => {
    const { pots } = get();
    if (!pots) return;
    const groupKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const groups: Record<string, OpponentTeam[]> = {
      A: [], B: [], C: [], D: [], E: [], F: [], G: [], H: []
    };
    const shuffle = <T>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    const drawPot = (pot: OpponentTeam[]) => {
      const shuffled = shuffle(pot);
      const unassignedGroups = [...groupKeys];
      for (const team of shuffled) {
        let targetIdx = unassignedGroups.findIndex(gKey => {
          const groupTeams = groups[gKey];
          return !groupTeams.some(t => t.country === team.country);
        });
        if (targetIdx === -1) {
          targetIdx = 0;
        }
        const gKey = unassignedGroups[targetIdx];
        groups[gKey].push(team);
        unassignedGroups.splice(targetIdx, 1);
      }
    };
    drawPot(pots.pot1);
    drawPot(pots.pot2);
    drawPot(pots.pot3);
    drawPot(pots.pot4);
    set({
      groups,
      isDrawCompleted: true,
    });
  },

  resetDraw: () => {
    set({
      groups: null,
      isDrawCompleted: false,
      groupStandings: null,
      isGroupSimulated: false,
      knockoutPots: null,
      knockoutMatches: null,
      isKnockoutDrawCompleted: false,
    });
  },

  simulateGroupStage: () => {
    const { groups } = get();
    if (!groups) return;
    const standings: Record<string, GroupStandingRow[]> = {};
    for (const [gKey, teams] of Object.entries(groups)) {
      standings[gKey] = teams.map(t => ({
        teamId: t.id,
        name: t.name,
        logoColor: t.logoColor,
        country: t.country,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0
      }));
    }
    const getGoals = (lambda: number) => {
      const L = Math.exp(-lambda);
      let k = 0;
      let p = 1;
      do {
        k++;
        p *= Math.random();
      } while (p > L && k < 10);
      return k - 1;
    };
    for (const [gKey, teams] of Object.entries(groups)) {
      const list = standings[gKey];
      for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < teams.length; j++) {
          if (i === j) continue;
          const teamA = teams[i];
          const teamB = teams[j];
          const powerA = (teamA.attackOverall * 0.6 + teamA.defenseOverall * 0.4) + (teamA.teamChemistry * 0.1) + 2;
          const powerB = (teamB.attackOverall * 0.6 + teamB.defenseOverall * 0.4) + (teamB.teamChemistry * 0.1);
          const lambdaA = Math.max(0.5, (powerA - powerB) / 10 + 1.5);
          const lambdaB = Math.max(0.5, (powerB - powerA) / 10 + 1.2);
          const goalsA = getGoals(lambdaA);
          const goalsB = getGoals(lambdaB);
          const rowA = list.find(r => r.teamId === teamA.id)!;
          const rowB = list.find(r => r.teamId === teamB.id)!;
          rowA.played += 1;
          rowB.played += 1;
          rowA.goalsFor += goalsA;
          rowA.goalsAgainst += goalsB;
          rowB.goalsFor += goalsB;
          rowB.goalsAgainst += goalsA;
          rowA.goalDifference = rowA.goalsFor - rowA.goalsAgainst;
          rowB.goalDifference = rowB.goalsFor - rowB.goalsAgainst;
          if (goalsA > goalsB) {
            rowA.won += 1;
            rowA.points += 3;
            rowB.lost += 1;
          } else if (goalsA < goalsB) {
            rowB.won += 1;
            rowB.points += 3;
            rowA.lost += 1;
          } else {
            rowA.drawn += 1;
            rowA.points += 1;
            rowB.drawn += 1;
            rowB.points += 1;
          }
        }
      }
      list.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.name.localeCompare(b.name);
      });
    }
    const findOpponentTeam = (id: string): OpponentTeam | null => {
      for (const groupTeams of Object.values(groups)) {
        const found = groupTeams.find(t => t.id === id);
        if (found) return found;
      }
      return null;
    };
    const firstPlaces: OpponentTeam[] = [];
    const secondPlaces: OpponentTeam[] = [];
    const groupKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    for (const gKey of groupKeys) {
      const standing = standings[gKey];
      const t1 = findOpponentTeam(standing[0].teamId);
      const t2 = findOpponentTeam(standing[1].teamId);
      if (t1) firstPlaces.push(t1);
      if (t2) secondPlaces.push(t2);
    }
    set({
      groupStandings: standings,
      isGroupSimulated: true,
      knockoutPots: { potA: firstPlaces, potB: secondPlaces },
      knockoutMatches: null,
      isKnockoutDrawCompleted: false,
    });
  },

  runKnockoutDraw: () => {
    const { knockoutPots } = get();
    if (!knockoutPots) return;
    const shuffle = <T>(arr: T[]): T[] => {
      const copy = [...arr];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    const shuffledA = shuffle(knockoutPots.potA);
    const shuffledB = shuffle(knockoutPots.potB);
    const knockoutMatches: KnockoutMatch[] = [];
    for (let i = 0; i < 8; i++) {
      knockoutMatches.push({
        id: `R16_${i + 1}`,
        teamA: shuffledA[i],
        teamB: shuffledB[i],
        winnerId: null
      });
    }
    set({
      knockoutMatches,
      isKnockoutDrawCompleted: true,
    });
  },

  resetKnockoutDraw: () => {
    set({
      knockoutMatches: null,
      isKnockoutDrawCompleted: false,
    });
  },
}));
