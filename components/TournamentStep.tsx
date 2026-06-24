"use client";

import { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, RefreshCw, ArrowRight, CheckCircle2, Lock, X, Share2 } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';
import { OpponentTeam, KnockoutMatch } from '../app/types/game';
import { MatchEvent, MatchResult } from '../utils/matchSimulator';
import { PenaltyKick } from '../utils/penaltySimulator';
import { WhistleIcon } from '../assets/icons/WhistleIcon';
import { GroupMatchesList } from './GroupMatchesList';
import { checkUserElimination } from '../utils/tournament';

const SLOT_POSITIONS: Record<string, { top: string; left: string }> = {
  gk: { top: '85%', left: '50%' },
  lb: { top: '66%', left: '8%' },
  lcb: { top: '70%', left: '29%' },
  cb: { top: '74%', left: '50%' },
  rcb: { top: '70%', left: '71%' },
  rb: { top: '66%', left: '92%' },
  lwb: { top: '64%', left: '6%' },
  rwb: { top: '64%', left: '94%' },
  lm: { top: '45%', left: '6%' },
  ldm: { top: '50%', left: '27%' },
  cm: { top: '46%', left: '50%' },
  lcm: { top: '44%', left: '24%' },
  rcm: { top: '44%', left: '76%' },
  cam: { top: '32%', left: '50%' },
  rdm: { top: '50%', left: '73%' },
  rm: { top: '45%', left: '94%' },
  lam: { top: '28%', left: '15%' },
  ram: { top: '28%', left: '85%' },
  ls: { top: '14%', left: '28%' },
  rs: { top: '14%', left: '72%' },
  lw: { top: '15%', left: '10%' },
  st: { top: '10%', left: '50%' },
  rw: { top: '15%', left: '90%' },
  lf: { top: '22%', left: '28%' },
  rf: { top: '22%', left: '72%' },
};

const getGroupRoundMatches = (groupTeams: OpponentTeam[], round: number) => {
  if (groupTeams.length < 4) return [];
  const t = groupTeams;
  switch (round) {
    case 1:
      return [
        { teamA: t[0], teamB: t[1] },
        { teamA: t[2], teamB: t[3] }
      ];
    case 2:
      return [
        { teamA: t[0], teamB: t[2] },
        { teamA: t[1], teamB: t[3] }
      ];
    case 3:
      return [
        { teamA: t[0], teamB: t[3] },
        { teamA: t[1], teamB: t[2] }
      ];
    case 4:
      return [
        { teamA: t[1], teamB: t[0] },
        { teamA: t[3], teamB: t[2] }
      ];
    case 5:
      return [
        { teamA: t[2], teamB: t[0] },
        { teamA: t[3], teamB: t[1] }
      ];
    case 6:
      return [
        { teamA: t[3], teamB: t[0] },
        { teamA: t[2], teamB: t[1] }
      ];
    default:
      return [];
  }
};

interface TournamentStepProps {
  onReset: () => void;
}

