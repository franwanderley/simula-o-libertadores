"use client";

import { useState, useEffect, useRef } from 'react';
import { Trophy, Zap, Shuffle, RefreshCw, ArrowRight, CheckCircle2, Lock, X } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';
import { OpponentTeam, KnockoutMatch } from '../app/types/game';
import { MatchEvent, MatchResult } from '../utils/matchSimulator';

const getMatchRound = (i: number, j: number): number => {
  if ((i === 0 && j === 1) || (i === 2 && j === 3)) return 1;
  if ((i === 0 && j === 2) || (i === 1 && j === 3)) return 2;
  if ((i === 0 && j === 3) || (i === 1 && j === 2)) return 3;
  if ((i === 1 && j === 0) || (i === 3 && j === 2)) return 4;
  if ((i === 2 && j === 0) || (i === 3 && j === 1)) return 5;
  if ((i === 3 && j === 0) || (i === 2 && j === 1)) return 6;
  return 1;
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

export function TournamentStep({ onReset }: TournamentStepProps) {
  const store = useGameStore();
  const feedRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState<'groups' | 'draw' | 'bracket'>('groups');
  const [revealedCount, setRevealedCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
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
      if (m.result && m.result.events) {
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
    
    return (
      <button
        onClick={() => {
          if (isCompleted) {
            setSelectedMatch({
              id: m.id,
              teamA: m.teamA,
              teamB: m.teamB
            });
          }
        }}
        className={`w-full text-left bg-slate-850/85 border border-slate-800 rounded-xl p-3 relative flex flex-col gap-2 shadow-md transition-all ${
          isCompleted ? 'hover:border-amber-500 hover:bg-slate-800/90 cursor-pointer' : ''
        }`}
      >
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-5 h-5 rounded-full ${m.teamA.logoColor} flex items-center justify-center font-black text-[8px] text-white shrink-0`}>
              {m.teamA.name.slice(0, 2).toUpperCase()}
            </div>
            <span className={`text-xs font-bold truncate ${isCompleted && m.winnerId !== m.teamA.id ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
              {m.teamA.name}
            </span>
          </div>
          {isCompleted && <span className="text-xs font-black text-white px-1.5">{scoreHome}</span>}
        </div>
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`w-5 h-5 rounded-full ${m.teamB.logoColor} flex items-center justify-center font-black text-[8px] text-white shrink-0`}>
              {m.teamB.name.slice(0, 2).toUpperCase()}
            </div>
            <span className={`text-xs font-bold truncate ${isCompleted && m.winnerId !== m.teamB.id ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
              {m.teamB.name}
            </span>
          </div>
          {isCompleted && <span className="text-xs font-black text-white px-1.5">{scoreAway}</span>}
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
        name: 'Seu Time (Draft)',
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
  }, [initializePots, runGroupDraw, attackOverall, defenseOverall, teamChemistry, isDrawCompleted]);

  const handleSimulateGroups = () => {
    store.simulateGroupStage();
  };

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
    setLiveSimulation({
      matches: roundMatches,
      currentMinute: 0,
      title: `Rodada ${round} - Fase de Grupos`,
      onComplete: () => {
        store.advanceGroupRound();
        setLiveSimulation(null);
      }
    });
  };

  const handleSkipRound = () => {
    store.advanceGroupRound();
  };

  const handleSkipAllGroups = () => {
    let r = store.currentGroupRound;
    while (r < 6) {
      store.advanceGroupRound();
      r++;
    }
  };

  const handleSimulateKnockout = () => {
    const roundBefore = store.knockoutRound;
    store.simulateKnockoutRound();
    let matchesToSim: KnockoutMatch[] = [];
    if (roundBefore === 'R16' && store.knockoutMatches) {
      matchesToSim = store.knockoutMatches;
    } else if (roundBefore === 'QF' && store.qfMatches) {
      matchesToSim = store.qfMatches;
    } else if (roundBefore === 'SF' && store.sfMatches) {
      matchesToSim = store.sfMatches;
    } else if (roundBefore === 'F' && store.fMatch) {
      matchesToSim = [store.fMatch];
    }
    const formattedMatches = matchesToSim.map(m => ({
      id: m.id,
      teamA: m.teamA,
      teamB: m.teamB,
      result: store.matchResults[m.id]
    })).filter(m => m.result !== undefined);
    let title = 'Oitavas de Final - Simulação ao Vivo';
    if (roundBefore === 'QF') {
      title = 'Quartas de Final - Simulação ao Vivo';
    } else if (roundBefore === 'SF') {
      title = 'Semifinais - Simulação ao Vivo';
    } else if (roundBefore === 'F') {
      title = 'Grande Final - Simulação ao Vivo';
    }
    setLiveSimulation({
      matches: formattedMatches,
      currentMinute: 0,
      title,
      onComplete: () => {
        setLiveSimulation(null);
      }
    });
  };

  const handleStartKnockoutDraw = () => {
    setIsDrawing(true);
    setRevealedCount(0);
    store.runKnockoutDraw();
    
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setRevealedCount(current);
      if (current >= 8) {
        clearInterval(interval);
        setIsDrawing(false);
      }
    }, 1200);
  };

  const handleResetTournament = () => {
    store.resetDraw();
    onReset();
  };

  const groupKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6">
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
            if (store.isGroupSimulated) setActiveTab('draw');
          }}
          disabled={!store.isGroupSimulated}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            !store.isGroupSimulated ? 'opacity-40 cursor-not-allowed text-slate-500' : 'cursor-pointer'
          } ${activeTab === 'draw' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
        >
          {!store.isGroupSimulated && <Lock className="w-3.5 h-3.5" />}
          Sorteio Oitavas
        </button>
        <button
          onClick={() => {
            if (store.isKnockoutDrawCompleted) setActiveTab('bracket');
          }}
          disabled={!store.isKnockoutDrawCompleted}
          className={`flex-1 py-3 text-center text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
            !store.isKnockoutDrawCompleted ? 'opacity-40 cursor-not-allowed text-slate-500' : 'cursor-pointer'
          } ${activeTab === 'bracket' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
        >
          {!store.isKnockoutDrawCompleted && <Lock className="w-3.5 h-3.5" />}
          Chaveamento
        </button>
      </div>

      {activeTab === 'groups' && (
        <div className="flex flex-col gap-6">
          {store.groupStandings === null ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-2xl mx-auto w-full relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl" />
              <Zap className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Fase de Grupos Definida!</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                Os grupos foram sorteados e os adversários estão definidos. Clique abaixo para iniciar a fase de grupos e jogar rodada por rodada.
              </p>
              <button
                onClick={handleSimulateGroups}
                className="mt-6 px-8 py-4 bg-linear-to-r from-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 transition-all duration-200 cursor-pointer text-sm"
              >
                Iniciar Fase de Grupos
              </button>
            </div>
          ) : (
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
                            Proximo Jogo: {isHome ? 'Seu Time' : opponent.name} vs {isHome ? opponent.name : 'Seu Time'}
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
                    <button
                      onClick={handleSkipAllGroups}
                      className="px-4 py-3.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 font-bold uppercase rounded-xl active:scale-95 transition-all duration-200 cursor-pointer text-xs flex items-center justify-center gap-1"
                    >
                      Simular Tudo
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
                    onClick={() => setActiveTab('draw')}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5"
                  >
                    Ir para Sorteio do Mata-Mata <ArrowRight className="w-4 h-4" />
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
                          {(() => {
                            const groupTeams = store.groups?.[gKey] || [];
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
                            return matchesList.map((match, mIdx) => {
                              const result = store.matchResults[match.resultId];
                              const i = groupTeams.findIndex(t => t.id === match.teamA.id);
                              const j = groupTeams.findIndex(t => t.id === match.teamB.id);
                              const matchRound = getMatchRound(i, j);
                              const isPlayed = matchRound <= store.currentGroupRound;
                              return (
                                <button
                                  key={mIdx}
                                  onClick={() => {
                                    if (isPlayed) {
                                      setSelectedMatch({
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
                                      <span className="text-slate-500 font-sans font-bold text-[8px] uppercase tracking-wider">R{matchRound}</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 min-w-0 max-w-[42%] justify-end text-right">
                                    <span className="truncate text-slate-300">{match.teamB.name}</span>
                                  </div>
                                </button>
                              );
                            });
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'draw' && (
        <div className="flex flex-col gap-6">
          {!store.isKnockoutDrawCompleted && !isDrawing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto w-full">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-black text-sm text-yellow-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
                  Pote A (Líderes dos Grupos)
                </h3>
                <div className="flex flex-col gap-2">
                  {store.knockoutPots?.potA.map(t => {
                    const avg = Math.round((t.attackOverall + t.defenseOverall) / 2);
                    return (
                      <div key={t.id} className="flex items-center justify-between p-2.5 bg-slate-850 border border-slate-800/60 rounded-xl">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-full ${t.logoColor} flex items-center justify-center font-black text-[10px] text-white`}>
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs text-slate-200 font-bold truncate">{t.name}</span>
                        </div>
                        {t.id === 'user_team' && <span className="text-[10px] text-slate-400 font-mono">{avg} OVR</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h3 className="font-black text-sm text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-2 mb-4">
                  Pote B (Vice-Líderes)
                </h3>
                <div className="flex flex-col gap-2">
                  {store.knockoutPots?.potB.map(t => {
                    const avg = Math.round((t.attackOverall + t.defenseOverall) / 2);
                    return (
                      <div key={t.id} className="flex items-center justify-between p-2.5 bg-slate-850 border border-slate-800/60 rounded-xl">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7 h-7 rounded-full ${t.logoColor} flex items-center justify-center font-black text-[10px] text-white`}>
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs text-slate-300 truncate">{t.name}</span>
                        </div>
                        {t.id === 'user_team' && <span className="text-[10px] text-slate-400 font-mono">{avg} OVR</span>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleStartKnockoutDraw}
                className="md:col-span-2 py-4 bg-linear-to-r from-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
              >
                <Shuffle className="w-5 h-5" /> Sortear Oitavas de Final
              </button>
            </div>
          ) : (
            <div className="max-w-xl mx-auto w-full flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-base font-black text-white uppercase tracking-tight">Sorteando Confrontos</h3>
                  <span className="text-xs font-black text-amber-500 uppercase tracking-widest">
                    {revealedCount} / 8
                  </span>
                </div>

                <div className="flex flex-col gap-3 min-h-75">
                  {store.knockoutMatches?.slice(0, revealedCount).map((m, idx) => {
                    const avgA = Math.round((m.teamA.attackOverall + m.teamA.defenseOverall) / 2);
                    const avgB = Math.round((m.teamB.attackOverall + m.teamB.defenseOverall) / 2);
                    return (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3 bg-slate-850 border border-slate-800 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-300"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 w-2/5 justify-end text-right">
                          {m.teamA.id === 'user_team' && <span className="text-[10px] text-slate-400 font-mono mr-1">({avgA} OVR)</span>}
                          <span className="text-xs font-bold text-slate-200 truncate">{m.teamA.name}</span>
                          <div className={`w-7 h-7 rounded-full ${m.teamA.logoColor} flex items-center justify-center font-black text-[10px] text-white shrink-0 ml-2`}>
                            {m.teamA.name.slice(0, 2).toUpperCase()}
                          </div>
                        </div>

                        <div className="flex flex-col items-center shrink-0 px-2">
                          <span className="text-[8px] font-black uppercase bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 mb-1">
                            Jogo {idx + 1}
                          </span>
                          <span className="text-xs font-black text-amber-500 uppercase tracking-widest">VS</span>
                        </div>

                        <div className="flex items-center gap-2.5 min-w-0 w-2/5 justify-start text-left">
                          <div className={`w-7 h-7 rounded-full ${m.teamB.logoColor} flex items-center justify-center font-black text-[10px] text-white shrink-0 mr-2`}>
                            {m.teamB.name.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-slate-200 truncate">{m.teamB.name}</span>
                          {m.teamB.id === 'user_team' && <span className="text-[10px] text-slate-400 font-mono ml-1">({avgB} OVR)</span>}
                        </div>
                      </div>
                    );
                  })}

                  {revealedCount < 8 && (
                    <div className="flex-1 border border-dashed border-slate-800 rounded-2xl flex items-center justify-center p-8 bg-slate-900/50">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                        <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                          Sorteando confronto {revealedCount + 1}...
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {revealedCount >= 8 && (
                  <button
                    onClick={() => setActiveTab('bracket')}
                    className="mt-6 w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm animate-in fade-in"
                  >
                    Ver Chaveamento Completo <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          )}
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
            {store.knockoutRound !== 'ended' ? (
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
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider shrink-0">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Campeão: {store.champion?.name}
              </div>
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
                    <span className="text-slate-600 text-lg font-medium">x</span>
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
                      return (
                        <div
                          key={`${idx}-${ev.minute}`}
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
                            {ev.type === 'foul' && <span className="text-yellow-400 shrink-0">🟨</span>}
                            <span className="break-words">{ev.description}</span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-500 font-medium">
                      Sem gols na partida.
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
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono mt-1">
                          OVR {Math.round((mainMatch.teamA.attackOverall + mainMatch.teamA.defenseOverall) / 2)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center shrink-0 px-4">
                        <div className="text-5xl font-black font-mono text-white tracking-tight flex items-center gap-3">
                          <span>{scoreA}</span>
                          <span className="text-slate-600 text-xl font-normal">:</span>
                          <span>{scoreB}</span>
                        </div>
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
                        <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono mt-1">
                          OVR {Math.round((mainMatch.teamB.attackOverall + mainMatch.teamB.defenseOverall) / 2)}
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
                
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col h-[400px]">
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
                              {ev.type === 'foul' && <span className="text-yellow-400 shrink-0">🟨</span>}
                              <span className="break-words">{ev.description}</span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-xs text-slate-500 font-medium">
                        Jogo truncado no meio de campo. Sem lances perigosos ainda.
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
                      return (
                        <div
                          key={m.id || idx}
                          className={`p-2 bg-slate-900 border rounded-xl flex flex-col gap-0.5 items-center justify-center transition-all duration-300 ${
                            hasJustScored
                              ? 'bg-emerald-950/40 border-emerald-500 scale-105 animate-pulse'
                              : 'border-slate-800/60'
                          }`}
                        >
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
