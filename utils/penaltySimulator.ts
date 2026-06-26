import { SimTeam, PenaltyKick, PenaltyShootoutResult } from '@/types/game';

export function simulatePenalty(
  teamA: SimTeam,
  teamB: SimTeam,
  teamAId: string,
  teamBId: string,
): PenaltyShootoutResult {
  const gkA = teamA.players.find((p) => p.position === "GK") || {
    name: "Goleiro",
    overall: 60,
  };
  const gkB = teamB.players.find((p) => p.position === "GK") || {
    name: "Goleiro",
    overall: 60,
  };

  const kickersA = teamA.players
    .filter((p) => p.position !== "GK")
    .sort((a, b) => b.overall - a.overall);

  const kickersB = teamB.players
    .filter((p) => p.position !== "GK")
    .sort((a, b) => b.overall - a.overall);

  const kicks: PenaltyKick[] = [];
  let scoreA = 0;
  let scoreB = 0;
  let kicksTakenA = 0;
  let kicksTakenB = 0;
  let isFinished = false;
  let winnerId = "";

  const runKick = (teamId: "A" | "B"): PenaltyKick => {
    const isTeamA = teamId === "A";
    const kickerList = isTeamA ? kickersA : kickersB;
    const kickIndex = isTeamA ? kicksTakenA : kicksTakenB;
    const gk = isTeamA ? gkB : gkA;

    const kicker = kickerList[kickIndex % kickerList.length] || {
      name: "Jogador",
      overall: 60,
    };
    const prob = Math.min(95, Math.max(10, 75 + (kicker.overall - gk.overall)));
    const isGoal = Math.random() * 100 < prob;

    if (isTeamA) {
      kicksTakenA++;
      if (isGoal) scoreA++;
    } else {
      kicksTakenB++;
      if (isGoal) scoreB++;
    }

    return {
      teamId,
      kickerName: kicker.name,
      kickerOverall: kicker.overall,
      gkName: gk.name,
      gkOverall: gk.overall,
      probability: prob,
      isGoal,
      scoreA,
      scoreB,
    };
  };

  for (let round = 1; round <= 5; round++) {
    const kickA = runKick("A");
    kicks.push(kickA);

    if (scoreA > scoreB + (5 - kicksTakenB)) {
      winnerId = teamAId;
      isFinished = true;
      break;
    }
    if (scoreB > scoreA + (5 - kicksTakenA)) {
      winnerId = teamBId;
      isFinished = true;
      break;
    }

    const kickB = runKick("B");
    kicks.push(kickB);

    if (scoreA > scoreB + (5 - kicksTakenB)) {
      winnerId = teamAId;
      isFinished = true;
      break;
    }
    if (scoreB > scoreA + (5 - kicksTakenA)) {
      winnerId = teamBId;
      isFinished = true;
      break;
    }
  }

  if (!isFinished) {
    while (scoreA === scoreB) {
      const kickA = runKick("A");
      kicks.push(kickA);

      const kickB = runKick("B");
      kicks.push(kickB);
    }
    winnerId = scoreA > scoreB ? teamAId : teamBId;
  }

  return {
    winnerId,
    goalsA: scoreA,
    goalsB: scoreB,
    kicks,
  };
}
