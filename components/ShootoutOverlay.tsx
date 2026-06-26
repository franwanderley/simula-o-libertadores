import { useState, useEffect } from 'react';
import { OpponentTeam, PenaltyKick, PenaltyShootoutResult } from '@/types/game';

interface ShootoutOverlayProps {
  mainMatch: {
    id: string;
    teamA: OpponentTeam;
    teamB: OpponentTeam;
  };
  shootout: PenaltyShootoutResult;
  scoreA: number;
  scoreB: number;
  showShootoutState: 'not_started' | 'active' | 'completed';
  setShowShootoutState: (state: 'not_started' | 'active' | 'completed') => void;
}

export function ShootoutOverlay({
  mainMatch,
  shootout,
  scoreA,
  scoreB,
  showShootoutState,
  setShowShootoutState,
}: Readonly<ShootoutOverlayProps>) {
  const [activePenaltyKickIndex, setActivePenaltyKickIndex] = useState(0);
  const [isPenaltyKicking, setIsPenaltyKicking] = useState(false);
  const [penaltyKicksHistory, setPenaltyKicksHistory] = useState<PenaltyKick[]>([]);
  const [showPenaltyResultEffect, setShowPenaltyResultEffect] = useState(false);

  const kicks = shootout.kicks;
  const livePenScoreA = penaltyKicksHistory.filter(k => k.teamId === 'A' && k.isGoal).length;
  const livePenScoreB = penaltyKicksHistory.filter(k => k.teamId === 'B' && k.isGoal).length;
  const totalRoundsToShow = Math.max(5, Math.ceil(kicks.length / 2));
  const currentKick = kicks[activePenaltyKickIndex];

  useEffect(() => {
    if (showShootoutState !== 'active') return;

    const currentKick = kicks[activePenaltyKickIndex];
    if (!currentKick) return;

    let timer: ReturnType<typeof setTimeout>;

    if (!isPenaltyKicking && !showPenaltyResultEffect) {
      timer = setTimeout(() => {
        setIsPenaltyKicking(true);
      }, 1200);
    } else if (isPenaltyKicking) {
      timer = setTimeout(() => {
        setIsPenaltyKicking(false);
        setPenaltyKicksHistory(prev => [...prev, currentKick]);
        setShowPenaltyResultEffect(true);
      }, 800);
    } else if (showPenaltyResultEffect) {
      timer = setTimeout(() => {
        if (activePenaltyKickIndex === kicks.length - 1) {
          setShowShootoutState('completed');
        } else {
          setShowPenaltyResultEffect(false);
          setActivePenaltyKickIndex(prev => prev + 1);
        }
      }, 1200);
    }

    return () => clearTimeout(timer);
  }, [showShootoutState, activePenaltyKickIndex, isPenaltyKicking, showPenaltyResultEffect, kicks, setShowShootoutState]);

  const getKickStatus = (team: 'A' | 'B', r: number) => {
    const flatIndex = team === 'A' ? r * 2 : r * 2 + 1;
    const simulatedKick = shootout.kicks[flatIndex];
    if (!simulatedKick) return 'empty';
    if (flatIndex < penaltyKicksHistory.length) {
      return simulatedKick.isGoal ? 'goal' : 'miss';
    }
    if (flatIndex === activePenaltyKickIndex && !isPenaltyKicking && !showPenaltyResultEffect) {
      return 'active';
    }
    return 'empty';
  };

  const renderDot = (status: 'goal' | 'miss' | 'active' | 'empty', idx: number) => {
    switch (status) {
      case 'goal':
        return (
          <div key={idx} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-500 border border-emerald-400 shadow-lg shadow-emerald-500/20 flex items-center justify-center font-bold text-slate-950 text-[10px] sm:text-xs shrink-0 animate-in zoom-in duration-300">
            ⚽
          </div>
        );
      case 'miss':
        return (
          <div key={idx} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 border border-red-400 shadow-lg shadow-red-500/20 flex items-center justify-center font-bold text-white text-[10px] sm:text-xs shrink-0 animate-in zoom-in duration-300">
            ❌
          </div>
        );
      case 'active':
        return (
          <div key={idx} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-800 border-2 border-amber-500 animate-pulse shrink-0" />
        );
      case 'empty':
      default:
        return (
          <div key={idx} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-850 border border-slate-700 shrink-0" />
        );
    }
  };

  const handleSkipShootout = () => {
    setPenaltyKicksHistory(kicks);
    setActivePenaltyKickIndex(kicks.length);
    setShowShootoutState('completed');
  };

  let shootoutCardStatus: 'kicking' | 'result_goal' | 'result_miss' | 'vs' = 'vs';
  if (isPenaltyKicking) {
    shootoutCardStatus = 'kicking';
  } else if (showPenaltyResultEffect) {
    shootoutCardStatus = currentKick?.isGoal ? 'result_goal' : 'result_miss';
  }

  const shootoutCardContent = {
    kicking: (
      <div className="h-28 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 animate-pulse">
        <div className="w-8 h-8 border-3 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-[10px] text-amber-500 font-black uppercase tracking-wider">
          Cobrando Pênalti...
        </span>
      </div>
    ),
    result_goal: (
      <div className="h-28 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 p-3 text-center animate-in zoom-in duration-300">
        <span className="text-3xl font-black text-emerald-400 tracking-wider animate-bounce">
          GOL!
        </span>
        <span className="text-[10px] text-slate-200 font-medium mt-0.5">
          {currentKick?.kickerName} cobrou com classe e converteu!
        </span>
      </div>
    ),
    result_miss: (
      <div className="h-28 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-2 p-3 text-center animate-in zoom-in duration-300">
        <span className="text-3xl font-black text-red-500 tracking-wider animate-bounce">
          PERDEU!
        </span>
        <span className="text-[10px] text-slate-200 font-medium mt-0.5">
          {currentKick?.gkName} defendeu ou a bola foi para fora!
        </span>
      </div>
    ),
    vs: (
      <div className="grid grid-cols-7 items-center bg-slate-950/50 border border-slate-800/80 rounded-2xl overflow-hidden min-h-24 h-24">
        <div className="col-span-3 p-2 flex flex-col items-center text-center">
          <span className="text-[8px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded font-black uppercase tracking-wider mb-1">
            Batedor
          </span>
          <div className="text-[10px] sm:text-xs font-black text-white truncate max-w-full">
            {currentKick?.kickerName}
          </div>
          <div className={`text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase mt-1 ${
            currentKick?.teamId === 'A' ? 'bg-amber-500 text-slate-950' : 'bg-blue-500 text-white'
          }`}>
            {currentKick?.teamId === 'A' ? mainMatch.teamA.name.slice(0, 3) : mainMatch.teamB.name.slice(0, 3)}
          </div>
        </div>

        <div className="col-span-1 py-3 flex flex-col items-center justify-center border-x border-slate-800/60 min-h-full bg-slate-950/80">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">VS</span>
        </div>

        <div className="col-span-3 p-2 flex flex-col items-center text-center">
          <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider mb-1">
            Goleiro
          </span>
          <div className="text-[10px] sm:text-xs font-black text-white truncate max-w-full">
            {currentKick?.gkName}
          </div>
          <div className={`text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase mt-1 ${
            currentKick?.teamId === 'A' ? 'bg-blue-500 text-white' : 'bg-amber-500 text-slate-950'
          }`}>
            {currentKick?.teamId === 'A' ? mainMatch.teamB.name.slice(0, 3) : mainMatch.teamA.name.slice(0, 3)}
          </div>
        </div>
      </div>
    )
  };

  let statusTextKey: 'kicking' | 'result' | 'preparing' = 'preparing';
  if (isPenaltyKicking) {
    statusTextKey = 'kicking';
  } else if (showPenaltyResultEffect) {
    statusTextKey = 'result';
  }

  const statusTextMap = {
    kicking: 'Simulando cobrança...',
    result: 'Visualizando resultado...',
    preparing: 'Preparando cobrador...'
  } as const;

  const controlsContent = {
    not_started: (
      <>
        <button
          onClick={() => setShowShootoutState('active')}
          className="px-6 py-3 bg-linear-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 shadow-lg shadow-amber-500/10 animate-bounce-slow"
        >
          Iniciar Decisão por Pênaltis
        </button>
        <button
          onClick={handleSkipShootout}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 border border-slate-750"
        >
          Pular para o Placar Final
        </button>
      </>
    ),
    active: (
      <div className="flex items-center gap-3">
        <span className="text-[10px] bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-slate-400 font-extrabold uppercase tracking-wider">
          {statusTextMap[statusTextKey]}
        </span>
        <button
          onClick={handleSkipShootout}
          className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer active:scale-95 border border-slate-750"
        >
          Pular para o Placar Final
        </button>
      </div>
    ),
    completed: null
  };

  const shootoutMainPanel = {
    not_started: (
      <div className="h-28 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1.5 p-4 text-center">
        <span className="text-sm font-black text-white uppercase tracking-tight">Decisão Dramática!</span>
        <span className="text-slate-400 text-[10px] max-w-sm">
          O jogo terminou empatado e irá para a disputa de pênaltis. Prepare o seu coração!
        </span>
      </div>
    ),
    active: currentKick ? (
      <div className="relative">
        {shootoutCardContent[shootoutCardStatus]}
      </div>
    ) : null,
    completed: null
  };

  return (
    <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-50 p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="max-w-3xl mx-auto w-full flex flex-col min-h-full justify-between gap-4 py-2 sm:py-4">
        
        <div className="text-center flex flex-col items-center">
          <span className="text-[10px] bg-red-500/10 border border-red-500/20 px-3 py-0.5 rounded-full text-red-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" /> Decisão por Pênaltis
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight mt-2">
            Disputa de Pênaltis
          </h2>
          <span className="text-slate-400 text-[10px] sm:text-xs mt-0.5">
            Placar do tempo normal: {scoreA} x {scoreB}
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative overflow-hidden flex flex-col gap-4">
          
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full ${mainMatch.teamA.logoColor} border border-white/10 shadow-lg flex items-center justify-center text-white font-black text-base sm:text-lg`}>
                {mainMatch.teamA.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs sm:text-sm font-black text-white mt-1.5 text-center truncate w-full">
                {mainMatch.teamA.name}
              </span>
            </div>

            <div className="flex flex-col items-center shrink-0 px-2 sm:px-4">
              <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-center gap-3">
                <span className="text-emerald-400">{livePenScoreA}</span>
                <span className="text-slate-700 text-xl font-normal">:</span>
                <span className="text-emerald-400">{livePenScoreB}</span>
              </div>
              <span className="text-[8px] sm:text-[9px] text-slate-500 font-bold uppercase mt-1 tracking-wider">Pênaltis</span>
            </div>

            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full ${mainMatch.teamB.logoColor} border border-white/10 shadow-lg flex items-center justify-center text-white font-black text-base sm:text-lg`}>
                {mainMatch.teamB.name.slice(0, 2).toUpperCase()}
              </div>
              <span className="text-xs sm:text-sm font-black text-white mt-1.5 text-center truncate w-full">
                {mainMatch.teamB.name}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 bg-slate-950/40 border border-slate-850 rounded-2xl p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-slate-800/60 pb-2.5">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-wider shrink-0 w-20 sm:w-24 truncate">
                {mainMatch.teamA.name}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: totalRoundsToShow }).map((_, r) => 
                  renderDot(getKickStatus('A', r), r)
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <span className="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-wider shrink-0 w-20 sm:w-24 truncate">
                {mainMatch.teamB.name}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: totalRoundsToShow }).map((_, r) => 
                  renderDot(getKickStatus('B', r), r)
                )}
              </div>
            </div>
          </div>

          {shootoutMainPanel[showShootoutState]}

        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {controlsContent[showShootoutState]}
        </div>

      </div>
    </div>
  );
}
