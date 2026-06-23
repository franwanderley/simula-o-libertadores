"use client";

import { useEffect, useMemo } from 'react';
import { Trophy, Shuffle, RefreshCw } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';
import { OpponentTeam } from '../app/types/game';

interface CompleteStepProps {
  onReset: () => void;
  onStartTournament: () => void;
}

export function CompleteStep({ onReset, onStartTournament }: CompleteStepProps) {
  const store = useGameStore();

  const userTeam = useMemo<OpponentTeam>(() => {
    const userAvg = Math.round((store.attackOverall + store.defenseOverall) / 2);
    let userTier: 'very_good' | 'good' | 'medium' | 'bad' = 'bad';
    if (userAvg >= 82) userTier = 'very_good';
    else if (userAvg >= 78) userTier = 'good';
    else if (userAvg >= 72) userTier = 'medium';

    return {
      id: 'user_team',
      name: 'Seu Time (Draft)',
      tier: userTier,
      country: 'Brasil',
      attackOverall: store.attackOverall,
      defenseOverall: store.defenseOverall,
      teamChemistry: store.teamChemistry,
      logoColor: 'bg-amber-500'
    };
  }, [store.attackOverall, store.defenseOverall, store.teamChemistry]);

  const initializePots = useGameStore(state => state.initializePots);

  useEffect(() => {
    initializePots(userTeam);
  }, [initializePots, userTeam]);

  const handleReset = () => {
    store.resetSquad();
    onReset();
  };



  let userGroupKey = '';
  let userGroupOpponents: OpponentTeam[] = [];
  if (store.isDrawCompleted && store.groups) {
    for (const gKey in store.groups) {
      const gTeams = store.groups[gKey];
      if (gTeams.some(t => t.id === 'user_team')) {
        userGroupKey = gKey;
        userGroupOpponents = gTeams.filter(t => t.id !== 'user_team');
        break;
      }
    }
  }

  const getGroupDifficulty = (opponents: OpponentTeam[]) => {
    if (opponents.length === 0) return '';
    const avg = opponents.reduce((acc, t) => acc + (t.attackOverall + t.defenseOverall) / 2, 0) / opponents.length;
    if (avg >= 79) return 'Grupo da Morte 💀';
    if (avg >= 73) return 'Grupo Equilibrado ⚖️';
    return 'Grupo Acessível 🟢';
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="inline-flex p-4 bg-amber-500/10 rounded-3xl border border-amber-500/20 text-amber-500 mb-6">
          <Trophy className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-black tracking-tight text-white mb-2 uppercase">
          Time Pronto para a Copa!
        </h2>
        <p className="text-slate-400 text-sm mb-8">
          Seu time titular de 11 jogadores foi montado com sucesso e está pronto para competir.
        </p>
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase">Ataque</span>
            <div className="text-2xl font-black text-red-500 mt-1">{store.attackOverall}</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase">Defesa</span>
            <div className="text-2xl font-black text-blue-500 mt-1">{store.defenseOverall}</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase">Química</span>
            <div className="text-2xl font-black text-emerald-500 mt-1">{store.teamChemistry}</div>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/50 p-4 rounded-2xl text-center">
            <span className="text-[10px] text-slate-400 font-extrabold uppercase">Saldo Restante</span>
            <div className="text-lg font-black text-yellow-400 mt-1.5 leading-none">
              {store.budget.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>
        <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-4 mb-8 text-left">
          <h3 className="text-xs font-black uppercase text-slate-400 mb-3 tracking-wider">
            Elenco Escalado ({store.formation})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {store.squad.map(s => {
              if (!s.player) return null;
              return (
                <div key={s.id} className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg border border-slate-700/30">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded">
                      {s.label}
                    </span>
                    <span className="font-bold text-slate-200 text-xs">{s.player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400">{s.player.club}</span>
                    <span className="text-xs font-black text-amber-400">{s.player.overall}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleReset}
            className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold uppercase tracking-wide rounded-xl active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Reformular Equipe
          </button>
          <button
            onClick={onStartTournament}
            className="flex-1 py-4 bg-linear-to-r from-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Jogar Libertadores
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
        {!store.isDrawCompleted ? (
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-extrabold text-white">Potes do Sorteio</h3>
              <p className="text-slate-400 text-xs mt-1">
                Os 32 times foram divididos em 4 potes com base na classificação de força geral.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {store.pots && Object.entries(store.pots).map(([key, potTeams], idx) => (
                <div key={key} className="bg-slate-800/30 border border-slate-800 rounded-2xl p-4">
                  <h4 className="font-extrabold text-xs text-amber-500 uppercase tracking-widest border-b border-slate-800 pb-2 mb-3">
                    Pote {idx + 1}
                  </h4>
                  <div className="flex flex-col gap-2">
                    {potTeams.map(t => {
                      const isUser = t.id === 'user_team';
                      const avg = Math.round((t.attackOverall + t.defenseOverall) / 2);
                      return (
                        <div
                          key={t.id}
                          className={`flex items-center justify-between p-1.5 rounded-lg border text-[11px] ${
                            isUser
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                              : 'bg-slate-800/40 border-slate-800/50 text-slate-300'
                          }`}
                        >
                          <span className="truncate max-w-32">{t.name}</span>
                          {isUser && <span className="opacity-85 font-mono">{avg} OVR</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => store.runGroupDraw()}
              className="w-full py-4 bg-linear-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-5 h-5" /> Sorteio dos Grupos
            </button>
          </div>
        ) : (
          <div>
            {userGroupKey && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-5 rounded-2xl mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h4 className="font-black text-sm text-amber-400 uppercase tracking-wider">
                    Sorteio Concluído!
                  </h4>
                  <p className="text-slate-200 text-xs mt-1 leading-relaxed">
                    Você caiu no <span className="font-bold text-white text-sm">Grupo {userGroupKey}</span> com:{' '}
                    <span className="text-white font-bold">{userGroupOpponents.map(t => t.name).join(', ')}</span>.
                  </p>
                </div>
                <div className="bg-slate-800/80 border border-slate-700/50 px-4 py-2 rounded-xl text-right">
                  <span className="text-[9px] text-slate-400 font-bold uppercase block">Dificuldade</span>
                  <span className="text-xs font-black text-white mt-1 block">
                    {getGroupDifficulty(userGroupOpponents)}
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {store.groups && Object.entries(store.groups).map(([gKey, groupTeams]) => {
                const hasUser = groupTeams.some(t => t.id === 'user_team');
                return (
                  <div
                    key={gKey}
                    className={`border rounded-2xl p-4 transition-all duration-300 ${
                      hasUser
                        ? 'border-amber-500 bg-amber-500/5 shadow-lg shadow-amber-500/5'
                        : 'border-slate-800 bg-slate-850/20'
                    }`}
                  >
                    <h4 className="font-black text-sm uppercase tracking-wide border-b border-slate-800 pb-2 mb-3 flex items-center justify-between">
                      <span className={hasUser ? 'text-amber-400' : 'text-white'}>Grupo {gKey}</span>
                      {hasUser && (
                        <span className="text-[7px] font-black uppercase bg-amber-500 text-slate-950 px-1 rounded">
                          VC
                        </span>
                      )}
                    </h4>
                    <div className="flex flex-col gap-2">
                      {groupTeams.map(t => {
                        const isUser = t.id === 'user_team';
                        const avg = Math.round((t.attackOverall + t.defenseOverall) / 2);
                        return (
                          <div
                            key={t.id}
                            className={`flex items-center justify-between p-2 rounded-lg border text-[11px] ${
                              isUser
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 font-bold'
                                : 'bg-slate-850 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="truncate max-w-28 flex flex-col leading-none">
                              <span>{t.name}</span>
                              <span className="text-[8px] text-slate-500 mt-1">{t.country}</span>
                            </div>
                            {isUser && <span className="font-mono opacity-85">{avg} OVR</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => store.resetDraw()}
              className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 mx-auto cursor-pointer text-xs"
            >
              <RefreshCw className="w-4 h-4" /> Refazer Sorteio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
