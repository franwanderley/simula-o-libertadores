import {
  OpponentTeam,
  GroupStandingRow,
  KnockoutMatch,
  SimTeam,
  Tactic,
} from "@/types/game";
import { opponentTeams } from "../../utils/teams";
import { GROUP_KEYS } from "../../utils/groupKeys";
import { getSimTeamFromOpponent, simulateMatch } from "../../utils/matchSimulator";
import { getMatchRound } from "../../utils/tournament";
import { simulatePenalty } from "../../utils/penaltySimulator";
import { shuffle } from "../../utils/function";
import { TournamentSliceCreator, GameStore } from "./types";

const DEFAULT_POSITION_NAMES: Record<string, string> = {
  gk: "Weverton",
  lb: "Guilherme Arana",
  lwb: "Joaquín Piquerez",
  lcb: "Thiago Silva",
  cb: "Gustavo Gómez",
  rcb: "Fabrício Bruno",
  rb: "Luis Advíncula",
  rwb: "Luis Advíncula",
  lm: "Jhon Arias",
  ldm: "Erick Pulgar",
  cm: "Gerson",
  lcm: "Nicolás De La Cruz",
  rcm: "Rodrigo Garro",
  cam: "G. De Arrascaeta",
  rdm: "Arturo Vidal",
  rm: "Lucas Moura",
  lam: "Thiago Almada",
  ram: "Raphael Veiga",
  ls: "Germán Cano",
  rs: "Hulk",
  lw: "Estêvão",
  st: "Pedro",
  rw: "Luiz Henrique",
  lf: "Jonathan Calleri",
  rf: "Miguel Borja",
};

const getUserSimTeam = (get: () => GameStore): SimTeam => {
  const {
    squad,
    attackOverall,
    defenseOverall,
    teamChemistry,
    formation,
    playStyle,
    teamName,
  } = get();
  const avgOverall = Math.round((attackOverall + defenseOverall) / 2);
  const players = squad.map((slot) => ({
    name: slot.player
      ? slot.player.name
      : DEFAULT_POSITION_NAMES[slot.id.toLowerCase()] || slot.label,
    overall: slot.player ? slot.player.overall : 60,
    position: slot.position,
  }));
  let tactic: Tactic = Tactic.Neutral;
  if (playStyle === "attack") tactic = Tactic.Offensive;
  else if (playStyle === "defense") tactic = Tactic.Defensive;
  return {
    name: teamName || "Seu Time (Draft)",
    overall: avgOverall,
    players,
    chemistry: teamChemistry,
    formation,
    tactic,
  };
};

