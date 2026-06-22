"use client";

import { ArrowRight, Flame, Sparkles, Shield } from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';
import { Formation, PlayStyle } from '../app/types/game';

interface SetupStepProps {
  onStartDraft: () => void;
}

const FORMATIONS: Formation[] = ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-2-3-1'];
const PLAY_STYLES: { id: PlayStyle; label: string; desc: string; icon: typeof Flame }[] = [
  { id: 'attack', label: 'Ofensivo', desc: 'Foco no ataque (+3 Atk)', icon: Flame },
  { id: 'balanced', label: 'Equilibrado', desc: 'Estilo equilibrado', icon: Sparkles },
  { id: 'defense', label: 'Defensivo', desc: 'Foco na defesa (+3 Def)', icon: Shield },
];

export function SetupStep({ onStartDraft }: SetupStepProps) {
  const store = useGameStore();
  const handleStart = () => {
    store.resetSquad();
    onStartDraft();
  };

  return (
    <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight mb-2 bg-linear-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
          Bem-vindo ao 6 a 3
        </h2>
        <p className="text-slate-400 text-sm">
          Monte seu elenco inicial com 100.000 moedas e dispute a Copa Libertadores.
        </p>
      </div>
      <div className="mb-6">
        <h3 className="block text-slate-300 font-bold text-sm mb-3">
          Selecione a Formação Tática
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {FORMATIONS.map(form => (
            <button
              key={form}
              onClick={() => store.setFormation(form)}
              className={`py-3 rounded-lg font-bold border transition-all duration-200 active:scale-95 cursor-pointer ${
                store.formation === form
                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {form}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-8">
        <h3 className="block text-slate-300 font-bold text-sm mb-3">
          Selecione o Estilo de Jogo
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {PLAY_STYLES.map(style => {
            const Icon = style.icon;
            const isSelected = store.playStyle === style.id;
            let btnStyleClasses = 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700';
            if (isSelected) {
              if (style.id === 'attack') {
                btnStyleClasses = 'bg-red-500/10 text-red-400 border-red-500 shadow-lg shadow-red-500/10';
              } else if (style.id === 'defense') {
                btnStyleClasses = 'bg-blue-500/10 text-blue-400 border-blue-500 shadow-lg shadow-blue-500/10';
              } else {
                btnStyleClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500 shadow-lg shadow-emerald-500/10';
              }
            }
            return (
              <button
                key={style.id}
                onClick={() => store.setPlayStyle(style.id)}
                className={`p-4 rounded-lg border text-center flex flex-col items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer ${btnStyleClasses}`}
              >
                <Icon className="w-6 h-6 mb-2" />
                <span className="font-bold text-sm">{style.label}</span>
                <span className="text-[10px] opacity-70 mt-1">{style.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
      <button
        onClick={handleStart}
        className="w-full py-4 bg-linear-to-r from-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
      >
        Iniciar Escolhas <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
}
