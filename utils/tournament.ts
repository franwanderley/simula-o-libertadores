import { OpponentTeam, GroupStandingRow, KnockoutMatch, UserEliminationStatus } from '@/types/game';

export function getUserGroupKey(groups: Record<string, OpponentTeam[]> | null): string {
  if (!groups) return '';
  for (const [gKey, teams] of Object.entries(groups)) {
    if (teams.some(t => t.id === 'user_team')) {
      return gKey;
    }
  }
  return '';
}

export function checkGroupStageElimination(
  groups: Record<string, OpponentTeam[]> | null,
  groupStandings: Record<string, GroupStandingRow[]> | null
): UserEliminationStatus | null {
  const userGroupKey = getUserGroupKey(groups);
  if (!userGroupKey || !groupStandings) return null;

  const standings = groupStandings[userGroupKey] || [];
  const userPosition = standings.findIndex(r => r.teamId === 'user_team');

  if (userPosition !== -1 && userPosition >= 2) {
    return {
      eliminatedAt: 'Fase de Grupos',
      standingsPosition: userPosition + 1
    };
  }

  return null;
}

export function checkKnockoutMatchElimination(
  match: KnockoutMatch | null,
  stageName: string
): UserEliminationStatus | null {
  if (!match) return null;
  const isUserTeam = match.teamA.id === 'user_team' || match.teamB.id === 'user_team';
  if (isUserTeam && match.winnerId && match.winnerId !== 'user_team') {
    return { eliminatedAt: stageName };
  }
  return null;
}

export function checkKnockoutListElimination(
  matches: KnockoutMatch[] | null,
  stageName: string
): UserEliminationStatus | null {
  if (!matches) return null;
  const userMatch = matches.find(
    m => m.teamA.id === 'user_team' || m.teamB.id === 'user_team'
  );
  if (userMatch) {
    return checkKnockoutMatchElimination(userMatch, stageName);
  }
  return null;
}

interface UserEliminationParams {
  isGroupSimulated: boolean;
  groups: Record<string, OpponentTeam[]> | null;
  groupStandings: Record<string, GroupStandingRow[]> | null;
  isKnockoutDrawCompleted: boolean;
  knockoutMatches: KnockoutMatch[] | null;
  qfMatches: KnockoutMatch[] | null;
  sfMatches: KnockoutMatch[] | null;
  fMatch: KnockoutMatch | null;
}

export function checkUserElimination(params: UserEliminationParams): UserEliminationStatus | null {
  if (params.isGroupSimulated) {
    const groupElim = checkGroupStageElimination(params.groups, params.groupStandings);
    if (groupElim) return groupElim;
  }

  if (params.isKnockoutDrawCompleted) {
    return (
      checkKnockoutListElimination(params.knockoutMatches, "Oitavas de Final") ||
      checkKnockoutListElimination(params.qfMatches, "Quartas de Final") ||
      checkKnockoutListElimination(params.sfMatches, "Semifinal") ||
      checkKnockoutMatchElimination(params.fMatch, "Vice-Campeão")
    );
  }

  return null;
}

export function getMatchRound(i: number, j: number): number {
  if ((i === 0 && j === 1) || (i === 2 && j === 3)) return 1;
  if ((i === 0 && j === 2) || (i === 1 && j === 3)) return 2;
  if ((i === 0 && j === 3) || (i === 1 && j === 2)) return 3;
  if ((i === 1 && j === 0) || (i === 3 && j === 2)) return 4;
  if ((i === 2 && j === 0) || (i === 3 && j === 1)) return 5;
  if ((i === 3 && j === 0) || (i === 2 && j === 1)) return 6;
  return 1;
}