export const createTournamentSlice: TournamentSliceCreator = (set, get) => ({
  pots: null,
  groups: null,
  isDrawCompleted: false,
  groupStandings: null,
  isGroupSimulated: false,
  currentGroupRound: 0,
  knockoutPots: null,
  knockoutMatches: null,
  isKnockoutDrawCompleted: false,
  knockoutRound: "R16",
  qfMatches: null,
  sfMatches: null,
  fMatch: null,
  champion: null,
  matchResults: {},

  initializePots: (userTeam) => {
    const sameTierIndex = opponentTeams.findIndex(
      (t) => t.tier === userTeam.tier,
    );
    const filteredOpponents =
      sameTierIndex === -1
        ? opponentTeams.slice(0, 31)
        : opponentTeams.filter((_, idx) => idx !== sameTierIndex);
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
      currentGroupRound: 0,
      knockoutPots: null,
      knockoutMatches: null,
      isKnockoutDrawCompleted: false,
    });
  },

  runGroupDraw: () => {
    const { pots } = get();
    if (!pots) return;
    const groupKeys = GROUP_KEYS;
    const groups: Record<string, OpponentTeam[]> = {
      A: [],
      B: [],
      C: [],
      D: [],
      E: [],
      F: [],
      G: [],
      H: [],
    };

    const drawPot = (pot: OpponentTeam[]) => {
      const shuffled = shuffle(pot);
      const unassignedGroups = [...groupKeys];
      for (const team of shuffled) {
        let targetIdx = unassignedGroups.findIndex((gKey) => {
          const groupTeams = groups[gKey];
          return !groupTeams.some((t) => t.country === team.country);
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
      currentGroupRound: 0,
    });
  },

  resetDraw: () => {
    set({
      groups: null,
      isDrawCompleted: false,
      groupStandings: null,
      isGroupSimulated: false,
      currentGroupRound: 0,
      knockoutPots: null,
      knockoutMatches: null,
      isKnockoutDrawCompleted: false,
      knockoutRound: "R16",
      qfMatches: null,
      sfMatches: null,
      fMatch: null,
      champion: null,
      matchResults: {},
    });
  },

  simulateGroupStage: () => {
    const { groups } = get();
    if (!groups) return;
    const results = { ...get().matchResults };
    for (const [gKey, teams] of Object.entries(groups)) {
      for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < teams.length; j++) {
          if (i === j) continue;
          const teamA = teams[i];
          const teamB = teams[j];
          const simTeamA =
            teamA.id === "user_team"
              ? getUserSimTeam(get)
              : getSimTeamFromOpponent(teamA);
          const simTeamB =
            teamB.id === "user_team"
              ? getUserSimTeam(get)
              : getSimTeamFromOpponent(teamB);
          const result = simulateMatch(simTeamA, simTeamB);
          results[`group_${gKey}_${teamA.id}_${teamB.id}`] = result;
        }
      }
    }
    set({
      matchResults: results,
      currentGroupRound: 0,
    });
    get().updateGroupStandingsForRound(0);
  },

  advanceGroupRound: () => {
    const nextRound = get().currentGroupRound + 1;
    set({ currentGroupRound: nextRound });
    get().updateGroupStandingsForRound(nextRound);
    if (nextRound === 6) {
      set({ isGroupSimulated: true });
    }
  },

  updateGroupStandingsForRound: (round: number) => {
    const { groups, matchResults } = get();
    if (!groups) return;
    const standings: Record<string, GroupStandingRow[]> = {};
    for (const [gKey, teams] of Object.entries(groups)) {
      const list: GroupStandingRow[] = teams.map((t) => ({
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
        points: 0,
      }));
      for (let i = 0; i < teams.length; i++) {
        for (let j = 0; j < teams.length; j++) {
          if (i === j) continue;
          const matchRound = getMatchRound(i, j);
          if (matchRound <= round) {
            const teamA = teams[i];
            const teamB = teams[j];
            const result =
              matchResults[`group_${gKey}_${teamA.id}_${teamB.id}`];
            if (result) {
              const rowA = list.find((r) => r.teamId === teamA.id)!;
              const rowB = list.find((r) => r.teamId === teamB.id)!;
              rowA.played += 1;
              rowB.played += 1;
              rowA.goalsFor += result.goalsA;
              rowA.goalsAgainst += result.goalsB;
              rowB.goalsFor += result.goalsB;
              rowB.goalsAgainst += result.goalsA;
              rowA.goalDifference = rowA.goalsFor - rowA.goalsAgainst;
              rowB.goalDifference = rowB.goalsFor - rowB.goalsAgainst;
              if (result.goalsA > result.goalsB) {
                rowA.won += 1;
                rowA.points += 3;
                rowB.lost += 1;
              } else if (result.goalsA < result.goalsB) {
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
        }
      }
      list.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference)
          return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return a.name.localeCompare(b.name);
      });
      standings[gKey] = list;
    }
    if (round === 6) {
      const findOpponentTeam = (id: string): OpponentTeam | null => {
        for (const groupTeams of Object.values(groups)) {
          const found = groupTeams.find((t) => t.id === id);
          if (found) return found;
        }
        return null;
      };
      const firstPlaces: OpponentTeam[] = [];
      const secondPlaces: OpponentTeam[] = [];
      const groupKeys = GROUP_KEYS;
      for (const gKey of groupKeys) {
        const standing = standings[gKey];
        const t1 = findOpponentTeam(standing[0].teamId);
        const t2 = findOpponentTeam(standing[1].teamId);
        if (t1) firstPlaces.push(t1);
        if (t2) secondPlaces.push(t2);
      }
      set({
        groupStandings: standings,
        knockoutPots: { potA: firstPlaces, potB: secondPlaces },
      });
    } else {
      set({ groupStandings: standings });
    }
  },

  runKnockoutDraw: () => {
    const { knockoutPots } = get();
    if (!knockoutPots) return;

    const shuffledA = shuffle(knockoutPots.potA);
    const shuffledB = shuffle(knockoutPots.potB);
    const knockoutMatches: KnockoutMatch[] = [];
    for (let i = 0; i < 8; i++) {
      knockoutMatches.push({
        id: `R16_${i + 1}`,
        teamA: shuffledA[i],
        teamB: shuffledB[i],
        winnerId: null,
      });
    }
    set({
      knockoutMatches,
      isKnockoutDrawCompleted: true,
      knockoutRound: "R16",
      qfMatches: null,
      sfMatches: null,
      fMatch: null,
      champion: null,
    });
  },

  resetKnockoutDraw: () => {
    set({
      knockoutMatches: null,
      isKnockoutDrawCompleted: false,
      knockoutRound: "R16",
      qfMatches: null,
      sfMatches: null,
      fMatch: null,
      champion: null,
      matchResults: {},
    });
  },

  preSimulateKnockoutRoundMatches: () => {
    const {
      knockoutRound,
      knockoutMatches,
      qfMatches,
      sfMatches,
      fMatch,
      matchResults,
    } = get();
    const results = { ...matchResults };

    let currentMatches: KnockoutMatch[] = [];
    if (knockoutRound === "R16" && knockoutMatches) {
      currentMatches = knockoutMatches;
    } else if (knockoutRound === "QF" && qfMatches) {
      currentMatches = qfMatches;
    } else if (knockoutRound === "SF" && sfMatches) {
      currentMatches = sfMatches;
    } else if (knockoutRound === "F" && fMatch) {
      currentMatches = [fMatch];
    }

    for (const m of currentMatches) {
      const simTeamA =
        m.teamA.id === "user_team"
          ? getUserSimTeam(get)
          : getSimTeamFromOpponent(m.teamA);
      const simTeamB =
        m.teamB.id === "user_team"
          ? getUserSimTeam(get)
          : getSimTeamFromOpponent(m.teamB);
      let result = simulateMatch(simTeamA, simTeamB);

      if (result.goalsA === result.goalsB) {
        result = {
          ...result,
          penalties: simulatePenalty(
            simTeamA,
            simTeamB,
            m.teamA.id,
            m.teamB.id,
          ),
        };
      }

      results[m.id] = result;
    }

    set({ matchResults: results });
  },

  advanceKnockoutRound: () => {
    const {
      knockoutRound,
      knockoutMatches,
      qfMatches,
      sfMatches,
      fMatch,
      matchResults,
    } = get();

    const applyMatchResults = (matches: KnockoutMatch[]): KnockoutMatch[] => {
      return matches.map((m) => {
        const result = matchResults[m.id];
        if (!result) return m;

        let winnerId = m.teamA.id;
        if (result.goalsA > result.goalsB) {
          winnerId = m.teamA.id;
        } else if (result.goalsB > result.goalsA) {
          winnerId = m.teamB.id;
        } else {
          if (result.penalties) {
            winnerId = result.penalties.winnerId;
          } else {
            const penEvent = result.events.find((e) => e.minute === 120);
            if (penEvent?.teamName === m.teamB.name) {
              winnerId = m.teamB.id;
            }
          }
        }

        return {
          ...m,
          winnerId,
          scores: [{ home: result.goalsA, away: result.goalsB }],
        };
      });
    };

    if (knockoutRound === "R16" && knockoutMatches) {
      const simulated = applyMatchResults(knockoutMatches);
      const winners = simulated.map((m) => {
        return m.winnerId === m.teamA.id ? m.teamA : m.teamB;
      });
      const qf: KnockoutMatch[] = [];
      for (let i = 0; i < 4; i++) {
        qf.push({
          id: `QF_${i + 1}`,
          teamA: winners[i * 2],
          teamB: winners[i * 2 + 1],
          winnerId: null,
        });
      }
      set({
        knockoutMatches: simulated,
        qfMatches: qf,
        knockoutRound: "QF",
      });
    } else if (knockoutRound === "QF" && qfMatches) {
      const simulated = applyMatchResults(qfMatches);
      const winners = simulated.map((m) => {
        return m.winnerId === m.teamA.id ? m.teamA : m.teamB;
      });
      const sf: KnockoutMatch[] = [];
      for (let i = 0; i < 2; i++) {
        sf.push({
          id: `SF_${i + 1}`,
          teamA: winners[i * 2],
          teamB: winners[i * 2 + 1],
          winnerId: null,
        });
      }
      set({
        qfMatches: simulated,
        sfMatches: sf,
        knockoutRound: "SF",
      });
    } else if (knockoutRound === "SF" && sfMatches) {
      const simulated = applyMatchResults(sfMatches);
      const winners = simulated.map((m) => {
        return m.winnerId === m.teamA.id ? m.teamA : m.teamB;
      });
      const f: KnockoutMatch = {
        id: "F_1",
        teamA: winners[0],
        teamB: winners[1],
        winnerId: null,
      };
      set({
        sfMatches: simulated,
        fMatch: f,
        knockoutRound: "F",
      });
    } else if (knockoutRound === "F" && fMatch) {
      const simulated = applyMatchResults([fMatch])[0];
      const champion =
        simulated.winnerId === simulated.teamA.id
          ? simulated.teamA
          : simulated.teamB;
      set({
        fMatch: simulated,
        champion,
        knockoutRound: "ended",
      });
    }
  },
});
