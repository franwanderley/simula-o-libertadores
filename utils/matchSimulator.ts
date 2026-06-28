import {
  PlayerPosition,
  SimPlayer,
  SimTeam,
  MatchEvent,
  MatchResult,
  Tactic,
} from "@/types/game";
import { FORMATIONS, FORMATION_POSITIONS } from "./formations";
import { goalTemplates, shotTemplates, foulTemplates } from "./matchNarratives";
import { SURNAMES } from "./constants";

function getPositionsFromFormation(formation: string): PlayerPosition[] {
  return FORMATION_POSITIONS[formation] || FORMATION_POSITIONS["4-4-2"];
}

export function getSimTeamFromOpponent(opponent: {
  name: string;
  attackOverall: number;
  defenseOverall: number;
  teamChemistry: number;
  tier: "very_good" | "good" | "medium" | "bad";
}): SimTeam {
  const avgOverall = Math.round(
    (opponent.attackOverall + opponent.defenseOverall) / 2,
  );

  let randomVal = 0;
  for (let i = 0; i < opponent.name.length; i++) {
    randomVal += opponent.name.codePointAt(i) || 0;
  }

  const formation = FORMATIONS[randomVal % FORMATIONS.length];

  let tactic: Tactic;
  if (opponent.tier === "very_good") {
    tactic = randomVal % 2 === 0 ? Tactic.Offensive : Tactic.VeryOffensive;
  } else if (opponent.tier === "good") {
    tactic = randomVal % 2 === 0 ? Tactic.Offensive : Tactic.Neutral;
  } else if (opponent.tier === "medium") {
    tactic = Tactic.Neutral;
  } else {
    tactic = randomVal % 2 === 0 ? Tactic.Defensive : Tactic.VeryDefensive;
  }

  const players: SimPlayer[] = [];
  const positions = getPositionsFromFormation(formation);
  const teamSurnames = [...SURNAMES].sort((a, b) => {
    const codeA = (a.codePointAt(0) || 0) + (opponent.name.codePointAt(0) || 0);
    const codeB = (b.codePointAt(0) || 0) + (opponent.name.codePointAt(1) || 0);
    return (codeA % 10) - (codeB % 10);
  });

  for (let i = 0; i < 11; i++) {
    const pos = positions[i];
    const name = teamSurnames[i] || `Jogador ${i + 1}`;
    let baseOvr = avgOverall;
    if (pos === "GK" || pos === "DF") {
      baseOvr = opponent.defenseOverall;
    } else if (pos === "FW") {
      baseOvr = opponent.attackOverall;
    }
    const variation = ((randomVal + i) % 7) - 3;
    const finalOvr = Math.min(99, Math.max(50, baseOvr + variation));
    players.push({
      name,
      overall: finalOvr,
      position: pos,
    });
  }

  return {
    name: opponent.name,
    overall: avgOverall,
    players,
    chemistry: opponent.teamChemistry,
    formation,
    tactic,
  };
}

function getTacticCoefficients(tactic: Tactic) {
  switch (tactic) {
    case Tactic.VeryDefensive:
      return { atk: 0.6, def: 1.4 };
    case Tactic.Defensive:
      return { atk: 0.8, def: 1.2 };
    case Tactic.Offensive:
      return { atk: 1.2, def: 0.8 };
    case Tactic.VeryOffensive:
      return { atk: 1.4, def: 0.6 };
    case Tactic.Neutral:
    default:
      return { atk: 1, def: 1 };
  }
}

function getFormationCoefficients(formation: string) {
  switch (formation) {
    case "3-4-3":
      return { atk: 1.1, def: 0.9 };
    case "4-3-3":
      return { atk: 1.05, def: 0.95 };
    case "3-5-2":
      return { atk: 1.05, def: 0.95 };
    case "4-3-2-1":
      return { atk: 1.05, def: 0.95 };
    case "4-5-1":
      return { atk: 0.95, def: 1.05 };
    case "5-3-2":
      return { atk: 0.9, def: 1.1 };
    case "5-4-1":
      return { atk: 0.85, def: 1.15 };
    case "4-4-2":
    case "4-2-3-1":
    default:
      return { atk: 1, def: 1 };
  }
}

function generateGoalDescription(player: string): string {
  const t = goalTemplates[Math.floor(Math.random() * goalTemplates.length)];
  return t.replace("{player}", player);
}

function generateShotDescription(player: string): string {
  const t = shotTemplates[Math.floor(Math.random() * shotTemplates.length)];
  return t.replace("{player}", player);
}

function generateFoulDescription(player: string): string {
  const t = foulTemplates[Math.floor(Math.random() * foulTemplates.length)];
  return t.replace("{player}", player);
}

function chooseScorer(team: SimTeam): string {
  const playerWeights = team.players.map((player) => {
    let posWeight = 1;
    if (player.position === "GK") posWeight = 0.01;
    else if (player.position === "DF") posWeight = 0.15;
    else if (player.position === "MF") posWeight = 0.5;
    else if (player.position === "FW") posWeight = 1.2;
    return {
      name: player.name,
      weight: posWeight * player.overall,
    };
  });

  const totalWeight = playerWeights.reduce((acc, p) => acc + p.weight, 0);
  let r = Math.random() * totalWeight;
  for (const p of playerWeights) {
    r -= p.weight;
    if (r <= 0) {
      return p.name;
    }
  }
  return team.players[0]?.name || "Jogador";
}