export function TournamentStep(props: Readonly<TournamentStepProps>) {
  const store = useGameStore();
  const feedRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'draw' | 'bracket'>('groups');

  const [selectedMatch, setSelectedMatch] = useState<{
    id: string;
    teamA: OpponentTeam;
    teamB: OpponentTeam;
  } | null>(null);
  const [expandedGroupMatches, setExpandedGroupMatches] = useState<string | null>(null);
  const [liveSimulation, setLiveSimulation] = useState<{
    matches: {
      id: string;
      teamA: OpponentTeam;
      teamB: OpponentTeam;
      result: MatchResult;
    }[];
    currentMinute: number;
    title: string;
    onComplete: () => void;
  } | null>(null);

  const [copied, setCopied] = useState(false);
  const [showShootoutState, setShowShootoutState] = useState<'not_started' | 'active' | 'completed'>('not_started');
  const [activePenaltyKickIndex, setActivePenaltyKickIndex] = useState(0);
  const [isPenaltyKicking, setIsPenaltyKicking] = useState(false);
  const [penaltyKicksHistory, setPenaltyKicksHistory] = useState<PenaltyKick[]>([]);
  const [showPenaltyResultEffect, setShowPenaltyResultEffect] = useState(false);

  const isUserEliminated = checkUserElimination({
    isGroupSimulated: store.isGroupSimulated,
    groups: store.groups,
    groupStandings: store.groupStandings,
    isKnockoutDrawCompleted: store.isKnockoutDrawCompleted,
    knockoutMatches: store.knockoutMatches,
    qfMatches: store.qfMatches,
    sfMatches: store.sfMatches,
    fMatch: store.fMatch
  });

  const handleShareCampaign = () => {
    if (!isUserEliminated) return;
    const squadStr = store.squad
      .map(s => s.player ? `${s.label}: ${s.player.name} (${s.player.overall} OVR)` : '')
      .filter(Boolean)
      .join('\n');
    
    const text = `🏆 6 a 3 - Simulador da Libertadores 🏆\n\nMinha Campanha:\nFase de Eliminação: ${isUserEliminated.eliminatedAt}\nAtaque: ${store.attackOverall} | Defesa: ${store.defenseOverall} | Química: ${store.teamChemistry}\nFormação: ${store.formation}\n\nEscalação:\n${squadStr}\n\nMonte seu time e simule em: ${typeof globalThis === 'undefined' ? '' : globalThis.location.origin}`;
    
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

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

  const getMaxMinute = (matches: {
    id: string;
    teamA: OpponentTeam;
    teamB: OpponentTeam;
    result: MatchResult;
  }[]) => {
    let maxMin = 90;
    for (const m of matches) {
      if (m?.result?.events) {
        for (const ev of m.result.events) {
          if (ev.minute > maxMin) {
            maxMin = ev.minute;
          }
        }
      }
    }
    return maxMin;
  };

  const maxMinute = liveSimulation ? getMaxMinute(liveSimulation.matches) : 90;

  useEffect(() => {
    if (!liveSimulation) return;
    if (liveSimulation.currentMinute >= maxMinute) return;
    
    const interval = setInterval(() => {
      setLiveSimulation(prev => {
        if (!prev) return null;
        const nextMin = prev.currentMinute + 1;
        if (nextMin >= maxMinute) {
          clearInterval(interval);
        }
        return {
          ...prev,
          currentMinute: nextMin
        };
      });
    }, 667);
    
    return () => clearInterval(interval);
  }, [liveSimulation, maxMinute]);

  const resetShootoutStates = () => {
    setShowShootoutState('not_started');
    setActivePenaltyKickIndex(0);
    setIsPenaltyKicking(false);
    setPenaltyKicksHistory([]);
    setShowPenaltyResultEffect(false);
  };

  const liveEventsCount = liveSimulation
    ? getLiveScore(
        liveSimulation.matches.find(m => m.teamA.id === 'user_team' || m.teamB.id === 'user_team')?.result.events || liveSimulation.matches[0]?.result.events || [],
        liveSimulation.currentMinute,
        '',
        ''
      ).liveEvents.length
    : 0;

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [liveEventsCount]);

  useEffect(() => {
    if (showShootoutState !== 'active' || !liveSimulation) return;
    
    const userMatch = liveSimulation.matches.find(
      m => m.teamA.id === 'user_team' || m.teamB.id === 'user_team'
    );
    const mainMatch = userMatch || liveSimulation.matches[0];
    if (!mainMatch || !mainMatch.result.penalties) return;
    
    const kicks = mainMatch.result.penalties.kicks;
    const currentKick = kicks[activePenaltyKickIndex];
    if (!currentKick) return;

    let timer: ReturnType<typeof setTimeout>;

    if (!isPenaltyKicking && !showPenaltyResultEffect) {
      timer = setTimeout(() => {
        setIsPenaltyKicking(true);
      }, 1200);
    } else if (isPenaltyKicking) {
      timer = setTimeout(() => {
        setIsPenaltyKicking(false);
        setPenaltyKicksHistory(prev => [...prev, currentKick]);
        setShowPenaltyResultEffect(true);
      }, 800);
    } else if (showPenaltyResultEffect) {
      timer = setTimeout(() => {
        if (activePenaltyKickIndex === kicks.length - 1) {
          setShowShootoutState('completed');
        } else {
          setShowPenaltyResultEffect(false);
          setActivePenaltyKickIndex(prev => prev + 1);
        }
      }, 1200);
    }

    return () => clearTimeout(timer);
  }, [showShootoutState, activePenaltyKickIndex, isPenaltyKicking, showPenaltyResultEffect, liveSimulation]);

  const renderBracketMatch = (m: KnockoutMatch | null, labelA: string, labelB: string) => {
    if (!m) {
      return (
        <div className="bg-slate-850/20 border border-dashed border-slate-800 rounded-xl p-3 flex flex-col gap-2">
          <span className="text-[10px] text-slate-500 font-bold">{labelA}</span>
          <span className="text-[10px] text-slate-500 font-bold">{labelB}</span>
        </div>
      );
    }
    const isCompleted = m.winnerId !== null && m.scores && m.scores.length > 0;
    const scoreHome = isCompleted ? m.scores![0].home : null;
    const scoreAway = isCompleted ? m.scores![0].away : null;
    const result = store.matchResults[m.id];
    
    const isUserMatch = m.teamA.id === 'user_team' || m.teamB.id === 'user_team';
    const canClick = isCompleted && isUserMatch;
    
    return (
      <button
        onClick={() => {
          if (canClick) {
            setSelectedMatch({
              id: m.id,
              teamA: m.teamA,
              teamB: m.teamB
            });
          }
        }}
        className={`w-full text-left bg-slate-850/85 border rounded-xl p-3 relative flex flex-col gap-2 shadow-md transition-all ${
          isUserMatch
            ? 'border-amber-500 bg-amber-500/10 shadow-amber-500/10 ring-1 ring-amber-500/20'
            : 'border-slate-800'
        } ${
          canClick ? 'hover:border-amber-500 hover:bg-slate-800/90 cursor-pointer' : ''
        }`}
      >
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-5 h-5 rounded-full ${m.teamA.logoColor} flex items-center justify-center font-black text-[8px] text-white shrink-0`}>
              {m.teamA.name.slice(0, 2).toUpperCase()}
            </div>
            <span className={`text-xs truncate ${
              m.teamA.id === 'user_team'
                ? 'text-amber-400 font-extrabold'
                : isCompleted && m.winnerId !== m.teamA.id
                ? 'text-slate-500 line-through'
                : 'text-slate-200 font-bold'
            }`}>
              {m.teamA.name}
            </span>
          </div>
          {isCompleted && (
            <span className="text-xs font-black text-white px-1.5 flex items-center gap-0.5">
              {scoreHome}
              {result?.penalties && (
                <span className="text-[9px] text-slate-400 font-normal">({result.penalties.goalsA})</span>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-5 h-5 rounded-full ${m.teamB.logoColor} flex items-center justify-center font-black text-[8px] text-white shrink-0`}>
              {m.teamB.name.slice(0, 2).toUpperCase()}
            </div>
            <span className={`text-xs truncate ${
              m.teamB.id === 'user_team'
                ? 'text-amber-400 font-extrabold'
                : isCompleted && m.winnerId !== m.teamB.id
                ? 'text-slate-500 line-through'
                : 'text-slate-200 font-bold'
            }`}>
              {m.teamB.name}
            </span>
          </div>
          {isCompleted && (
            <span className="text-xs font-black text-white px-1.5 flex items-center gap-0.5">
              {scoreAway}
              {result?.penalties && (
                <span className="text-[9px] text-slate-400 font-normal">({result.penalties.goalsB})</span>
              )}
            </span>
          )}
        </div>
      </button>
    );
  };

  const attackOverall = store.attackOverall;
  const defenseOverall = store.defenseOverall;
  const teamChemistry = store.teamChemistry;
  const isDrawCompleted = store.isDrawCompleted;

  const initializePots = useGameStore(state => state.initializePots);
  const runGroupDraw = useGameStore(state => state.runGroupDraw);

  useEffect(() => {
    if (!isDrawCompleted) {
      const userAvg = Math.round((attackOverall + defenseOverall) / 2);
      let userTier: 'very_good' | 'good' | 'medium' | 'bad' = 'bad';
      if (userAvg >= 82) userTier = 'very_good';
      else if (userAvg >= 78) userTier = 'good';
      else if (userAvg >= 72) userTier = 'medium';

      const userTeam = {
        id: 'user_team',
        name: store.teamName,
        tier: userTier,
        country: 'Brasil',
        attackOverall,
        defenseOverall,
        teamChemistry,
        logoColor: 'bg-amber-500'
      };
      initializePots(userTeam);
      runGroupDraw();
    }
  }, [initializePots, runGroupDraw, attackOverall, defenseOverall, teamChemistry, isDrawCompleted, store.teamName]);

  useEffect(() => {
    if (isDrawCompleted && store.groupStandings === null) {
      store.simulateGroupStage();
    }
  }, [isDrawCompleted, store.groupStandings, store.simulateGroupStage, store]);

  if (store.groupStandings === null) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const getRoundMatches = (round: number) => {
    if (!store.groups) return [];
    const roundMatches: {
      id: string;
      teamA: OpponentTeam;
      teamB: OpponentTeam;
      result: MatchResult;
    }[] = [];
    
    for (const [gKey, teams] of Object.entries(store.groups)) {
      const fixtures = getGroupRoundMatches(teams, round);
      for (const f of fixtures) {
        const matchId = `group_${gKey}_${f.teamA.id}_${f.teamB.id}`;
        const result = store.matchResults[matchId];
        if (result) {
          roundMatches.push({
            id: matchId,
            teamA: f.teamA,
            teamB: f.teamB,
            result
          });
        }
      }
    }
    return roundMatches;
  };

  const handlePlayRound = () => {
    const round = store.currentGroupRound + 1;
    const roundMatches = getRoundMatches(round);
    resetShootoutStates();
    setLiveSimulation({
      matches: roundMatches,
      currentMinute: 0,
      title: `Rodada ${round} - Fase de Grupos`,
      onComplete: () => {
        store.advanceGroupRound();
        setLiveSimulation(null);
        resetShootoutStates();
      }
    });
  };

  const handleSkipRound = () => {
    const round = store.currentGroupRound + 1;
    const roundMatches = getRoundMatches(round);
    const userMatch = roundMatches.find(
      m => m.teamA.id === 'user_team' || m.teamB.id === 'user_team'
    );
    store.advanceGroupRound();
    if (userMatch) {
      setSelectedMatch({
        id: userMatch.id,
        teamA: userMatch.teamA,
        teamB: userMatch.teamB
      });
    }
  };

  const handleSimulateKnockout = () => {
    const roundBefore = store.knockoutRound;
    store.preSimulateKnockoutRoundMatches();
    
    const latestState = useGameStore.getState();
    let matchesToSim: KnockoutMatch[] = [];
    if (roundBefore === 'R16' && latestState.knockoutMatches) {
      matchesToSim = latestState.knockoutMatches;
    } else if (roundBefore === 'QF' && latestState.qfMatches) {
      matchesToSim = latestState.qfMatches;
    } else if (roundBefore === 'SF' && latestState.sfMatches) {
      matchesToSim = latestState.sfMatches;
    } else if (roundBefore === 'F' && latestState.fMatch) {
      matchesToSim = [latestState.fMatch];
    }
    const formattedMatches = matchesToSim.map(m => ({
      id: m.id,
      teamA: m.teamA,
      teamB: m.teamB,
      result: latestState.matchResults[m.id]
    })).filter(m => m.result !== undefined);
    let title = 'Oitavas de Final - Simulação ao Vivo';
    if (roundBefore === 'QF') {
      title = 'Quartas de Final - Simulação ao Vivo';
    } else if (roundBefore === 'SF') {
      title = 'Semifinais - Simulação ao Vivo';
    } else if (roundBefore === 'F') {
      title = 'Grande Final - Simulação ao Vivo';
    }
    resetShootoutStates();
    setLiveSimulation({
      matches: formattedMatches,
      currentMinute: 0,
      title,
      onComplete: () => {
        useGameStore.getState().advanceKnockoutRound();
        setLiveSimulation(null);
        resetShootoutStates();
      }
    });
  };

  const handleResetTournament = () => {
    store.resetDraw();
    props.onReset();
  };

  const groupKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
      {!isUserEliminated && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20 text-amber-500">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">Fase de Torneio</h2>
              <p className="text-slate-400 text-xs mt-0.5">
                Simule a fase de grupos e faça o sorteio do mata-mata até a final.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleResetTournament}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Resetar
            </button>
          </div>
        </div>
      )}

      {isUserEliminated ? (
        <div className="max-w-xl mx-auto w-full animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col gap-6">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl" />
            
            <div className="text-center flex flex-col items-center">
              <span className="text-[10px] bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-red-400 font-extrabold uppercase tracking-widest">
                Fim da Linha!
              </span>
              <h3 className="text-2xl font-black text-white uppercase tracking-tight mt-3">
                {isUserEliminated.eliminatedAt === 'Vice-Campeão'
                  ? 'Vice-Campeão da Libertadores!'
                  : isUserEliminated.eliminatedAt === 'Oitavas de Final'
                  ? 'Eliminado nas Oitavas de Final'
                  : isUserEliminated.eliminatedAt === 'Quartas de Final'
                  ? 'Eliminado nas Quartas de Final'
                  : `Eliminado na ${isUserEliminated.eliminatedAt}`}
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Sua equipe lutou bravamente, mas a jornada na Libertadores chegou ao fim.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl text-center">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase">Ataque</span>
                <div className="text-lg font-black text-red-500 mt-1">{store.attackOverall}</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl text-center">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase">Defesa</span>
                <div className="text-lg font-black text-blue-500 mt-1">{store.defenseOverall}</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl text-center">
                <span className="text-[9px] text-slate-500 font-extrabold uppercase">Química</span>
                <div className="text-lg font-black text-emerald-500 mt-1">{store.teamChemistry}</div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
                  Elenco Escalado ({store.formation})
                </span>
                <span className="text-[10px] text-amber-500 font-black font-mono">
                  OVR Médio: {Math.round((store.attackOverall + store.defenseOverall) / 2)}
                </span>
              </div>
              <div className="relative w-full aspect-4/5 sm:aspect-4/3 bg-linear-to-b from-emerald-800 to-green-950 rounded-2xl border-2 border-slate-800 shadow-2xl overflow-hidden p-2">
                <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
                <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full border border-white/10 -translate-x-1/2 -translate-y-1/2" />
                <div className="absolute inset-x-4 top-0 h-12 border-b border-x border-white/10 mx-auto max-w-28" />
                <div className="absolute inset-x-4 bottom-0 h-12 border-t border-x border-white/10 mx-auto max-w-28" />
                <div className="absolute inset-0">
                  {store.squad.map((slot) => {
                    if (!slot.player) return null;
                    const pos = SLOT_POSITIONS[slot.id] || { top: '50%', left: '50%' };
                    let playerCardStyles = 'bg-linear-to-b from-orange-700 to-amber-900 border-orange-600 text-orange-100';
                    if (slot.player.overall >= 80) {
                      playerCardStyles = 'bg-linear-to-b from-amber-400 to-yellow-600 border-amber-300 text-amber-950';
                    } else if (slot.player.overall >= 74) {
                      playerCardStyles = 'bg-linear-to-b from-zinc-300 to-zinc-500 border-zinc-200 text-zinc-950';
                    }
                    return (
                      <div
                        key={slot.id}
                        className="absolute"
                        style={{
                          top: pos.top,
                          left: pos.left,
                          transform: 'translate(-50%, -50%)',
                        }}
                      >
                        <div className="relative flex flex-col items-center">
                          <div className={`w-11 h-15 sm:w-14 sm:h-18 rounded-md flex flex-col items-center justify-between p-1.5 shadow-xl border border-white/10 ${playerCardStyles}`}>
                            <span className="text-[8px] sm:text-[10px] font-black leading-none">{slot.player.overall}</span>
                            <span className="text-[6px] sm:text-[8px] font-black truncate w-full text-center leading-none">
                              {slot.player.name.split(' ').pop()}
                            </span>
                            <span className="text-[5px] sm:text-[6px] font-extrabold uppercase leading-none opacity-80">
                              {slot.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleShareCampaign}
                className="flex-1 py-3 bg-linear-to-r from-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl active:scale-95 transition-all duration-200 cursor-pointer text-xs flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                {copied ? 'Copiado!' : 'Compartilhar Campanha'}
              </button>
              <button
                onClick={handleResetTournament}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase rounded-xl active:scale-95 transition-all duration-200 cursor-pointer text-xs"
              >
                Jogar Novamente
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl max-w-lg mx-auto w-full">
            <button
              onClick={() => setActiveTab('groups')}
              className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === 'groups' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fase de Grupos
            </button>
            <button
              onClick={() => {
                if (!store.isKnockoutDrawCompleted) {
                  store.runKnockoutDraw();
                }
                setActiveTab('bracket');
              }}
              disabled={!store.isGroupSimulated}
              className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                store.isGroupSimulated ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed text-slate-500'
              } ${activeTab === 'bracket' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {!store.isGroupSimulated && <Lock className="w-3.5 h-3.5" />}
              Mata-Mata
            </button>
          </div>

      {activeTab === 'groups' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-6">
            {!store.isGroupSimulated ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6 max-w-4xl mx-auto w-full relative overflow-hidden animate-in fade-in duration-300">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
                <div className="flex-1">
                  <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-amber-500 font-extrabold uppercase tracking-wider">
                    Rodada {store.currentGroupRound + 1} de 6
                  </span>
                  {(() => {
                    const roundMatches = getRoundMatches(store.currentGroupRound + 1);
                    const userMatch = roundMatches.find(
                      m => m.teamA.id === 'user_team' || m.teamB.id === 'user_team'
                    );
                    if (!userMatch) return null;
                    const opponent = userMatch.teamA.id === 'user_team' ? userMatch.teamB : userMatch.teamA;
                    const isHome = userMatch.teamA.id === 'user_team';
                    return (
                      <div className="mt-3">
                        <h3 className="text-lg font-black text-white uppercase tracking-tight">
                          Proximo Jogo: {isHome ? store.teamName : opponent.name} vs {isHome ? opponent.name : store.teamName}
                        </h3>
                        <p className="text-slate-400 text-xs mt-1">
                          Fase de Grupos da Copa Libertadores. Jogue e assista o confronto ao vivo!
                        </p>
                      </div>
                    );
                  })()}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                  <button
                    onClick={handlePlayRound}
                    className="px-6 py-3.5 bg-linear-to-r from-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 transition-all duration-200 cursor-pointer text-xs flex items-center justify-center gap-1.5 animate-bounce-slow"
                  >
                    <Zap className="w-4 h-4 text-slate-950 shrink-0 animate-pulse" /> Jogar Partida (1 Min)
                  </button>
                  <button
                    onClick={handleSkipRound}
                    className="px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold uppercase rounded-xl active:scale-95 transition-all duration-200 cursor-pointer text-xs flex items-center justify-center gap-1"
                  >
                    Pular Rodada
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto w-full animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Fase de Grupos Concluida</span>
                </div>
                <button
                  onClick={() => {
                    if (!store.isKnockoutDrawCompleted) {
                      store.runKnockoutDraw();
                    }
                    setActiveTab('bracket');
                  }}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  Ir para Chaveamento do Mata-Mata <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {groupKeys.map(gKey => {
                  const standings = store.groupStandings?.[gKey] || [];
                  return (
                    <div key={gKey} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-slate-700/50 transition-all duration-300">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-3">
                        <span className="text-xs font-black uppercase text-amber-500 tracking-wider">Grupo {gKey}</span>
                        <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase font-black">Standings</span>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <div className="grid grid-cols-12 text-[9px] font-black uppercase text-slate-500 px-1">
                          <span className="col-span-6">Equipe</span>
                          <span className="col-span-2 text-center">PTS</span>
                          <span className="col-span-2 text-center">J</span>
                          <span className="col-span-2 text-center">SG</span>
                        </div>
                        {standings.map((row, idx) => {
                          const isQualified = idx < 2;
                          const isUser = row.teamId === 'user_team';
                          return (
                            <div
                              key={row.teamId}
                              className={`grid grid-cols-12 items-center text-xs p-1.5 rounded-lg border transition-all ${
                                isUser
                                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold'
                                  : isQualified
                                  ? 'bg-slate-850 border-slate-800/60 text-slate-200'
                                  : 'bg-slate-900 border-transparent text-slate-500'
                              }`}
                            >
                              <div className="col-span-6 flex items-center gap-1.5 min-w-0">
                                <span className={`text-[9px] font-bold text-center w-4 h-4 rounded-full flex items-center justify-center ${
                                  idx === 0 ? 'bg-yellow-500/20 text-yellow-400' : idx === 1 ? 'bg-slate-400/20 text-slate-300' : 'bg-slate-800 text-slate-600'
                                }`}>
                                  {idx + 1}
                                </span>
                                <span className="truncate">{row.name}</span>
                              </div>
                              <span className="col-span-2 text-center font-black">{row.points}</span>
                              <span className="col-span-2 text-center font-mono opacity-75">{row.played}</span>
                              <span className={`col-span-2 text-center font-mono font-bold ${
                                row.goalDifference > 0 ? 'text-emerald-500' : row.goalDifference < 0 ? 'text-red-500' : 'text-slate-400'
                              }`}>
                                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setExpandedGroupMatches(expandedGroupMatches === gKey ? null : gKey)}
                        className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase rounded-lg transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {expandedGroupMatches === gKey ? 'Ocultar Jogos' : 'Ver Jogos'}
                      </button>
                      {expandedGroupMatches === gKey && (
                        <div className="mt-4 border-t border-slate-800 pt-3 flex flex-col gap-2 max-h-60 overflow-y-auto pr-1 text-[10px]">
                          <GroupMatchesList
                            gKey={gKey}
                            groupTeams={store.groups?.[gKey] || []}
                            matchResults={store.matchResults}
                            currentGroupRound={store.currentGroupRound}
                            onSelectMatch={setSelectedMatch}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
          </div>
        </div>
      )}


      {activeTab === 'bracket' && store.isKnockoutDrawCompleted && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">Copa Libertadores</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Simule as fases eliminatórias e clique nas partidas concluídas para ver estatísticas e marcadores.
              </p>
            </div>
            {store.knockoutRound === 'ended' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider shrink-0">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Campeão: {store.champion?.name}
              </div>
            ) : (
              <button
                onClick={handleSimulateKnockout}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <Zap className="w-4 h-4" />
                {store.knockoutRound === 'R16' && 'Simular Oitavas'}
                {store.knockoutRound === 'QF' && 'Simular Quartas'}
                {store.knockoutRound === 'SF' && 'Simular Semifinais'}
                {store.knockoutRound === 'F' && 'Simular Grande Final'}
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-225 flex gap-6 items-stretch justify-between py-6">
              <div className="flex flex-col justify-around gap-8 flex-1">
                <h4 className="text-center font-black text-xs text-amber-500 uppercase tracking-widest mb-2">Oitavas de Final</h4>
                {store.knockoutMatches?.slice(0, 4).map(m => (
                  <div key={m.id} className="w-full">
                    {renderBracketMatch(m, "Team A", "Team B")}
                  </div>
                ))}
              </div>

              <div className="flex flex-col justify-around gap-12 flex-1">
                <h4 className="text-center font-black text-xs text-slate-400 uppercase tracking-widest mb-2">Quartas</h4>
                <div className="w-full">
                  {renderBracketMatch(store.qfMatches?.[0] ?? null, "Vencedor Oitava 1", "Vencedor Oitava 2")}
                </div>
                <div className="w-full">
                  {renderBracketMatch(store.qfMatches?.[1] ?? null, "Vencedor Oitava 3", "Vencedor Oitava 4")}
                </div>
              </div>

              <div className="flex flex-col justify-around gap-16 flex-1">
                <h4 className="text-center font-black text-xs text-slate-400 uppercase tracking-widest mb-2">Semifinal</h4>
                <div className="w-full">
                  {renderBracketMatch(store.sfMatches?.[0] ?? null, "Vencedor Quartas 1", "Vencedor Quartas 2")}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-8 items-center w-48 shrink-0 bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
                <Trophy className="w-10 h-10 text-amber-500 animate-bounce" />
                <div className="w-full text-center">
                  <h4 className="font-black text-xs text-amber-500 uppercase tracking-widest mb-4">Grande Final</h4>
                  <div className="w-full">
                    {renderBracketMatch(store.fMatch, "Finalista L", "Finalista R")}
                  </div>
                  {store.knockoutRound === 'ended' && store.champion && (
                    <div className="mt-4 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                      <span className="text-[10px] text-emerald-400 font-extrabold uppercase block">Campeão</span>
                      <span className="text-xs font-black text-white mt-1 block">{store.champion.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-around gap-16 flex-1">
                <h4 className="text-center font-black text-xs text-slate-400 uppercase tracking-widest mb-2">Semifinal</h4>
                <div className="w-full">
                  {renderBracketMatch(store.sfMatches?.[1] ?? null, "Vencedor Quartas 3", "Vencedor Quartas 4")}
                </div>
              </div>

              <div className="flex flex-col justify-around gap-12 flex-1">
                <h4 className="text-center font-black text-xs text-slate-400 uppercase tracking-widest mb-2">Quartas</h4>
                <div className="w-full">
                  {renderBracketMatch(store.qfMatches?.[2] ?? null, "Vencedor Oitava 5", "Vencedor Oitava 6")}
                </div>
                <div className="w-full">
                  {renderBracketMatch(store.qfMatches?.[3] ?? null, "Vencedor Oitava 7", "Vencedor Oitava 8")}
                </div>
              </div>

              <div className="flex flex-col justify-around gap-8 flex-1">
                <h4 className="text-center font-black text-xs text-amber-500 uppercase tracking-widest mb-2">Oitavas de Final</h4>
                {store.knockoutMatches?.slice(4, 8).map(m => (
                  <div key={m.id} className="w-full">
                    {renderBracketMatch(m, "Team A", "Team B")}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      </>)}

      {selectedMatch && (() => {
        const result = store.matchResults[selectedMatch.id];
        if (!result) return null;
        return (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl flex flex-col gap-6 relative animate-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedMatch(null)}
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
                  <div className={`w-14 h-14 rounded-full ${selectedMatch.teamA.logoColor} flex items-center justify-center text-white font-black text-xl border border-white/10 shadow-lg`}>
                    {selectedMatch.teamA.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-black text-white mt-2 text-center truncate w-full">
                    {selectedMatch.teamA.name}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                    {selectedMatch.teamA.country}
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
                  <div className={`w-14 h-14 rounded-full ${selectedMatch.teamB.logoColor} flex items-center justify-center text-white font-black text-xl border border-white/10 shadow-lg`}>
                    {selectedMatch.teamB.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm font-black text-white mt-2 text-center truncate w-full">
                    {selectedMatch.teamB.name}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                    {selectedMatch.teamB.country}
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
                      const isTeamA = ev.teamName === selectedMatch.teamA.name;
                      const isUserMatch = selectedMatch.teamA.id === 'user_team' || selectedMatch.teamB.id === 'user_team';
                      return (
                        <div
                          key={`${idx}-${ev.minute}`}
                          className={`flex items-start text-xs gap-2 ${isTeamA ? 'flex-row' : 'flex-row-reverse text-right'}`}
                        >
                          {isUserMatch && (
                            <span className="font-mono text-amber-500 font-bold shrink-0 mt-1">{ev.minute}&apos;</span>
                          )}
                          <div className={`px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 max-w-[85%] border text-[10px] leading-snug ${
                            ev.type === 'goal'
                              ? 'bg-emerald-950/20 border-emerald-500/35 text-slate-200'
                              : ev.type === 'foul'
                              ? 'bg-yellow-950/15 border-yellow-500/30 text-slate-300'
                              : 'bg-slate-950/30 border-slate-800 text-slate-300'
                          }`}>
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
                        const isTeamA = kick.teamId === 'A';
                        return (
                          <div
                            key={kIdx}
                            className={`flex items-start text-xs gap-2 ${isTeamA ? 'flex-row' : 'flex-row-reverse text-right'}`}
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
      })()}

      {liveSimulation && (() => {
        const isFinished = liveSimulation.currentMinute >= maxMinute;
        const userMatch = liveSimulation.matches.find(
          m => m.teamA.id === 'user_team' || m.teamB.id === 'user_team'
        );
        const mainMatch = userMatch || liveSimulation.matches[0];
        if (!mainMatch) return null;

        const { scoreA, scoreB, liveEvents } = getLiveScore(
          mainMatch.result.events,
          liveSimulation.currentMinute,
          mainMatch.teamA.name,
          mainMatch.teamB.name
        );

        const hasPenalties = mainMatch.result.penalties !== undefined;
        const shootout = mainMatch.result.penalties;

        if (isFinished && hasPenalties && showShootoutState !== 'completed') {
          const kicks = shootout!.kicks;
          const livePenScoreA = penaltyKicksHistory.filter(k => k.teamId === 'A' && k.isGoal).length;
          const livePenScoreB = penaltyKicksHistory.filter(k => k.teamId === 'B' && k.isGoal).length;
          const totalRoundsToShow = Math.max(5, Math.ceil(kicks.length / 2));
          const currentKick = kicks[activePenaltyKickIndex];

          const getKickStatus = (team: 'A' | 'B', r: number) => {
            const flatIndex = team === 'A' ? r * 2 : r * 2 + 1;
            const simulatedKick = kicks[flatIndex];
            if (!simulatedKick) return 'empty';
            if (flatIndex < penaltyKicksHistory.length) {
              return simulatedKick.isGoal ? 'goal' : 'miss';
            }
            if (flatIndex === activePenaltyKickIndex && !isPenaltyKicking && !showPenaltyResultEffect) {
              return 'active';
            }
            return 'empty';
          };

          const renderDot = (status: 'goal' | 'miss' | 'active' | 'empty', idx: number) => {
            switch (status) {
              case 'goal':
                return (
                  <div key={idx} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 border border-emerald-400 shadow-lg shadow-emerald-500/20 flex items-center justify-center font-bold text-slate-950 text-[10px] sm:text-xs shrink-0 animate-in zoom-in duration-300">
                    ⚽
                  </div>
                );
              case 'miss':
                return (
                  <div key={idx} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 border border-red-400 shadow-lg shadow-red-500/20 flex items-center justify-center font-bold text-white text-[10px] sm:text-xs shrink-0 animate-in zoom-in duration-300">
                    ❌
                  </div>
                );
              case 'active':
                return (
                  <div key={idx} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-800 border-2 border-amber-500 animate-pulse shrink-0" />
                );
              case 'empty':
              default:
                return (
                  <div key={idx} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-850 border border-slate-700 shrink-0" />
                );
            }
          };

          return (
            <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-50 p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
              <div className="max-w-3xl mx-auto w-full flex flex-col min-h-full justify-between gap-4 py-2 sm:py-4">
                
                <div className="text-center flex flex-col items-center">
                  <span className="text-[10px] bg-red-500/10 border border-red-500/20 px-3 py-0.5 rounded-full text-red-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-red-500 animate-ping" />
                    Decisão por Pênaltis
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-2">
                    Disputa de Pênaltis
                  </h2>
                  <p className="text-slate-400 text-[10px] sm:text-xs mt-0.5">
                    Placar do tempo normal: {scoreA} x {scoreB}
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4">
                  
                  <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full ${mainMatch.teamA.logoColor} border border-white/10 shadow-lg flex items-center justify-center text-white font-black text-base sm:text-lg`}>
                        {mainMatch.teamA.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs sm:text-sm font-black text-white mt-1.5 text-center truncate w-full">
                        {mainMatch.teamA.name}
                      </span>
                    </div>

                    <div className="flex flex-col items-center shrink-0 px-2 sm:px-4">
                      <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-center gap-3">
                        <span className="text-emerald-400">{livePenScoreA}</span>
                        <span className="text-slate-700 text-xl font-normal">:</span>
                        <span className="text-emerald-400">{livePenScoreB}</span>
                      </div>
                      <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Pênaltis</span>
                    </div>

                    <div className="flex flex-col items-center flex-1 min-w-0">
                      <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full ${mainMatch.teamB.logoColor} border border-white/10 shadow-lg flex items-center justify-center text-white font-black text-base sm:text-lg`}>
                        {mainMatch.teamB.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-xs sm:text-sm font-black text-white mt-1.5 text-center truncate w-full">
                        {mainMatch.teamB.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 bg-slate-950/40 border border-slate-850 rounded-2xl p-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800/60 pb-2.5">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-wider shrink-0 w-20 sm:w-24 truncate">
                        {mainMatch.teamA.name}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: totalRoundsToShow }).map((_, r) => 
                          renderDot(getKickStatus('A', r), r)
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-wider shrink-0 w-20 sm:w-24 truncate">
                        {mainMatch.teamB.name}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.from({ length: totalRoundsToShow }).map((_, r) => 
                          renderDot(getKickStatus('B', r), r)
                        )}
                      </div>
                    </div>
                  </div>

                  {showShootoutState === 'active' && currentKick && (
                    <div className="relative">
                      {isPenaltyKicking ? (
                        <div className="h-28 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 animate-pulse">
                          <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                          <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider">
                            Cobrando Pênalti...
                          </span>
                        </div>
                      ) : showPenaltyResultEffect ? (
                        <div className="h-28 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 p-3 text-center animate-in zoom-in duration-300">
                          {currentKick.isGoal ? (
                            <>
                              <span className="text-3xl font-black text-emerald-400 tracking-wider animate-bounce">
                                GOL!
                              </span>
                              <p className="text-[10px] text-slate-200 font-medium mt-0.5">
                                {currentKick.kickerName} cobrou com classe e converteu!
                              </p>
                            </>
                          ) : (
                            <>
                              <span className="text-3xl font-black text-red-500 tracking-wider animate-bounce">
                                PERDEU!
                              </span>
                              <p className="text-[10px] text-slate-200 font-medium mt-0.5">
                                {currentKick.gkName} defendeu ou a bola foi para fora!
                              </p>
                            </>
                          )}
                        </div>
                      ) : (
                        <div className="grid grid-cols-7 items-center bg-slate-950/50 border border-slate-800/80 rounded-2xl overflow-hidden min-h-24 h-24">
                          
                          <div className="col-span-3 p-2 flex flex-col items-center text-center">
                            <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider mb-1">
                              Batedor
                            </span>
                            <div className="text-[10px] sm:text-xs font-black text-white truncate max-w-full">{currentKick.kickerName}</div>
                            <div className={`text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase mt-1 ${
                              currentKick.teamId === 'A' ? 'bg-amber-500 text-slate-950' : 'bg-blue-500 text-white'
                            }`}>
                              {currentKick.teamId === 'A' ? mainMatch.teamA.name.slice(0, 3) : mainMatch.teamB.name.slice(0, 3)}
                            </div>
                          </div>

                          <div className="col-span-1 py-3 flex flex-col items-center justify-center border-x border-slate-800/60 min-h-full bg-slate-950/80">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">VS</span>
                          </div>

                          <div className="col-span-3 p-2 flex flex-col items-center text-center">
                            <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider mb-1">
                              Goleiro
                            </span>
                            <div className="text-[10px] sm:text-xs font-black text-white truncate max-w-full">{currentKick.gkName}</div>
                            <div className={`text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase mt-1 ${
                              currentKick.teamId === 'A' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-slate-950'
                            }`}>
                              {currentKick.teamId === 'A' ? mainMatch.teamB.name.slice(0, 3) : mainMatch.teamA.name.slice(0, 3)}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  )}

                  {showShootoutState === 'not_started' && (
                    <div className="h-28 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1.5 p-4 text-center">
                      <span className="text-sm font-black text-white uppercase tracking-tight">Decisão Dramática!</span>
                      <p className="text-slate-400 text-[10px] max-w-sm">
                        O jogo terminou empatado e irá para a disputa de pênaltis. Prepare o seu coração!
                      </p>
                    </div>
                  )}

                </div>

                <div className="flex flex-wrap justify-center gap-4">
                  {showShootoutState === 'not_started' ? (
                    <>
                      <button
                        onClick={() => setShowShootoutState('active')}
                        className="px-6 py-3 bg-linear-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-lg shadow-amber-500/10 animate-bounce-slow"
                      >
                        Iniciar Decisão por Pênaltis
                      </button>
                      <button
                        onClick={() => {
                          setPenaltyKicksHistory(kicks);
                          setActivePenaltyKickIndex(kicks.length);
                          setShowShootoutState('completed');
                        }}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 border border-slate-750"
                      >
                        Pular para o Placar Final
                      </button>
                    </>
                  ) : showShootoutState === 'active' ? (
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-slate-400 font-extrabold uppercase tracking-wider">
                        {isPenaltyKicking
                          ? 'Simulando cobrança...'
                          : showPenaltyResultEffect
                          ? 'Visualizando resultado...'
                          : 'Preparando cobrador...'}
                      </span>
                      <button
                        onClick={() => {
                          setPenaltyKicksHistory(kicks);
                          setActivePenaltyKickIndex(kicks.length);
                          setShowShootoutState('completed');
                        }}
                        className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 border border-slate-750"
                      >
                        Pular para o Placar Final
                      </button>
                    </div>
                  ) : null}
                </div>

              </div>
            </div>
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

        const scoreAColor = isGoalAJustScored
          ? (isOpponentGoalA ? 'text-red-500 animate-bounce scale-125' : 'text-emerald-400 animate-bounce scale-125')
          : 'text-white';
        const scoreBColor = isGoalBJustScored
          ? (isOpponentGoalB ? 'text-red-500 animate-bounce scale-125' : 'text-emerald-400 animate-bounce scale-125')
          : 'text-white';

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
          <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-50 p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="max-w-4xl mx-auto w-full flex flex-col min-h-full justify-between gap-4">
              
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
                
                <div className="md:col-span-2 flex flex-col gap-4">
                  
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-4 mb-6">
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
                  
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col gap-4">
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
                
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-100">
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
                        return (
                          <div
                            key={`${eIdx}-${ev.minute}`}
                            className={`flex items-start text-xs gap-2 ${isTeamA ? 'flex-row' : 'flex-row-reverse text-right'}`}
                          >
                            <span className="font-mono text-amber-500 font-bold shrink-0 mt-1">{ev.minute}&apos;</span>
                            <div className={`px-2.5 py-1.5 rounded-xl inline-flex items-center gap-1.5 max-w-[85%] border text-[10px] leading-snug ${
                              ev.type === 'goal'
                                ? 'bg-emerald-950/20 border-emerald-500/35 text-slate-200'
                                : ev.type === 'foul'
                                ? 'bg-yellow-950/15 border-yellow-500/30 text-slate-300'
                                : 'bg-slate-950/30 border-slate-800 text-slate-300'
                            }`}>
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
                          const isTeamA = kick.teamId === 'A';
                          return (
                            <div
                              key={kIdx}
                              className={`flex items-start text-xs gap-2 ${isTeamA ? 'flex-row' : 'flex-row-reverse text-right'}`}
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
                      return (
                        <div
                          key={m.id || idx}
                          className={`p-2 bg-slate-900 border rounded-xl flex flex-col gap-0.5 items-center justify-center transition-all duration-300 relative ${
                            hasJustScored
                              ? 'bg-emerald-950/40 border-emerald-500 scale-105 animate-pulse'
                              : isSameGroup
                              ? 'bg-amber-950/15 border-amber-500/50 shadow-lg shadow-amber-500/5 scale-105'
                              : 'border-slate-800/60'
                          }`}
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

              <div className="flex justify-center gap-4 py-2">
                {!isFinished ? (
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
                    Pular Simulacao
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      liveSimulation.onComplete();
                    }}
                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95"
                  >
                    Fechar Painel
                  </button>
                )}
              </div>

            </div>
          </div>
        );
      })()}
    </div>
  );
}
