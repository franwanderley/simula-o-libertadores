# 🏆 6 a 3 | Simulador da Copa Libertadores

O **6 a 3** é um simulador web interativo e premium da Copa Libertadores da América. O projeto permite que o usuário vivencie toda a jornada do torneio continental: desde a montagem do elenco dos sonhos através de um sistema de "Draft" com orçamento restrito, passando pelo ajuste tático e formação do time, até a simulação detalhada da fase de grupos e das fases eliminatórias de mata-mata em busca da Glória Eterna!

---

## 🛠️ Tecnologias Utilizadas

A aplicação foi desenvolvida utilizando as práticas mais modernas de desenvolvimento web e engenharia de software frontend:

- **Next.js 16 (App Router)**: Framework React para roteamento e estruturação de páginas estáticas/dinâmicas.
- **React 19**: Biblioteca base para a criação da interface declarativa e componentes interativos.
- **TypeScript**: Tipagem estática para robustez e redução de erros em tempo de desenvolvimento.
- **Zustand v5**: Gerenciador de estado global leve e de alta performance, utilizado para reter o progresso do draft e simulação sem a necessidade de banco de dados centralizado.
- **Tailwind CSS v4**: Framework utilitário de estilização para uma interface de usuário dark mode, fluida e totalmente responsiva.
- **Lucide React**: Conjunto de ícones vetoriais modernos.
- **ESLint**: Padronização e qualidade de escrita do código-fonte.

---

## ⚽ Como Funciona a Simulação das Partidas?

A lógica de simulação dos jogos está centralizada no utilitário [matchSimulator.ts](https://github.com/franwanderley/simula-o-libertadores/blob/master/utils/matchSimulator.ts) e baseia-se em um modelo estatístico e probabilístico minuto-a-minuto:

### 1. Força Efetiva e Química do Time

A média geral de atributos (Overall de Ataque e Defesa) do time é ajustada pela **Química (Chemistry)** da equipe:
$$\text{Overall Efetivo} = \text{Overall} \times \left(0.9 + \frac{\text{Química}}{100} \times 0.2\right)$$

- Com **100 de química**, o time ganha um bônus de **+10%** em seus atributos efetivos.
- Com **0 de química**, o time sofre uma penalidade de **-10%** em seus atributos efetivos.

### 2. Influência de Táticas e Formações

- **Táticas (Defensiva, Neutra, Ofensiva, etc.)**: Aplicam coeficientes que aumentam o poder de ataque em detrimento da defesa (ou vice-versa).
- **Formações (e.g. 4-3-3, 3-5-2, 5-4-1)**: Ajustam dinamicamente a força dos setores ofensivos e defensivos dependendo do desenho tático.

### 3. Fator Casa e Fora (Apenas na Fase de Grupos)

Para simular a atmosfera hostil e a vantagem de jogar em seu próprio estádio na Libertadores:

- **Time da Casa (Mandante)**: Recebe um **bônus de +5%** em todos os overalls e atributos dos jogadores.
- **Time Visitante**: Sofre uma **penalidade de -5%** em todos os overalls e atributos dos jogadores.
- _Esse fator é desativado durante as fases eliminatórias (mata-mata)._

### 4. Posse de Bola e Criação de Lances

- A **posse de bola** de cada time é calculada com base na força média dos seus meio-campistas (MF) em relação ao adversário, sofrendo ajustes conforme as táticas escolhidas e uma variação aleatória de $\pm 3\%$. Ela é limitada entre um intervalo de $35\%$ e $65\%$.
- Para cada minuto do jogo (1 a 90), há uma chance basal de ocorrer um **lance de perigo** (basicamente chutes ao gol e chances claras):
  - **Minutos 1 a 79**: Chance de **12%** por minuto.
  - **Minutos 80 a 90 (Simulação de Cansaço)**: Aumentada para **20%** por minuto para representar o desgaste físico dos defensores e a abertura de espaços no fim da partida.
- O time que realiza o lance é determinado proporcionalmente à sua porcentagem de posse de bola.

### 5. Finalização e Eventos

- Quando uma chance é gerada, a probabilidade de converter em **gol** é calculada confrontando o poder de ataque do finalizador contra o poder de defesa do adversário. O jogador que finaliza é selecionado com base em pesos de probabilidade associados à sua posição (atacantes têm maior probabilidade que meio-campistas e defensores).
- Eventos de **falta** ocorrem de forma aleatória em $12\%$ dos minutos, gerando cartões ou paralisações na simulação.

### 6. Desempate por Pênaltis

Nas fases de mata-mata, empates no tempo normal levam a partida direto para as cobranças de pênaltis. O simulador resolve a disputa cobrador por cobrador comparando o overall do batedor com o do goleiro adversário para definir quem avança.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org) instalado (versão 18 ou superior recomendada).

### Passos para Instalação

1.  Clone o repositório ou baixe os arquivos do projeto.
2.  Navegue até a pasta raiz do projeto.
3.  Instale as dependências:
    ```bash
    npm install
    ```
4.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```
5.  Abra o navegador em [http://localhost:3000](http://localhost:3000) para começar a jogar.

### Comandos Úteis

- `npm run dev` - Executa o servidor local de desenvolvimento.
- `npm run build` - Gera a build otimizada de produção.
- `npm run lint` - Executa o ESLint para verificar a qualidade de código e conformidade de regras.
