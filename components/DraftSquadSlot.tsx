import { Trash2, Plus } from 'lucide-react';
import { SquadSlot } from '@/types/game';

interface DraftSquadSlotProps {
  slot: SquadSlot;
  isSlotActive: boolean;
  onActiveSlotSet: (slot: SquadSlot) => void;
  onSellPlayer: (slotId: string) => void;
  pos: { top: string; left: string };
}

const CARD_STYLE_MAP = {
  legendary: 'bg-linear-to-b from-amber-400 to-yellow-600 border-amber-300 text-amber-950',
  rare: 'bg-linear-to-b from-zinc-300 to-zinc-500 border-zinc-200 text-zinc-950',
  common: 'bg-linear-to-b from-orange-700 to-amber-900 border-orange-600 text-orange-100',
} as const;

const getCardStyleKey = (overall: number) => {
  if (overall >= 80) return 'legendary';
  if (overall >= 74) return 'rare';
  return 'common';
};

export function DraftSquadSlot({
  slot,
  isSlotActive,
  onActiveSlotSet,
  onSellPlayer,
  pos,
}: Readonly<DraftSquadSlotProps>) {
  const playerCardStyles = slot.player
    ? CARD_STYLE_MAP[getCardStyleKey(slot.player.overall)]
    : CARD_STYLE_MAP.common;

  return (
    <div
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
            onClick={() => onActiveSlotSet(slot)}
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
              onSellPlayer(slot.id);
            }}
            className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md active:scale-90 cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => onActiveSlotSet(slot)}
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
}
