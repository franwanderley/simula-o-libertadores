import { Trophy, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: "Termos de Uso | 6 a 3 Libertadores Simulator",
  description: "Termos de Uso do simulador 6 a 3 da Copa Libertadores da América.",
};

export default function TermsPage() {
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
              Legal
            </span>
            <h2 className="text-3xl font-black text-white mt-3 uppercase tracking-tight">Termos de Uso</h2>
            <p className="text-slate-400 text-xs mt-2">Última atualização: 1 de Julho de 2026</p>
          </div>

          <div className="flex flex-col gap-6 text-slate-300 text-sm leading-relaxed">
            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">1. Aceitação dos Termos</h3>
              <p>
                Ao acessar e utilizar o site <strong>6 a 3 Libertadores Simulator</strong>, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve utilizar o simulador.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">2. Descrição do Serviço</h3>
              <p>
                O <strong>6 a 3 Libertadores Simulator</strong> é uma plataforma de entretenimento online gratuita que permite aos usuários montar equipes de futebol virtuais por meio de um sistema de &quot;draft&quot; e simular confrontos inspirados no torneio da Copa Libertadores da América. Este serviço é apenas para fins de lazer e entretenimento pessoal.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">3. Propriedade Intelectual e Isenção de Vínculo</h3>
              <p>
                Este site é um projeto independente feito por fãs. Nós não temos qualquer afiliação oficial, patrocínio ou associação com a CONMEBOL, clubes de futebol, federações nacionais ou jogadores profissionais de futebol. Todos os nomes de marcas, clubes, marcas registradas e imagens pertencem aos seus respectivos proprietários e são utilizados aqui exclusivamente para fins descritivos e de simulação recreativa.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">4. Uso de Moedas Virtuais no Jogo</h3>
              <p>
                O jogo inclui um sistema de moedas virtuais utilizado no draft para contratação de atletas. Estas moedas não possuem valor financeiro real, não podem ser compradas com dinheiro real, resgatadas, negociadas ou convertidas em qualquer moeda ou bem físico. Qualquer tentativa de comercialização dessas moedas virtuais resultará no bloqueio do acesso ao site.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">5. Limitação de Responsabilidade</h3>
              <p>
                O simulador é fornecido &quot;como está&quot; e &quot;conforme disponível&quot;. Não garantimos que a simulação esteja livre de interrupções ou erros, ou que as simulações e atributos reflitam opiniões ou dados oficiais de performance esportiva. Em nenhuma circunstância seremos responsáveis por qualquer perda direta, indireta ou danos decorrentes da utilização da plataforma.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wide">6. Alterações nos Termos</h3>
              <p>
                Reservamo-nos o direito de modificar ou atualizar estes Termos de Uso a qualquer momento, sem aviso prévio. A continuidade do uso do simulador após a publicação de novos termos constitui a sua aceitação das respectivas modificações.
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