function chooseFouler(team: SimTeam): string {
  const playerWeights = team.players.map((player) => {
    let posWeight = 1;
    if (player.position === "GK") posWeight = 0.05;
    else if (player.position === "DF") posWeight = 1.5;
    else if (player.position === "MF") posWeight = 1.2;
    else if (player.position === "FW") posWeight = 0.5;
    return {
      name: player.name,
      weight: posWeight * (100 - player.overall + 10),
    };
  });
  const totalWeight = playerWeights.reduce((acc, p) => acc + p.weight, 0);
  let r = Math.random() * totalWeight;
  for (const p of playerWeights) {
    r -= p.weight;
    if (r <= 0) {
      return p.name;
    }
  }
  return team.players[0]?.name || "Jogador";
}

function processChance(
  isTeamAChance: boolean,
  tacticA: { atk: number; def: number },
  tacticB: { atk: number; def: number },
  teamA: SimTeam,
  teamB: SimTeam,
  min: number,
): { goal: boolean; event?: MatchEvent } {
  const formA = getFormationCoefficients(teamA.formation);
  const formB = getFormationCoefficients(teamB.formation);
  const effectiveOvrA = teamA.overall * (0.9 + (teamA.chemistry / 100) * 0.2);
  const effectiveOvrB = teamB.overall * (0.9 + (teamB.chemistry / 100) * 0.2);

  const finalAtkA = effectiveOvrA * tacticA.atk * formA.atk;
  const finalDefA = effectiveOvrA * tacticA.def * formA.def;

  const finalAtkB = effectiveOvrB * tacticB.atk * formB.atk;
  const finalDefB = effectiveOvrB * tacticB.def * formB.def;
  const rngFactor = Math.random() * 30 - 15;
  const attack = isTeamAChance ? finalAtkA : finalAtkB;
  const defense = isTeamAChance ? finalDefB : finalDefA;
  const scoreProb = Math.min(
    0.8,
    Math.max(0.05, (attack - defense + rngFactor + 10) / 100),
  );

  if (Math.random() < scoreProb) {
    const scoringTeam = isTeamAChance ? teamA : teamB;
    const scorer = chooseScorer(scoringTeam);
    return {
      goal: true,
      event: {
        minute: min,
        type: "goal",
        scorer,
        teamName: scoringTeam.name,
        description: generateGoalDescription(scorer),
      },
    };
  }
  return { goal: false };
}

export function simulateMatch(teamA: SimTeam, teamB: SimTeam): MatchResult {
  const tacticA = getTacticCoefficients(teamA.tactic);
  const tacticB = getTacticCoefficients(teamB.tactic);

  const getMidfieldStrength = (team: SimTeam) => {
    const midfielders = team.players.filter((p) => p.position === "MF");
    if (midfielders.length === 0) return team.overall;
    const sum = midfielders.reduce((acc, p) => acc + p.overall, 0);
    return sum / midfielders.length;
  };

  const midStrengthA = getMidfieldStrength(teamA);
  const midStrengthB = getMidfieldStrength(teamB);

  const midfieldTotal = midStrengthA + midStrengthB;
  const basePossessionA = (midStrengthA / midfieldTotal) * 100;

  const tacticPossessionDiff = (tacticA.atk - tacticB.atk) * 5;
  const rngPossession = Math.random() * 6 - 3;
  const finalPossessionA = Math.min(
    65,
    Math.max(
      35,
      Math.round(basePossessionA + tacticPossessionDiff + rngPossession),
    ),
  );
  const finalPossessionB = 100 - finalPossessionA;

  const events: MatchEvent[] = [];
  let goalsA = 0;
  let goalsB = 0;
  let shotsA = 0;
  let shotsB = 0;
  let foulsA = 0;
  let foulsB = 0;

  for (let min = 1; min <= 90; min++) {
    if (Math.random() < 0.08) {
      const isTeamAChance = Math.random() < finalPossessionA / 100;
      if (isTeamAChance) {
        shotsA++;
      } else {
        shotsB++;
      }
      const res = processChance(
        isTeamAChance,
        tacticA,
        tacticB,
        teamA,
        teamB,
        min,
      );
      if (res.goal && res.event) {
        if (isTeamAChance) {
          goalsA++;
        } else {
          goalsB++;
        }
        events.push(res.event);
      } else {
        const shooterTeam = isTeamAChance ? teamA : teamB;
        const shooterName = chooseScorer(shooterTeam);
        events.push({
          minute: min,
          type: "shot",
          teamName: shooterTeam.name,
          scorer: shooterName,
          description: generateShotDescription(shooterName),
        });
      }
    }

    if (Math.random() < 0.12) {
      const isTeamAFoul = Math.random() < 0.5;
      const foulerTeam = isTeamAFoul ? teamA : teamB;
      const foulerName = chooseFouler(foulerTeam);
      if (isTeamAFoul) {
        foulsA++;
      } else {
        foulsB++;
      }
      events.push({
        minute: min,
        type: "foul",
        teamName: foulerTeam.name,
        scorer: foulerName,
        description: generateFoulDescription(foulerName),
      });
    }
  }

  events.sort((a, b) => a.minute - b.minute);

  return {
    goalsA,
    goalsB,
    events,
    stats: {
      possessionA: finalPossessionA,
      possessionB: finalPossessionB,
      shotsA,
      shotsB,
      foulsA,
      foulsB,
    },
  };
}
