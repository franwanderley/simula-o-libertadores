"use client";

import { useState, useEffect } from 'react';
import { Trophy, Zap, RefreshCw, ArrowRight, CheckCircle2, Lock, Share2 } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';
import { OpponentTeam, KnockoutMatch, MatchResult } from '../types/game';
import { MatchDetailsModal } from './MatchDetailsModal';
import { LiveSimulationOverlay } from './LiveSimulationOverlay';
import { GroupMatchesList } from './GroupMatchesList';
import { checkUserElimination } from '../utils/tournament';
import { GROUP_KEYS } from '../utils/groupKeys';

const SLOT_POSITIONS: Record<string, { top: string; left: string }> = {
  gk: { top: '91%', left: '50%' },
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

const ELIMINATION_MESSAGES: Record<string, string> = {
  'Vice-Campeão': 'Vice-Campeão da Libertadores!',
  'Oitavas de Final': 'Eliminado nas Oitavas de Final',
  'Quartas de Final': 'Eliminado nas Quartas de Final',
};

const TEAM_COLOR_MAP = {
  user: 'text-amber-400 font-extrabold',
  loser: 'text-slate-500 line-through',
  default: 'text-slate-200 font-bold',
} as const;

const getTeamColorKey = (teamId: string, winnerId: string | null | undefined, isCompleted: boolean) => {
  if (teamId === 'user_team') return 'user';
  if (isCompleted && winnerId !== teamId) return 'loser';
  return 'default';
};

const STANDINGS_ROW_STYLE_MAP = {
  user: 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-bold',
  qualified: 'bg-slate-850 border-slate-800/60 text-slate-200',
  default: 'bg-slate-900 border-transparent text-slate-500',
} as const;

const getStandingsRowStyleKey = (isUser: boolean, isQualified: boolean) => {
  if (isUser) return 'user';
  if (isQualified) return 'qualified';
  return 'default';
};

const STANDINGS_RANK_STYLE_MAP = {
  first: 'bg-yellow-500/20 text-yellow-400',
  second: 'bg-slate-400/20 text-slate-300',
  default: 'bg-slate-800 text-slate-600',
} as const;

const getStandingsRankStyleKey = (idx: number) => {
  if (idx === 0) return 'first';
  if (idx === 1) return 'second';
  return 'default';
};

const GOAL_DIFF_STYLE_MAP = {
  positive: 'text-emerald-500',
  negative: 'text-red-500',
  neutral: 'text-slate-400',
} as const;

const getGoalDiffStyleKey = (gd: number) => {
  if (gd > 0) return 'positive';
  if (gd < 0) return 'negative';
  return 'neutral';
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
  const [showAllGroupsMobile, setShowAllGroupsMobile] = useState(false);

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

  const eliminationMessage = isUserEliminated
    ? (ELIMINATION_MESSAGES[isUserEliminated.eliminatedAt] ?? `Eliminado na ${isUserEliminated.eliminatedAt}`)
    : '';

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

  const getMaxMinute = (matches: { result: MatchResult }[]) => {
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

  const renderBracketMatch = (m: KnockoutMatch | null, labelA: string, labelB: string) => {
    if (!m) {
      return (
        <div className="bg-slate-850/20 border border-dashed border-slate-800 rounded-xl p-3 flex flex-col gap-2">
          <span className="text-[10px] text-slate-500 font-bold">{labelA}</span>
          <span className="text-[10px] text-slate-500 font-bold">{labelB}</span>
        </div>
      );
    }
    const isCompleted = !!(m.winnerId && m.scores && m.scores.length > 0);
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
            <span className={`text-xs truncate ${TEAM_COLOR_MAP[getTeamColorKey(m.teamA.id, m.winnerId, isCompleted)]}`}>
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
            <span className={`text-xs truncate ${TEAM_COLOR_MAP[getTeamColorKey(m.teamB.id, m.winnerId, isCompleted)]}`}>
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
    setLiveSimulation({
      matches: formattedMatches,
      currentMinute: 0,
      title,
      onComplete: () => {
        useGameStore.getState().advanceKnockoutRound();
        setLiveSimulation(null);
      }
    });
  };

  const handleResetTournament = () => {
    store.resetDraw();
    props.onReset();
  };

  const groupKeys = GROUP_KEYS;
  let userGroupKey = '';
  if (store.groups) {
    for (const [gKey, teams] of Object.entries(store.groups)) {
      if (teams.some(t => t.id === 'user_team')) {
        userGroupKey = gKey;
        break;
      }
    }
  }
  const orderedGroupKeys = userGroupKey
    ? [userGroupKey, ...groupKeys.filter(k => k !== userGroupKey)]
    : groupKeys;

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
                {eliminationMessage}
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

            <div className="flex flex-col sm:flex-row gap-3">
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
            {store.isGroupSimulated ? (
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
            ) : (
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
            )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {orderedGroupKeys.map(gKey => {
                  const standings = store.groupStandings?.[gKey] || [];
                  const isUserGroup = gKey === userGroupKey;
                  const hideOnMobile = !isUserGroup && !showAllGroupsMobile;
                  return (
                    <div
                      key={gKey}
                      className={`bg-slate-900 border border-slate-800/80 rounded-2xl p-4 shadow-lg hover:border-slate-700/50 transition-all duration-300 ${
                        hideOnMobile ? 'hidden sm:block' : 'block'
                      }`}
                    >
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
                                STANDINGS_ROW_STYLE_MAP[getStandingsRowStyleKey(isUser, isQualified)]
                              }`}
                            >
                              <div className="col-span-6 flex items-center gap-1.5 min-w-0">
                                <span className={`text-[9px] font-bold text-center w-4 h-4 rounded-full flex items-center justify-center ${
                                  STANDINGS_RANK_STYLE_MAP[getStandingsRankStyleKey(idx)]
                                }`}>
                                  {idx + 1}
                                </span>
                                <span className="truncate">{row.name}</span>
                              </div>
                              <span className="col-span-2 text-center font-black">{row.points}</span>
                              <span className="col-span-2 text-center font-mono opacity-75">{row.played}</span>
                              <span className={`col-span-2 text-center font-mono font-bold ${
                                GOAL_DIFF_STYLE_MAP[getGoalDiffStyleKey(row.goalDifference)]
                              }`}>
                                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <button
                        onClick={() => setExpandedGroupMatches(expandedGroupMatches === gKey ? null : gKey)}
                        className={`mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase rounded-lg transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer ${
                          !isUserGroup ? 'hidden sm:flex' : 'flex'
                        }`}
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
              <div className="sm:hidden flex justify-center mt-4">
                <button
                  onClick={() => setShowAllGroupsMobile(prev => !prev)}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95"
                >
                  {showAllGroupsMobile ? 'Esconder outros grupos' : 'Ver outros grupos'}
                </button>
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

      {selectedMatch && store.matchResults[selectedMatch.id] && (
        <MatchDetailsModal
          match={selectedMatch}
          result={store.matchResults[selectedMatch.id]}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {liveSimulation && (
        <LiveSimulationOverlay
          liveSimulation={liveSimulation}
          setLiveSimulation={setLiveSimulation}
          maxMinute={maxMinute}
        />
      )}
    </div>
  );
}
