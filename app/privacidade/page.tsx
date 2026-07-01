import { Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: "Política de Privacidade | 6 a 3 Libertadores Simulator",
  description: "Política de Privacidade do simulador 6 a 3 da Copa Libertadores da América.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-900">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-linear-to-r from-amber-400 to-yellow-500 p-2.5 rounded-xl text-slate-950 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
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
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Jogo
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col gap-6">
          <div className="border-b border-slate-800 pb-6">
            <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full text-amber-400 font-extrabold uppercase tracking-widest">
              Segurança
            </span>
            <h2 className="text-3xl font-black text-white mt-3 uppercase tracking-tight">Política de Privacidade</h2>
            <p className="text-slate-400 text-xs mt-2">Última atualização: 1 de Julho de 2026</p>
          </div>

          <div className="flex flex-col gap-6 text-slate-300 text-sm leading-relaxed">
            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">1. Coleta de Informações</h3>
              <p>
                O <strong>6 a 3 Libertadores Simulator</strong> valoriza a privacidade dos seus usuários. Nós não coletamos, solicitamos ou armazenamos qualquer tipo de informação de identificação pessoal (como nome, e-mail, telefone ou endereço) dos usuários que jogam no site.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">2. Armazenamento e Estado do Jogo</h3>
              <p>
                Toda a progressão do jogo (o seu time contratado no draft, os resultados das partidas simuladas e as configurações da equipe) é processada e mantida em memória local no seu navegador web (client-side) utilizando a biblioteca de estado <em>Zustand</em>. Não enviamos esses dados para servidores externos ou banco de dados. Ao recarregar ou fechar a página do jogo, o estado é reiniciado.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">3. Cookies e Rastreamento</h3>
              <p>
                Não utilizamos cookies de rastreamento de comportamento, cookies publicitários ou ferramentas de terceiros para monitoramento de tráfego que identifiquem você individualmente. O site é carregado estaticamente de forma segura.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">4. Compartilhamento de Campanhas</h3>
              <p>
                O site oferece um recurso de compartilhamento da campanha final do jogo, que copia um texto formatado em markdown para a sua área de transferência (clipboard). Esta ação é executada localmente pelo seu navegador e apenas sob o seu comando ativo (clicando no botão de compartilhar). Não armazenamos o texto compartilhado nos nossos sistemas.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">5. Segurança dos Dados</h3>
              <p>
                Como os dados residem exclusivamente no dispositivo e navegador de cada usuário, a segurança dos dados do jogo depende da segurança do próprio dispositivo do usuário. Recomendamos utilizar navegadores modernos e mantê-los atualizados.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">6. Contato</h3>
              <p>
                Caso tenha dúvidas sobre esta Política de Privacidade ou sobre o funcionamento técnico do site, você pode entrar em contato através das vias de suporte indicadas ou pelo repositório oficial do projeto no GitHub.
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-900 py-6 px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto">
          <p>© 2026 6 a 3 Libertadores Simulator. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
