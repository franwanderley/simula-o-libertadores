import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../hooks/useGameStore';
import { OpponentTeam, MatchResult, MatchEvent } from '@/types/game';
import { WhistleIcon } from '../assets/icons/WhistleIcon';
import { ShootoutOverlay } from './ShootoutOverlay';
import { EVENT_STYLE_MAP } from '@/utils/constants';

const SCORE_COLOR_MAP = {
  not_scored: 'text-white',
  scored_self: 'text-emerald-400 animate-bounce scale-125',
  scored_opponent: 'text-red-500 animate-bounce scale-125',
} as const;

const getScoreColorKey = (isJustScored: boolean, isOpponentGoal: boolean) => {
  if (!isJustScored) return 'not_scored';
  if (isOpponentGoal) return 'scored_opponent';
  return 'scored_self';
};

interface LiveSimulationOverlayProps {
  liveSimulation: {
    matches: {
      id: string;
      teamA: OpponentTeam;
      teamB: OpponentTeam;
      result: MatchResult;
    }[];
    currentMinute: number;
    title: string;
    onComplete: () => void;
  };
  setLiveSimulation: React.Dispatch<React.SetStateAction<{
    matches: {
      id: string;
      teamA: OpponentTeam;
      teamB: OpponentTeam;
      result: MatchResult;
    }[];
    currentMinute: number;
    title: string;
    onComplete: () => void;
  } | null>>;
  maxMinute: number;
}

