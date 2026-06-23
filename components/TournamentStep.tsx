"use client";

import { useState, useEffect } from 'react';
import { Trophy, Zap, Shuffle, RefreshCw, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';

interface TournamentStepProps {
  onReset: () => void;
}

export function TournamentStep({ onReset }: TournamentStepProps) {
  const store = useGameStore();
  const [activeTab, setActiveTab] = useState<'groups' | 'draw' | 'bracket'>('groups');
  const [revealedCount, setRevealedCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);

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
          {!store.isGroupSimulated ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center max-w-2xl mx-auto w-full relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl" />
              <Zap className="w-12 h-12 text-amber-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Fase de Grupos Definida!</h3>
              <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                Os grupos foram sorteados e os adversários estão definidos. Clique abaixo para simular todas as 6 rodadas instantaneamente e definir quem avança para o mata-mata.
              </p>
              <button
                onClick={handleSimulateGroups}
                className="mt-6 px-8 py-4 bg-linear-to-r from-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 transition-all duration-200 cursor-pointer text-sm"
              >
                Simular Fase de Grupos
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Fase de Grupos Concluída</span>
                </div>
                <button
                  onClick={() => setActiveTab('draw')}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-1.5"
                >
                  Ir para Sorteio do Mata-Mata <ArrowRight className="w-4 h-4" />
                </button>
              </div>

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
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {groupKeys.map(gKey => {
              const teams = store.groups?.[gKey] || [];
              if (store.isGroupSimulated) return null;
              return (
                <div key={gKey} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                  <h4 className="font-black text-xs text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3">
                    Grupo {gKey}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {teams.map(t => {
                      const isUser = t.id === 'user_team';
                      const avg = Math.round((t.attackOverall + t.defenseOverall) / 2);
                      return (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between p-2 rounded-lg border ${
                            isUser
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                              : 'bg-slate-800/40 border-slate-800/50 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-6 h-6 rounded-full ${t.logoColor} border border-white/5 flex items-center justify-center font-black text-[9px] text-white shrink-0`}>
                              {t.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="truncate text-xs">{t.name}</span>
                          </div>
                          {isUser && <span className="text-[10px] opacity-75 font-mono shrink-0">{avg} OVR</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-x-auto">
          <div className="min-w-225 flex gap-6 items-stretch justify-between py-6">
            <div className="flex flex-col justify-around gap-8 flex-1">
              <h4 className="text-center font-black text-xs text-amber-500 uppercase tracking-widest mb-2">Oitavas de Final</h4>
              {store.knockoutMatches?.slice(0, 4).map(m => (
                <div key={m.id} className="bg-slate-850/80 border border-slate-800 rounded-xl p-3 relative flex flex-col gap-2 shadow-md">
                  <div className="absolute right-3 top-2.5 text-[8px] font-black uppercase text-slate-500">Chave L1</div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-5 h-5 rounded-full ${m.teamA.logoColor} flex items-center justify-center font-black text-[8px] text-white shrink-0`}>
                      {m.teamA.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate">{m.teamA.name}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-5 h-5 rounded-full ${m.teamB.logoColor} flex items-center justify-center font-black text-[8px] text-white shrink-0`}>
                      {m.teamB.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-400 truncate">{m.teamB.name}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col justify-around gap-12 flex-1">
              <h4 className="text-center font-black text-xs text-slate-400 uppercase tracking-widest mb-2">Quartas</h4>
              <div className="bg-slate-850/40 border border-dashed border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Oitava 1</span>
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Oitava 2</span>
              </div>
              <div className="bg-slate-850/40 border border-dashed border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Oitava 3</span>
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Oitava 4</span>
              </div>
            </div>

            <div className="flex flex-col justify-around gap-16 flex-1">
              <h4 className="text-center font-black text-xs text-slate-400 uppercase tracking-widest mb-2">Semifinal</h4>
              <div className="bg-slate-850/40 border border-dashed border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Quartas 1</span>
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Quartas 2</span>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-8 items-center w-48 shrink-0 bg-slate-950/40 border border-slate-800 rounded-2xl p-4">
              <Trophy className="w-10 h-10 text-amber-500 animate-bounce" />
              <div className="w-full text-center">
                <h4 className="font-black text-xs text-amber-500 uppercase tracking-widest mb-4">Grande Final</h4>
                <div className="bg-slate-850/40 border border-dashed border-slate-800 rounded-xl p-3 flex flex-col gap-2 w-full">
                  <span className="text-[9px] text-slate-500 font-black">Finalista L</span>
                  <span className="text-[9px] text-slate-500 font-black">Finalista R</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-around gap-16 flex-1">
              <h4 className="text-center font-black text-xs text-slate-400 uppercase tracking-widest mb-2">Semifinal</h4>
              <div className="bg-slate-850/40 border border-dashed border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Quartas 3</span>
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Quartas 4</span>
              </div>
            </div>

            <div className="flex flex-col justify-around gap-12 flex-1">
              <h4 className="text-center font-black text-xs text-slate-400 uppercase tracking-widest mb-2">Quartas</h4>
              <div className="bg-slate-850/40 border border-dashed border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Oitava 5</span>
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Oitava 6</span>
              </div>
              <div className="bg-slate-850/40 border border-dashed border-slate-800 rounded-xl p-3 flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Oitava 7</span>
                <span className="text-[10px] text-slate-500 font-bold">Vencedor Oitava 8</span>
              </div>
            </div>

            <div className="flex flex-col justify-around gap-8 flex-1">
              <h4 className="text-center font-black text-xs text-amber-500 uppercase tracking-widest mb-2">Oitavas de Final</h4>
              {store.knockoutMatches?.slice(4, 8).map(m => (
                <div key={m.id} className="bg-slate-850/80 border border-slate-800 rounded-xl p-3 relative flex flex-col gap-2 shadow-md">
                  <div className="absolute right-3 top-2.5 text-[8px] font-black uppercase text-slate-500">Chave R1</div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-5 h-5 rounded-full ${m.teamA.logoColor} flex items-center justify-center font-black text-[8px] text-white shrink-0`}>
                      {m.teamA.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-200 truncate">{m.teamA.name}</span>
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-5 h-5 rounded-full ${m.teamB.logoColor} flex items-center justify-center font-black text-[8px] text-white shrink-0`}>
                      {m.teamB.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-400 truncate">{m.teamB.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
