import { OpponentTeam, GroupStandingRow, KnockoutMatch } from '../app/types/game';

export interface UserEliminationStatus {
  eliminatedAt: string;
  standingsPosition?: number;
}

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

export function checkAllKnockoutEliminations(
  knockoutMatches: KnockoutMatch[] | null,
  qfMatches: KnockoutMatch[] | null,
  sfMatches: KnockoutMatch[] | null,
  fMatch: KnockoutMatch | null
): UserEliminationStatus | null {
  const r16Elim = checkKnockoutListElimination(knockoutMatches, 'Oitavas de Final');
  if (r16Elim) return r16Elim;

  const qfElim = checkKnockoutListElimination(qfMatches, 'Quartas de Final');
  if (qfElim) return qfElim;

  const sfElim = checkKnockoutListElimination(sfMatches, 'Semifinal');
  if (sfElim) return sfElim;

  const fElim = checkKnockoutMatchElimination(fMatch, 'Vice-Campeão');
  if (fElim) return fElim;

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
    const knockoutElim = checkAllKnockoutEliminations(
      params.knockoutMatches,
      params.qfMatches,
      params.sfMatches,
      params.fMatch
    );
    if (knockoutElim) return knockoutElim;
  }

  return null;
}
