"use client";

import { useState } from 'react';
import {
  Coins,
  Settings,
  RotateCcw,
  Plus,
  Search,
  X
} from 'lucide-react';
import { useGameStore } from '../hooks/useGameStore';
import { marketPlayers } from '../utils/players';
import { SquadSlot, PlayStyle } from '@/types/game';
import { DraftSquadSlot } from './DraftSquadSlot';
import { MarketPlayerRow } from './MarketPlayerRow';

interface DraftStepProps {
  onReset: () => void;
  onCompleteDraft: () => void;
}

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

const playStyleLabels: Record<PlayStyle, string> = {
  attack: 'Ofensivo',
  defense: 'Defensivo',
  balanced: 'Equilibrado',
};

const POSITION_MAP: Record<string, string> = {
  GK: 'GOL',
  DF: 'DEF',
  MF: 'MEI',
  FW: 'ATA',
};

export function DraftStep({ onReset, onCompleteDraft }: Readonly<DraftStepProps>) {
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
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
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
            {store.squad.map((slot) => (
              <DraftSquadSlot
                key={slot.id}
                slot={slot}
                isSlotActive={activeSlot?.id === slot.id}
                onActiveSlotSet={setActiveSlot}
                onSellPlayer={(slotId) => {
                  store.sellPlayer(slotId);
                  if (activeSlot?.id === slotId) setActiveSlot(null);
                }}
                pos={SLOT_POSITIONS[slot.id] || { top: '50%', left: '50%' }}
              />
            ))}
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
                  <span className="text-white font-bold">{POSITION_MAP[activeSlot.position] || activeSlot.position}</span>
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
                filteredMarket.map((player) => (
                  <MarketPlayerRow
                    key={player.id}
                    player={player}
                    activeSlot={activeSlot}
                    squad={store.squad}
                    budget={store.budget}
                    onBuyPlayer={(p, slotId) => {
                      store.buyPlayer(p, slotId);
                      setActiveSlot(null);
                    }}
                  />
                ))
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
