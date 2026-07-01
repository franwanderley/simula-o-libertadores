import { Trophy } from 'lucide-react';
import { DraftBoard } from '../components/DraftBoard';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-r from-amber-400 to-yellow-500 p-2.5 rounded-xl text-slate-950 shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-wider uppercase leading-none bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
                6 a 3
              </h1>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mt-1">
                Libertadores Sim
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-xs font-bold text-slate-400 hover:text-white transition-colors">
              Temporada 2026
            </span>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center py-6">
        <DraftBoard />
      </main>
      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 6 a 3 Libertadores Simulator. Todos os direitos reservados.</p>
          <div className="flex gap-4">
            <a href="/termos" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">Termos</a>
            <a href="/privacidade" target="_blank" rel="noopener noreferrer" className="hover:text-slate-300 transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
