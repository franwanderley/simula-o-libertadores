import { Player, SquadSlot } from '@/types/game';
import { canBuyPlayer } from '../utils/pricing';

interface MarketPlayerRowProps {
  player: Player;
  activeSlot: SquadSlot;
  squad: readonly SquadSlot[];
  budget: number;
  onBuyPlayer: (player: Player, slotId: string) => void;
}

const BADGE_STYLE_MAP = {
  legendary: 'bg-amber-400/20 border-amber-400 text-amber-400',
  rare: 'bg-zinc-400/20 border-zinc-400 text-zinc-300',
  common: 'bg-orange-900/20 border-orange-700 text-orange-400',
} as const;

const getBadgeStyleKey = (overall: number) => {
  if (overall >= 80) return 'legendary';
  if (overall >= 74) return 'rare';
  return 'common';
};

export function MarketPlayerRow({
  player,
  activeSlot,
  squad,
  budget,
  onBuyPlayer,
}: Readonly<MarketPlayerRowProps>) {
  const isAlreadyOwned = squad.some((s) => s.player?.id === player.id);
  const fitsBudget = budget >= player.price;
  const otherSlotsOwned = squad.filter((s) => s.player !== null && s.id !== activeSlot.id).length;
  const checkCanBuy = canBuyPlayer(player.price, otherSlotsOwned, budget);

  const isOutOfBudget = !fitsBudget;
  const isReserveBlocked = !checkCanBuy;

  const badgeStyles = BADGE_STYLE_MAP[getBadgeStyleKey(player.overall)];

  const renderAction = () => {
    if (isAlreadyOwned) {
      return (
        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
          Contratado
        </span>
      );
    }
    if (isOutOfBudget) {
      return (
        <span className="text-[9px] font-bold uppercase tracking-wider text-red-500">
          Sem Saldo
        </span>
      );
    }
    if (isReserveBlocked) {
      return (
        <span
          className="text-[9px] font-bold uppercase tracking-wider text-amber-500 text-right cursor-help"
          title="A compra deste jogador impossibilitará contratar o restante do time com o saldo atual."
        >
          Bloqueado (Reserva)
        </span>
      );
    }
    return (
      <button
        onClick={() => onBuyPlayer(player, activeSlot.id)}
        className="px-3 py-1.5 bg-linear-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 text-xs font-black tracking-wider uppercase rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
      >
        Comprar
      </button>
    );
  };

  return (
    <div
      className={`p-3 bg-slate-800/60 border rounded-xl flex items-center justify-between gap-3 ${
        isAlreadyOwned ? 'border-slate-800 opacity-60' : 'border-slate-700/50'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border ${badgeStyles}`}>
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
        {renderAction()}
      </div>
    </div>
  );
}
