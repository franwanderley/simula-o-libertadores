import { OpponentTeam, MatchResult } from '@/types/game';
import { getMatchRound } from '../utils/tournament';

interface GroupMatchesListProps {
  gKey: string;
  groupTeams: OpponentTeam[];
  matchResults: Record<string, MatchResult>;
  currentGroupRound: number;
  onSelectMatch: (match: { id: string; teamA: OpponentTeam; teamB: OpponentTeam }) => void;
}

export function GroupMatchesList({
  gKey,
  groupTeams,
  matchResults,
  currentGroupRound,
  onSelectMatch
}: Readonly<GroupMatchesListProps>) {
  const matchesList: { teamA: OpponentTeam; teamB: OpponentTeam; resultId: string }[] = [];

  for (let i = 0; i < groupTeams.length; i++) {
    for (let j = 0; j < groupTeams.length; j++) {
      if (i === j) continue;
      matchesList.push({
        teamA: groupTeams[i],
        teamB: groupTeams[j],
        resultId: `group_${gKey}_${groupTeams[i].id}_${groupTeams[j].id}`
      });
    }
  }

  return (
    <>
      {matchesList.map((match, mIdx) => {
        const result = matchResults[match.resultId];
        const i = groupTeams.findIndex(t => t.id === match.teamA.id);
        const j = groupTeams.findIndex(t => t.id === match.teamB.id);
        const matchRound = getMatchRound(i, j);
        const isPlayed = matchRound <= currentGroupRound;

        return (
          <button
            key={`${match.teamA.id}-${match.teamB.id}-${mIdx}`}
            onClick={() => {
              if (isPlayed) {
                onSelectMatch({
                  id: match.resultId,
                  teamA: match.teamA,
                  teamB: match.teamB
                });
              }
            }}
            disabled={!isPlayed}
            className={`w-full text-left p-2 border rounded-lg flex items-center justify-between transition ${
              isPlayed
                ? 'bg-slate-850 hover:bg-slate-800 border-slate-800 cursor-pointer'
                : 'bg-slate-900 border-slate-950 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-1 min-w-0 max-w-[42%]">
              <span className="truncate text-slate-300">{match.teamA.name}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 px-1 font-mono font-black text-white">
              {isPlayed ? (
                <>
                  <span>{result?.goalsA ?? 0}</span>
                  <span className="text-slate-600 font-normal">x</span>
                  <span>{result?.goalsB ?? 0}</span>
                </>
              ) : (
                <span className="text-slate-500 font-sans font-bold text-[8px] uppercase tracking-wider">
                  R{matchRound}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 min-w-0 max-w-[42%] justify-end text-right">
              <span className="truncate text-slate-300">{match.teamB.name}</span>
            </div>
          </button>
        );
      })}
    </>
  );
}
