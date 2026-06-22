"use client";

import { useState } from 'react';
import {
  Coins,
  Shield,
  Flame,
  Sparkles,
  Plus,
  X,
  Search,
  Trash2,
  Settings,
  ArrowRight,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';
import { marketPlayers } from '../utils/players';
import { canBuyPlayer } from '../utils/pricing';
import { Formation, PlayStyle, SquadSlot } from '../app/types/game';

const SLOT_POSITIONS: Record<string, { top: string; left: string }> = {
  gk: { top: '85%', left: '50%' },
  lb: { top: '65%', left: '15%' },
  lcb: { top: '68%', left: '38%' },
  cb: { top: '70%', left: '50%' },
  rcb: { top: '68%', left: '62%' },
  rb: { top: '65%', left: '85%' },
  lwb: { top: '63%', left: '12%' },
  rwb: { top: '63%', left: '88%' },
  lm: { top: '45%', left: '12%' },
  ldm: { top: '48%', left: '33%' },
  cm: { top: '45%', left: '50%' },
  lcm: { top: '43%', left: '28%' },
  rcm: { top: '43%', left: '72%' },
  cam: { top: '35%', left: '50%' },
  rdm: { top: '48%', left: '67%' },
  rm: { top: '45%', left: '88%' },
  lam: { top: '30%', left: '20%' },
  ram: { top: '30%', left: '80%' },
  ls: { top: '15%', left: '35%' },
  rs: { top: '15%', left: '65%' },
  lw: { top: '15%', left: '20%' },
  st: { top: '12%', left: '50%' },
  rw: { top: '15%', left: '80%' },
};

const FORMATIONS: Formation[] = ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-2-3-1'];
const PLAY_STYLES: { id: PlayStyle; label: string; desc: string; icon: typeof Flame }[] = [
  { id: 'attack', label: 'Ofensivo', desc: 'Foco no ataque (+3 Atk)', icon: Flame },
  { id: 'balanced', label: 'Equilibrado', desc: 'Estilo equilibrado', icon: Sparkles },
  { id: 'defense', label: 'Defensivo', desc: 'Foco na defesa (+3 Def)', icon: Shield },
];

export function DraftBoard() {
  const store = useGameStore();
  const [step, setStep] = useState<'setup' | 'draft' | 'complete'>('setup');
  const [activeSlot, setActiveSlot] = useState<SquadSlot | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedNation, setSelectedNation] = useState('');
  const [sortBy, setSortBy] = useState<'ovr-desc' | 'ovr-asc' | 'price-desc' | 'price-asc'>('ovr-desc');

  const uniqueClubs = Array.from(new Set(marketPlayers.map(p => p.club)));
  const uniqueNations = Array.from(new Set(marketPlayers.map(p => p.nationality)));

  const handleStartDraft = () => {
    store.resetSquad();
    setStep('draft');
  };

  const handleCompleteDraft = () => {
    store.completeDraft();
    setStep('complete');
  };

  const handleReset = () => {
    store.resetSquad();
    setStep('setup');
    setActiveSlot(null);
  };

  const activePlayersCount = store.squad.filter(s => s.player !== null).length;
  const isSquadFull = activePlayersCount === 11;

  const filteredMarket = marketPlayers
    .filter(player => {
      if (activeSlot && player.position !== activeSlot.position) return false;
      
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClub = selectedClub ? player.club === selectedClub : true;
      const matchesNation = selectedNation ? player.nationality === selectedNation : true;
      
      return matchesSearch && matchesClub && matchesNation;
    })
    .sort((a, b) => {
      if (sortBy === 'ovr-desc') return b.overall - a.overall;
      if (sortBy === 'ovr-asc') return a.overall - b.overall;
      if (sortBy === 'price-desc') return b.price - a.price;
      return a.price - b.price;
    });

  const getChemistryColor = (chem: number) => {
    if (chem >= 80) return 'bg-emerald-500';
    if (chem >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {step === 'setup' && (
        <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white mb-2 bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              Bem-vindo ao 6 a 3
            </h2>
            <p className="text-slate-400 text-sm">
              Monte seu elenco inicial com 100.000 moedas e dispute a Copa Libertadores.
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-slate-300 font-bold text-sm mb-3">
              Selecione a Formação Tática
            </label>
            <div className="grid grid-cols-3 gap-3">
              {FORMATIONS.map(form => (
                <button
                  key={form}
                  onClick={() => store.setFormation(form)}
                  className={`py-3 rounded-lg font-bold border transition-all duration-200 active:scale-95 ${
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
            <label className="block text-slate-300 font-bold text-sm mb-3">
              Selecione o Estilo de Jogo
            </label>
            <div className="grid grid-cols-3 gap-3">
              {PLAY_STYLES.map(style => {
                const Icon = style.icon;
                const isSelected = store.playStyle === style.id;
                return (
                  <button
                    key={style.id}
                    onClick={() => store.setPlayStyle(style.id)}
                    className={`p-4 rounded-lg border text-center flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? style.id === 'attack'
                          ? 'bg-red-500/10 text-red-400 border-red-500 shadow-lg shadow-red-500/10'
                          : style.id === 'defense'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500 shadow-lg shadow-blue-500/10'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
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
            onClick={handleStartDraft}
            className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            Iniciar Escolhas <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {step === 'draft' && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-6">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-500" /> Draft Inicial
                  </h2>
                  <p className="text-slate-400 text-xs mt-1">
                    Formação: <span className="text-white font-bold">{store.formation}</span> | Estilo:{' '}
                    <span className="text-white font-bold">{store.playStyle === 'attack' ? 'Ofensivo' : store.playStyle === 'defense' ? 'Defensivo' : 'Equilibrado'}</span>
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 shadow-inner">
                    <Coins className="w-5 h-5 text-yellow-400" />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Carteira</span>
                      <span className="text-lg font-black text-yellow-400 leading-none mt-1">
                        {store.budget.toLocaleString('pt-BR')} <span className="text-xs">moedas</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-black text-red-500">{store.attackOverall}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">ATAQUE</div>
                    </div>
                    <div className="text-center border-l border-slate-800 pl-4">
                      <div className="text-2xl font-black text-blue-500">{store.defenseOverall}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">DEFESA</div>
                    </div>
                    <div className="text-center border-l border-slate-800 pl-4">
                      <div className="text-2xl font-black text-emerald-500">{store.teamChemistry}</div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">QUÍMICA</div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleReset}
                    className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all duration-200"
                    title="Reiniciar"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                  <button
                    disabled={!isSquadFull}
                    onClick={handleCompleteDraft}
                    className={`px-6 py-3 rounded-xl font-extrabold uppercase tracking-wide text-xs transition-all duration-200 active:scale-95 ${
                      isSquadFull
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white cursor-pointer shadow-lg shadow-emerald-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                    }`}
                  >
                    Finalizar Time ({activePlayersCount}/11)
                  </button>
                </div>
              </div>

              <div className="w-full mt-4">
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase mb-1">
                  <span>Química do Time</span>
                  <span>{store.teamChemistry}/100</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getChemistryColor(
                      store.teamChemistry
                    )}`}
                    style={{ width: `${store.teamChemistry}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="relative w-full aspect-[4/5] sm:aspect-[4/3] max-h-[500px] bg-gradient-to-b from-emerald-800 to-green-950 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden p-4">
              <div className="absolute inset-x-0 top-1/2 h-[1px] bg-white/10" />
              <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full border border-white/10 -translate-x-1/2 -translate-y-1/2" />
              
              <div className="absolute inset-x-8 top-0 h-20 border-b border-x border-white/10 mx-auto max-w-[200px]" />
              <div className="absolute inset-x-8 bottom-0 h-20 border-t border-x border-white/10 mx-auto max-w-[200px]" />

              <div className="absolute inset-0">
                {store.squad.map((slot) => {
                  const pos = SLOT_POSITIONS[slot.id] || { top: '50%', left: '50%' };
                  const isSlotActive = activeSlot?.id === slot.id;
                  
                  return (
                    <div
                      key={slot.id}
                      className="absolute transition-all duration-300"
                      style={{
                        top: pos.top,
                        left: pos.left,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      {slot.player ? (
                        <div className="relative group flex flex-col items-center">
                          <button
                            onClick={() => setActiveSlot(slot)}
                            className={`w-16 h-20 rounded-lg flex flex-col items-center justify-between p-1.5 shadow-xl border-2 transition-all duration-300 ${
                              slot.player.overall >= 80
                                ? 'bg-gradient-to-b from-amber-400 to-yellow-600 border-amber-300 text-amber-950'
                                : slot.player.overall >= 74
                                ? 'bg-gradient-to-b from-zinc-300 to-zinc-500 border-zinc-200 text-zinc-950'
                                : 'bg-gradient-to-b from-orange-700 to-amber-900 border-orange-600 text-orange-100'
                            }`}
                          >
                            <span className="text-xs font-black leading-none">{slot.player.overall}</span>
                            <span className="text-[9px] font-black truncate w-full text-center leading-none">
                              {slot.player.name.split(' ').pop()}
                            </span>
                            <span className="text-[7px] font-extrabold uppercase leading-none opacity-80">
                              {slot.label}
                            </span>
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              store.sellPlayer(slot.id);
                              if (activeSlot?.id === slot.id) setActiveSlot(null);
                            }}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md active:scale-90"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveSlot(slot)}
                          className={`w-14 h-14 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 active:scale-90 ${
                            isSlotActive
                              ? 'border-amber-400 bg-amber-400/20 text-amber-300 scale-105 shadow-lg shadow-amber-500/20'
                              : 'border-white/40 bg-black/20 text-white/60 hover:border-white/60 hover:bg-black/30'
                          }`}
                        >
                          <Plus className="w-4 h-4 mb-0.5" />
                          <span className="text-[8px] font-extrabold uppercase">{slot.label}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col max-h-[600px] lg:max-h-none overflow-hidden">
            {activeSlot ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wide">
                      Mercado: {activeSlot.label}
                    </h3>
                    <p className="text-slate-400 text-xs mt-0.5">
                      Contratando para a posição:{' '}
                      <span className="text-white font-bold">{activeSlot.position}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveSlot(null)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Buscar jogador..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-all duration-200"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={selectedClub}
                      onChange={e => setSelectedClub(e.target.value)}
                      className="py-1.5 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="">Todos os Clubes</option>
                      {uniqueClubs.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>

                    <select
                      value={selectedNation}
                      onChange={e => setSelectedNation(e.target.value)}
                      className="py-1.5 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="">Todas as Nações</option>
                      {uniqueNations.map(n => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as typeof sortBy)}
                    className="py-1.5 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="ovr-desc">Ordenar por: OVR (Maior)</option>
                    <option value="ovr-asc">Ordenar por: OVR (Menor)</option>
                    <option value="price-desc">Ordenar por: Preço (Maior)</option>
                    <option value="price-asc">Ordenar por: Preço (Menor)</option>
                  </select>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-[300px]">
                  {filteredMarket.length > 0 ? (
                    filteredMarket.map((player) => {
                      const isAlreadyOwned = store.squad.some(s => s.player?.id === player.id);
                      const fitsBudget = store.budget >= player.price;
                      
                      const otherSlotsOwned = store.squad.filter(s => s.player !== null && s.id !== activeSlot.id).length;
                      const checkCanBuy = canBuyPlayer(player.price, otherSlotsOwned, store.budget);

                      return (
                        <div
                          key={player.id}
                          className={`p-3 bg-slate-800/60 border rounded-xl flex items-center justify-between gap-3 ${
                            isAlreadyOwned ? 'border-slate-800 opacity-60' : 'border-slate-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border ${
                              player.overall >= 80
                                ? 'bg-amber-400/20 border-amber-400 text-amber-400'
                                : player.overall >= 74
                                ? 'bg-zinc-400/20 border-zinc-400 text-zinc-300'
                                : 'bg-orange-900/20 border-orange-700 text-orange-400'
                            }`}>
                              {player.overall}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-white text-sm truncate">{player.name}</h4>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {player.club} • {player.nationality}
                              </p>
                              <p className="text-yellow-400 text-xs font-black tracking-wide mt-1">
                                {player.price.toLocaleString('pt-BR')} moedas
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {isAlreadyOwned ? (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                                Contratado
                              </span>
                            ) : !fitsBudget ? (
                              <span className="text-[9px] font-bold uppercase tracking-wider text-red-500">
                                Sem Saldo
                              </span>
                            ) : !checkCanBuy ? (
                              <span
                                className="text-[9px] font-bold uppercase tracking-wider text-amber-500 text-right cursor-help"
                                title="A compra deste jogador impossibilitará contratar o restante do time com o saldo atual."
                              >
                                Bloqueado (Reserva)
                              </span>
                            ) : (
                              <button
                                onClick={() => {
                                  store.buyPlayer(player, activeSlot.id);
                                  setActiveSlot(null);
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black tracking-wider uppercase rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                              >
                                Comprar
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                      <p className="text-sm font-semibold">Nenhum jogador encontrado</p>
                      <p className="text-xs mt-1">Tente ajustar seus filtros de busca.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full py-12">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-500 mb-4 animate-pulse">
                  <Plus className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-white text-md uppercase tracking-wider">
                  Selecione uma Posição
                </h3>
                <p className="text-slate-400 text-xs mt-2 max-w-[240px]">
                  Clique em um espaço vazio no campo para abrir o mercado e contratar um jogador para aquela posição.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 'complete' && (
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
              className="flex-1 py-4 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black tracking-wider uppercase rounded-xl hover:shadow-xl hover:shadow-amber-500/10 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              Jogar Libertadores
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
