import { X } from 'lucide-react';
import { OpponentTeam, MatchResult } from '@/types/game';
import { WhistleIcon } from '../assets/icons/WhistleIcon';
import { EVENT_STYLE_MAP } from '@/utils/constants';

interface MatchDetailsModalProps {
  match: {
    id: string;
    teamA: OpponentTeam;
    teamB: OpponentTeam;
  };
  result: MatchResult;
  onClose: () => void;
}

export function MatchDetailsModal({ match, result, onClose }: Readonly<MatchDetailsModalProps>) {
  const isUserMatch = match.teamA.id === 'user_team' || match.teamB.id === 'user_team';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-6 relative animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-xl cursor-pointer transition animate-none"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <span className="text-[10px] bg-slate-800 px-2 py-1 rounded-md text-amber-500 font-extrabold uppercase tracking-widest">
            Detalhes da Partida
          </span>
        </div>

        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className={`w-14 h-14 rounded-full ${match.teamA.logoColor} flex items-center justify-center text-white font-black text-xl border border-white/10 shadow-lg`}>
              {match.teamA.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-black text-white mt-2 text-center truncate w-full">
              {match.teamA.name}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
              {match.teamA.country}
            </span>
          </div>

          <div className="flex flex-col items-center gap-1 shrink-0 px-4">
            <div className="text-4xl font-black text-white flex items-center gap-3">
              <span>{result.goalsA}</span>
              {result.penalties && (
                <span className="text-sm text-slate-400 font-normal">({result.penalties.goalsA})</span>
              )}
              <span className="text-slate-600 text-lg font-medium">x</span>
              {result.penalties && (
                <span className="text-sm text-slate-400 font-normal">({result.penalties.goalsB})</span>
              )}
              <span>{result.goalsB}</span>
            </div>
            <span className="text-[9px] text-slate-500 font-bold uppercase mt-1">Placar Final</span>
          </div>

          <div className="flex flex-col items-center flex-1 min-w-0">
            <div className={`w-14 h-14 rounded-full ${match.teamB.logoColor} flex items-center justify-center text-white font-black text-xl border border-white/10 shadow-lg`}>
              {match.teamB.name.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-black text-white mt-2 text-center truncate w-full">
              {match.teamB.name}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
              {match.teamB.country}
            </span>
          </div>
        </div>

        <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800">
          <h4 className="text-[10px] text-slate-400 font-extrabold uppercase mb-3 tracking-widest text-center">
            Eventos do Jogo
          </h4>
          <div className="flex flex-col gap-2.5 max-h-40 overflow-y-auto pr-1">
            {result.events.length > 0 ? (
              result.events.map((ev, idx) => {
                const isTeamA = ev.teamName === match.teamA.name;
                return (
                  <div
                    key={`${idx}-${ev.minute}`}
                    className={`flex items-start text-xs gap-2 ${isTeamA ? 'flex-row' : 'flex-row-reverse text-right'}`}
                  >
                    {isUserMatch && (
                      <span className="font-mono text-amber-500 font-bold shrink-0 mt-1">{ev.minute}&apos;</span>
                    )}
                    <div className={`px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 max-w-[85%] border text-[10px] leading-snug ${EVENT_STYLE_MAP[ev.type]}`}>
                      {ev.type === 'goal' && <span className="text-emerald-400 shrink-0">⚽</span>}
                      {ev.type === 'shot' && <span className="text-blue-400 shrink-0">🎯</span>}
                      {ev.type === 'foul' && <WhistleIcon />}
                      <span className="wrap-break-word">{ev.description}</span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-4 text-xs text-slate-500 font-medium">
                Sem gols na partida.
              </div>
            )}
            {result.penalties && (
              <div className="mt-4 border-t border-slate-800 pt-4 flex flex-col gap-2.5 text-left">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center mb-1 block">
                  Decisão por Pênaltis ({result.penalties.goalsA} - {result.penalties.goalsB})
                </span>
                {result.penalties.kicks.map((kick, kIdx) => {
                  const isKickTeamA = kick.teamId === 'A';
                  return (
                    <div
                      key={`${kick.kickerName}-${kIdx}`}
                      className={`flex items-start text-xs gap-2 ${isKickTeamA ? 'flex-row' : 'flex-row-reverse text-right'}`}
                    >
                      <span className="font-mono text-slate-500 font-bold shrink-0 mt-1">#{kIdx + 1}</span>
                      <div className={`px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 max-w-[85%] border text-[10px] leading-snug ${
                        kick.isGoal
                          ? 'bg-emerald-950/20 border-emerald-500/35 text-slate-200'
                          : 'bg-red-950/15 border-red-500/30 text-slate-300'
                      }`}>
                        {kick.isGoal ? (
                          <span className="text-emerald-400 shrink-0">⚽</span>
                        ) : (
                          <span className="text-red-500 shrink-0">❌</span>
                        )}
                        <span className="wrap-break-word">
                          {kick.kickerName} - {kick.isGoal ? 'GOL!' : 'PERDEU!'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center">
            Estatísticas do Jogo
          </h4>
          
          <div className="flex flex-col gap-3.5 bg-slate-950/40 rounded-2xl p-4 border border-slate-800/80">
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>{result.stats.possessionA}%</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Posse de Bola</span>
                <span>{result.stats.possessionB}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700/50">
                <div className="bg-amber-500 h-full rounded-l-full transition-all duration-500" style={{ width: `${result.stats.possessionA}%` }} />
                <div className="bg-slate-600 h-full rounded-r-full transition-all duration-500" style={{ width: `${result.stats.possessionB}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>{result.stats.shotsA}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Finalizações</span>
                <span>{result.stats.shotsB}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700/50">
                <div className="bg-amber-500 h-full rounded-l-full transition-all duration-500" style={{ width: `${(result.stats.shotsA / (result.stats.shotsA + result.stats.shotsB || 1)) * 100}%` }} />
                <div className="bg-slate-600 h-full rounded-r-full transition-all duration-500" style={{ width: `${(result.stats.shotsB / (result.stats.shotsA + result.stats.shotsB || 1)) * 100}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                <span>{result.stats.foulsA}</span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Faltas Cometidas</span>
                <span>{result.stats.foulsB}</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700/50">
                <div className="bg-amber-500 h-full rounded-l-full transition-all duration-500" style={{ width: `${(result.stats.foulsA / (result.stats.foulsA + result.stats.foulsB || 1)) * 100}%` }} />
                <div className="bg-slate-600 h-full rounded-r-full transition-all duration-500" style={{ width: `${(result.stats.foulsB / (result.stats.foulsA + result.stats.foulsB || 1)) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
