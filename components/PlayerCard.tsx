import { Player } from '@/types/game';

const POSITION_MAP: Record<string, string> = {
  GK: 'GOL',
  DF: 'DEF',
  MF: 'MEI',
  FW: 'ATA',
};

const CARD_STYLE_MAP = {
  legendary: 'from-amber-400 via-yellow-500 to-amber-600 text-amber-950 border-amber-300',
  rare: 'from-zinc-300 via-zinc-400 to-zinc-500 text-zinc-950 border-zinc-200',
  common: 'from-orange-700 via-orange-800 to-amber-900 text-orange-100 border-orange-600',
} as const;

const BADGE_STYLE_MAP = {
  legendary: 'bg-amber-300 text-amber-950 border-amber-400',
  rare: 'bg-zinc-200 text-zinc-950 border-zinc-300',
  common: 'bg-orange-600 text-orange-100 border-orange-500',
} as const;

const getStyleKey = (overall: number) => {
  if (overall >= 80) return 'legendary';
  if (overall >= 74) return 'rare';
  return 'common';
};

interface PlayerCardProps {
  player: Player;
  onClick?: () => void;
  showPrice?: boolean;
  disabled?: boolean;
}

export function PlayerCard({ player, onClick, showPrice = true, disabled = false }: Readonly<PlayerCardProps>) {
  const styleKey = getStyleKey(player.overall);
  const cardStyles = CARD_STYLE_MAP[styleKey];
  const badgeStyles = BADGE_STYLE_MAP[styleKey];

  return (
    <button
      onClick={onClick}
      disabled={disabled || !onClick}
      className={`relative w-44 h-64 rounded-xl border-2 bg-linear-to-br p-3 flex flex-col justify-between shadow-xl transition-all duration-300 select-none ${cardStyles} ${
        onClick && !disabled ? 'hover:-translate-y-2 hover:shadow-2xl cursor-pointer active:scale-95' : ''
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex flex-col items-center">
          <span className="text-3xl font-extrabold tracking-tighter leading-none">
            {player.overall}
          </span>
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded border mt-1 ${badgeStyles}`}>
            {POSITION_MAP[player.position] || player.position}
          </span>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-sm font-semibold truncate max-w-20" title={player.club}>
            {player.club}
          </span>
          <span className="text-xs opacity-80 mt-0.5 truncate max-w-20" title={player.nationality}>
            {player.nationality}
          </span>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center items-center py-2">
        <div className={`w-16 h-16 rounded-full border flex items-center justify-center font-bold text-lg shadow-inner ${badgeStyles}`}>
          {player.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <h3 className="mt-2 text-sm font-bold tracking-tight text-center truncate w-full px-1">
          {player.name}
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-bold border-t border-current/20 pt-2">
        <div className="flex justify-between">
          <span className="opacity-75">PAC</span>
          <span>{player.attributes.pace}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-75">DRI</span>
          <span>{player.attributes.dribbling}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-75">SHO</span>
          <span>{player.attributes.shooting}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-75">DEF</span>
          <span>{player.attributes.defending}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-75">PAS</span>
          <span>{player.attributes.passing}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-75">PHY</span>
          <span>{player.attributes.physical}</span>
        </div>
      </div>
      {showPrice && (
        <div className="mt-2 text-center text-xs font-black tracking-wider uppercase bg-black/10 rounded py-0.5">
          {player.price.toLocaleString('pt-BR')} MOEDAS
        </div>
      )}
    </button>
  );
}
