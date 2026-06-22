"use client";

import { Trophy } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';

interface CompleteStepProps {
  onReset: () => void;
}

export function CompleteStep({ onReset }: CompleteStepProps) {
  const store = useGameStore();
  const handleReset = () => {
    store.resetSquad();
    onReset();
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
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
          onClick={() => alert('Próxima etapa: Simulação dos Jogos da Libertadores!')}
          className="flex-1 py-4 bg-linear-to-r from-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          Jogar Libertadores
        </button>
      </div>
    </div>
  );
}
