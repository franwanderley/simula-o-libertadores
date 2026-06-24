"use client";

import { useState } from 'react';
import {
  Coins,
  Trash2,
  Settings,
  RotateCcw,
  Plus,
  Search,
  X
} from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';
import { marketPlayers } from '../utils/players';
import { canBuyPlayer } from '../utils/pricing';
import { SquadSlot, PlayStyle } from '../app/types/game';

interface DraftStepProps {
  onReset: () => void;
  onCompleteDraft: () => void;
}

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

const playStyleLabels: Record<PlayStyle, string> = {
  attack: 'Ofensivo',
  defense: 'Defensivo',
  balanced: 'Equilibrado',
};

export function DraftStep({ onReset, onCompleteDraft }: DraftStepProps) {
  const store = useGameStore();
  const [activeSlot, setActiveSlot] = useState<SquadSlot | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClub, setSelectedClub] = useState('');
  const [selectedNation, setSelectedNation] = useState('');
  const [sortBy, setSortBy] = useState<'ovr-desc' | 'ovr-asc' | 'price-desc' | 'price-asc'>('ovr-desc');
  const uniqueClubs = Array.from(new Set(marketPlayers.map(p => p.club)));
  const uniqueNations = Array.from(new Set(marketPlayers.map(p => p.nationality)));

  const handleReset = () => {
    store.resetSquad();
    setActiveSlot(null);
    onReset();
  };

  const handleComplete = () => {
    store.completeDraft();
    onCompleteDraft();
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

  const currentPlayStyleLabel = playStyleLabels[store.playStyle];

  return (
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
                <span className="text-white font-bold">{currentPlayStyleLabel}</span>
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
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all duration-200 cursor-pointer"
                title="Reiniciar"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button
                disabled={!isSquadFull}
                onClick={handleComplete}
                className={`px-6 py-3 rounded-xl font-extrabold uppercase tracking-wide text-xs transition-all duration-200 active:scale-95 ${
                  isSquadFull
                    ? 'bg-linear-to-r from-emerald-500 to-teal-600 text-white cursor-pointer shadow-lg shadow-emerald-500/20'
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
        <div className="relative w-full aspect-4/5 sm:aspect-4/3 max-h-125 bg-linear-to-b from-emerald-800 to-green-950 rounded-3xl border-4 border-slate-800 shadow-2xl overflow-hidden p-4">
          <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" />
          <div className="absolute top-1/2 left-1/2 w-32 h-32 rounded-full border border-white/10 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute inset-x-8 top-0 h-20 border-b border-x border-white/10 mx-auto max-w-50" />
          <div className="absolute inset-x-8 bottom-0 h-20 border-t border-x border-white/10 mx-auto max-w-50" />
          <div className="absolute inset-0">
            {store.squad.map((slot) => {
              const pos = SLOT_POSITIONS[slot.id] || { top: '50%', left: '50%' };
              const isSlotActive = activeSlot?.id === slot.id;
              let playerCardStyles = 'bg-linear-to-b from-orange-700 to-amber-900 border-orange-600 text-orange-100';
              if (slot.player) {
                if (slot.player.overall >= 80) {
                  playerCardStyles = 'bg-linear-to-b from-amber-400 to-yellow-600 border-amber-300 text-amber-950';
                } else if (slot.player.overall >= 74) {
                  playerCardStyles = 'bg-linear-to-b from-zinc-300 to-zinc-500 border-zinc-200 text-zinc-950';
                }
              }
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
                        className={`w-13 h-17 sm:w-16 sm:h-20 rounded-lg flex flex-col items-center justify-between p-1 sm:p-1.5 shadow-xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 ${playerCardStyles}`}
                      >
                        <span className="text-[10px] sm:text-xs font-black leading-none">{slot.player.overall}</span>
                        <span className="text-[7px] sm:text-[9px] font-black truncate w-full text-center leading-none">
                          {slot.player.name.split(' ').pop()}
                        </span>
                        <span className="text-[5px] sm:text-[7px] font-extrabold uppercase leading-none opacity-80">
                          {slot.label}
                        </span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          store.sellPlayer(slot.id);
                          if (activeSlot?.id === slot.id) setActiveSlot(null);
                        }}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md active:scale-90 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveSlot(slot)}
                      className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 active:scale-90 cursor-pointer ${
                        isSlotActive
                          ? 'border-amber-400 bg-amber-400/20 text-amber-300 scale-105 shadow-lg shadow-amber-500/20'
                          : 'border-white/40 bg-black/20 text-white/60 hover:border-white/60 hover:bg-black/30'
                      }`}
                    >
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mb-0.5" />
                      <span className="text-[6px] sm:text-[8px] font-extrabold uppercase">{slot.label}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col max-h-150 lg:max-h-none overflow-hidden">
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
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg cursor-pointer"
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
                  className="py-1.5 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
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
                  className="py-1.5 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
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
                className="py-1.5 px-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="ovr-desc">Ordenar por: OVR (Maior)</option>
                <option value="ovr-asc">Ordenar por: OVR (Menor)</option>
                <option value="price-desc">Ordenar por: Preço (Maior)</option>
                <option value="price-asc">Ordenar por: Preço (Menor)</option>
              </select>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-75">
              {filteredMarket.length > 0 ? (
                filteredMarket.map((player) => {
                  const isAlreadyOwned = store.squad.some(s => s.player?.id === player.id);
                  const fitsBudget = store.budget >= player.price;
                  const otherSlotsOwned = store.squad.filter(s => s.player !== null && s.id !== activeSlot.id).length;
                  const checkCanBuy = canBuyPlayer(player.price, otherSlotsOwned, store.budget);
                  let marketPlayerBadgeStyles = 'bg-orange-900/20 border-orange-700 text-orange-400';
                  if (player.overall >= 80) {
                    marketPlayerBadgeStyles = 'bg-amber-400/20 border-amber-400 text-amber-400';
                  } else if (player.overall >= 74) {
                    marketPlayerBadgeStyles = 'bg-zinc-400/20 border-zinc-400 text-zinc-300';
                  }
                  const isOutOfBudget = !fitsBudget;
                  const isReserveBlocked = !checkCanBuy;
                  let marketPlayerAction;
                  if (isAlreadyOwned) {
                    marketPlayerAction = (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                        Contratado
                      </span>
                    );
                  } else if (isOutOfBudget) {
                    marketPlayerAction = (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-red-500">
                        Sem Saldo
                      </span>
                    );
                  } else if (isReserveBlocked) {
                    marketPlayerAction = (
                      <span
                        className="text-[9px] font-bold uppercase tracking-wider text-amber-500 text-right cursor-help"
                        title="A compra deste jogador impossibilitará contratar o restante do time com o saldo atual."
                      >
                        Bloqueado (Reserva)
                      </span>
                    );
                  } else {
                    marketPlayerAction = (
                      <button
                        onClick={() => {
                          store.buyPlayer(player, activeSlot.id);
                          setActiveSlot(null);
                        }}
                        className="px-3 py-1.5 bg-linear-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black tracking-wider uppercase rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                      >
                        Comprar
                      </button>
                    );
                  }
                  return (
                    <div
                      key={player.id}
                      className={`p-3 bg-slate-800/60 border rounded-xl flex items-center justify-between gap-3 ${
                        isAlreadyOwned ? 'border-slate-800 opacity-60' : 'border-slate-700/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border ${marketPlayerBadgeStyles}`}>
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
                        {marketPlayerAction}
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
            <p className="text-slate-400 text-xs mt-2 max-w-60">
              Clique em um espaço vazio no campo para abrir o mercado e contratar um jogador para aquela posição.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