export function LiveSimulationOverlay({
  liveSimulation,
  setLiveSimulation,
  maxMinute
}: Readonly<LiveSimulationOverlayProps>) {
  const store = useGameStore();
  const feedRef = useRef<HTMLDivElement | null>(null);

  const [showShootoutState, setShowShootoutState] = useState<'not_started' | 'active' | 'completed'>('not_started');

  const getLiveScore = (events: MatchEvent[], currentMinute: number, teamAName: string, teamBName: string) => {
    let scoreA = 0;
    let scoreB = 0;
    const liveEvents = events.filter(e => e.minute <= currentMinute);
    for (const e of liveEvents) {
      if (e.type === 'goal') {
        if (e.teamName === teamAName) {
          scoreA++;
        } else if (e.teamName === teamBName) {
          scoreB++;
        }
      }
    }
    return { scoreA, scoreB, liveEvents };
  };

  const isFinished = liveSimulation.currentMinute >= maxMinute;
  const userMatch = liveSimulation.matches.find(
    m => m.teamA.id === 'user_team' || m.teamB.id === 'user_team'
  );
  const mainMatch = userMatch || liveSimulation.matches[0];

  const { scoreA, scoreB, liveEvents } = mainMatch
    ? getLiveScore(
        mainMatch.result.events,
        liveSimulation.currentMinute,
        mainMatch.teamA.name,
        mainMatch.teamB.name
      )
    : { scoreA: 0, scoreB: 0, liveEvents: [] as MatchEvent[] };

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [liveEvents.length]);

  useEffect(() => {
    if (liveSimulation.currentMinute >= maxMinute) return;

    const interval = setInterval(() => {
      setLiveSimulation(prev => {
        if (!prev) return null;
        if (prev.currentMinute >= maxMinute) return prev;
        return {
          ...prev,
          currentMinute: prev.currentMinute + 1
        };
      });
    }, 600);

    return () => clearInterval(interval);
  }, [maxMinute, setLiveSimulation, liveSimulation.currentMinute]);

  if (!mainMatch) return null;

  const hasPenalties = mainMatch.result.penalties !== undefined;
  const shootout = mainMatch.result.penalties;

  if (isFinished && hasPenalties && showShootoutState !== 'completed') {
    return (
      <ShootoutOverlay
        mainMatch={mainMatch}
        shootout={shootout!}
        scoreA={scoreA}
        scoreB={scoreB}
        showShootoutState={showShootoutState}
        setShowShootoutState={setShowShootoutState}
      />
    );
  }

  const currentMinuteEvents = mainMatch.result.events.filter(
    e => e.minute === liveSimulation.currentMinute
  );
  const goalEvent = currentMinuteEvents.find(e => e.type === 'goal');
  const isGoalAJustScored = goalEvent?.teamName === mainMatch.teamA.name;
  const isGoalBJustScored = goalEvent?.teamName === mainMatch.teamB.name;

  const isOpponentGoalA = isGoalAJustScored && mainMatch.teamA.id !== 'user_team';
  const isOpponentGoalB = isGoalBJustScored && mainMatch.teamB.id !== 'user_team';
  const isOpponentGoalJustScored = isOpponentGoalA || isOpponentGoalB;

  const scoreAColor = SCORE_COLOR_MAP[getScoreColorKey(isGoalAJustScored, isOpponentGoalA)];
  const scoreBColor = SCORE_COLOR_MAP[getScoreColorKey(isGoalBJustScored, isOpponentGoalB)];

  const goalBadgeBg = isOpponentGoalJustScored
    ? 'bg-red-600 border-red-500 text-white'
    : 'bg-emerald-500 border-emerald-400 text-slate-950';

  const finalPossA = mainMatch.result.stats.possessionA;
  const livePossA = liveSimulation.currentMinute === 0
    ? 50
    : Math.min(75, Math.max(25, Math.round(50 + (finalPossA - 50) * Math.min(1, liveSimulation.currentMinute / 20) + Math.sin(liveSimulation.currentMinute * 0.4) * 4)));
  const livePossB = 100 - livePossA;

  const liveShotsA = liveEvents.filter(e => e.teamName === mainMatch.teamA.name && (e.type === 'shot' || e.type === 'goal')).length;
  const liveShotsB = liveEvents.filter(e => e.teamName === mainMatch.teamB.name && (e.type === 'shot' || e.type === 'goal')).length;

  const liveFoulsA = liveEvents.filter(e => e.teamName === mainMatch.teamA.name && e.type === 'foul').length;
  const liveFoulsB = liveEvents.filter(e => e.teamName === mainMatch.teamB.name && e.type === 'foul').length;

  const otherMatches = liveSimulation.matches.filter(m => m.id !== mainMatch.id);

  return (
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-50 flex flex-col animate-in fade-in duration-200">
      <div className="flex-1 overflow-y-auto p-6 pb-24 sm:pb-6">
        <div className="max-w-4xl mx-auto w-full flex flex-col justify-between gap-4 min-h-full">
        
        <div className="text-center flex flex-col items-center">
          <span className="text-[10px] bg-slate-800 px-3 py-1 rounded-md text-amber-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            {liveSimulation.title}
          </span>
          
          <div className="mt-2 flex items-center justify-center gap-4">
            <div className="text-5xl font-black text-white font-mono tracking-tight flex items-center gap-1">
              <span>{liveSimulation.currentMinute}</span>
              <span className="text-amber-500 animate-pulse">&apos;</span>
            </div>
            {isFinished && (
              <span className="text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wider animate-bounce">
                Fim de Jogo
              </span>
            )}
          </div>
          
          <div className="w-full max-w-md bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3 p-0.5 border border-slate-700">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-100"
              style={{ width: `${(liveSimulation.currentMinute / maxMinute) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-2">
          
          <div className="md:col-span-2 order-1 md:order-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-4 h-fit">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl" />
            
            <div className="flex items-center justify-between gap-4">
              
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className={`w-14 h-14 rounded-full ${mainMatch.teamA.logoColor} border border-white/10 shadow-lg flex items-center justify-center text-white font-black text-lg`}>
                  {mainMatch.teamA.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-black text-white mt-2 text-center truncate w-full">
                  {mainMatch.teamA.name}
                </span>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase mt-1">
                  {mainMatch.teamA.country}
                </span>
              </div>
              
              <div className="flex flex-col items-center justify-center shrink-0 px-4 relative">
                <div className="text-5xl font-black font-mono tracking-tight flex items-center gap-3">
                  <span className={`${scoreAColor} transition-all duration-300`}>
                    {scoreA}
                    {hasPenalties && showShootoutState === 'completed' && (
                      <span className="text-[10px] text-slate-400 font-normal block text-center mt-1">({shootout!.goalsA})</span>
                    )}
                  </span>
                  <span className="text-slate-600 text-xl font-normal">:</span>
                  <span className={`${scoreBColor} transition-all duration-300`}>
                    {scoreB}
                    {hasPenalties && showShootoutState === 'completed' && (
                      <span className="text-[10px] text-slate-400 font-normal block text-center mt-1">({shootout!.goalsB})</span>
                    )}
                  </span>
                </div>
                {goalEvent && (
                  <div className={`absolute -top-6 ${goalBadgeBg} border text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest animate-bounce shadow-lg`}>
                    GOL!
                  </div>
                )}
                <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-extrabold uppercase mt-2 tracking-wider">
                  Ao Vivo
                </span>
              </div>
              
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div className={`w-14 h-14 rounded-full ${mainMatch.teamB.logoColor} border border-white/10 shadow-lg flex items-center justify-center text-white font-black text-lg`}>
                  {mainMatch.teamB.name.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-black text-white mt-2 text-center truncate w-full">
                  {mainMatch.teamB.name}
                </span>
                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-bold uppercase mt-1">
                  {mainMatch.teamB.country}
                </span>
              </div>
              
            </div>
          </div>
          
          <div className="md:col-span-1 md:row-span-2 order-2 md:order-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-[400px] md:h-[500px]">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center border-b border-slate-800 pb-2 mb-3">
              Lances do Jogo
            </span>
            
            <div
              ref={feedRef}
              className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 scroll-smooth"
            >
              {liveEvents.length > 0 ? (
                liveEvents.map((ev, eIdx) => {
                  const isTeamA = ev.teamName === mainMatch.teamA.name;
                  const eventStyle = EVENT_STYLE_MAP[ev.type] || EVENT_STYLE_MAP.shot;
                  return (
                    <div
                      key={`${eIdx}-${ev.minute}`}
                      className={`flex items-start text-xs gap-2 ${isTeamA ? 'flex-row' : 'flex-row-reverse text-right'}`}
                    >
                      <span className="font-mono text-amber-500 font-bold shrink-0 mt-1">{ev.minute}&apos;</span>
                      <div className={`px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 max-w-[85%] border text-[10px] leading-snug ${eventStyle}`}>
                        {ev.type === 'goal' && <span className="text-emerald-400 shrink-0">⚽</span>}
                        {ev.type === 'shot' && <span className="text-blue-400 shrink-0">🎯</span>}
                        {ev.type === 'foul' && <WhistleIcon />}
                        <span className="wrap-break-word">{ev.description}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-500 font-medium">
                  Jogo truncado no meio de campo. Sem lances perigosos ainda.
                </div>
              )}
              {hasPenalties && showShootoutState === 'completed' && (
                <div className="mt-4 border-t border-slate-800 pt-4 flex flex-col gap-2.5 text-left">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center mb-1 block">
                    Decisão por Pênaltis ({shootout!.goalsA} - {shootout!.goalsB})
                  </span>
                  {shootout!.kicks.map((kick, kIdx) => {
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

          <div className="md:col-span-2 order-3 md:order-3 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4 h-fit">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center">
              Estatísticas em Tempo Real
            </span>
            
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                  <span>{livePossA}%</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Posse de Bola</span>
                  <span>{livePossB}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700/50">
                  <div className="bg-amber-500 h-full rounded-l-full transition-all duration-500" style={{ width: `${livePossA}%` }} />
                  <div className="bg-slate-600 h-full rounded-r-full transition-all duration-500" style={{ width: `${livePossB}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                  <span>{liveShotsA}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Finalizações</span>
                  <span>{liveShotsB}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700/50">
                  <div className="bg-amber-500 h-full rounded-l-full transition-all duration-500" style={{ width: `${(liveShotsA / (liveShotsA + liveShotsB || 1)) * 100}%` }} />
                  <div className="bg-slate-600 h-full rounded-r-full transition-all duration-500" style={{ width: `${(liveShotsB / (liveShotsA + liveShotsB || 1)) * 100}%` }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                  <span>{liveFoulsA}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">Faltas</span>
                  <span>{liveFoulsB}</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex p-0.5 border border-slate-700/50">
                  <div className="bg-amber-500 h-full rounded-l-full transition-all duration-500" style={{ width: `${(liveFoulsA / (liveFoulsA + liveFoulsB || 1)) * 100}%` }} />
                  <div className="bg-slate-600 h-full rounded-r-full transition-all duration-500" style={{ width: `${(liveFoulsB / (liveFoulsA + liveFoulsB || 1)) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
          
        </div>

        {otherMatches.length > 0 && (
          <div className="border-t border-slate-800/80 pt-3">
            <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest block mb-2 text-center">
              Outros confrontos da Rodada
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {otherMatches.map((m, idx) => {
                const { scoreA: oScoreA, scoreB: oScoreB } = getLiveScore(
                  m.result.events,
                  liveSimulation.currentMinute,
                  m.teamA.name,
                  m.teamB.name
                );
                const hasJustScored = m.result.events.some(
                  e => e.type === 'goal' && e.minute === liveSimulation.currentMinute
                );
                const matchGroupKey = m.id.split('_')[1];
                let userGroupKey = '';
                if (store.groups) {
                  for (const [gKey, teams] of Object.entries(store.groups)) {
                    if (teams.some(t => t.id === 'user_team')) {
                      userGroupKey = gKey;
                      break;
                    }
                  }
                }
                const isSameGroup = matchGroupKey === userGroupKey;
                let cardStatus: 'scored' | 'same_group' | 'default' = 'default';
                if (hasJustScored) {
                  cardStatus = 'scored';
                } else if (isSameGroup) {
                  cardStatus = 'same_group';
                }
                const cardStyleMap = {
                  scored: 'bg-emerald-950/40 border-emerald-500 scale-105 animate-pulse',
                  same_group: 'bg-amber-950/15 border-amber-500/50 shadow-lg shadow-amber-500/5 scale-105',
                  default: 'border-slate-800/60',
                } as const;
                const cardStyle = cardStyleMap[cardStatus];
                return (
                  <div
                    key={m.id || idx}
                    className={`p-2 bg-slate-900 border rounded-xl flex flex-col gap-0.5 items-center justify-center transition-all duration-300 relative ${cardStyle}`}
                  >
                    {isSameGroup && (
                      <span className="absolute -top-1.5 -right-1 bg-amber-500 text-slate-950 text-[7px] font-black px-1 rounded uppercase tracking-wider">
                        Grupo {matchGroupKey}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-400 font-bold truncate max-w-full">
                      {m.teamA.name.slice(0, 3).toUpperCase()} x {m.teamB.name.slice(0, 3).toUpperCase()}
                    </span>
                    <span className="text-xs font-black text-white font-mono">
                      {oScoreA} - {oScoreB}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botão apenas para versão Desktop (não fixado) */}
          <div className="hidden md:flex justify-center mt-6">
            {isFinished ? (
              <button
                onClick={() => {
                  liveSimulation.onComplete();
                }}
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95"
              >
                Fechar Painel
              </button>
            ) : (
              <button
                onClick={() => {
                  setLiveSimulation(prev => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      currentMinute: maxMinute
                    };
                  });
                }}
                className="px-6 py-3 bg-slate-850 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 border border-slate-850 hover:border-slate-700"
              >
                Pular Simulação
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Footer fixado apenas no Mobile */}
      <div className="w-full bg-slate-950/90 border-t border-slate-900 backdrop-blur-md flex justify-center gap-4 py-4 p-4 z-50 shrink-0 md:hidden">
        {isFinished ? (
          <button
            onClick={() => {
              liveSimulation.onComplete();
            }}
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95"
          >
            Fechar Painel
          </button>
        ) : (
          <button
            onClick={() => {
              setLiveSimulation(prev => {
                if (!prev) return null;
                return {
                  ...prev,
                  currentMinute: maxMinute
                };
              });
            }}
            className="px-6 py-3 bg-slate-850 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 border border-slate-850 hover:border-slate-700"
          >
            Pular Simulação
          </button>
        )}
      </div>
    </div>
  );
}
