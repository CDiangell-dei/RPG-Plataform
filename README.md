# Bellum Egrégora: O Flagelo de Metus

Esta é a plataforma oficial de fichas de personagens e compêndio de regras para o RPG **Bellum Egrégora: O Flagelo de Metus** (1202–1223). A aplicação une a brutalidade e mecânicas de *Ordem Paranormal* com a flexibilidade de *Tormenta 20* e a tensão de *Sobrevivendo ao Horror* em um ambiente medieval sombrio (Dark Fantasy).

## Funcionalidades da Plataforma

1. **Ficha de Personagem Completa**:
   - Controle dinâmico de Vida (HP), Sanidade (SP) e Esforço (PE/Mana).
   - Edição de atributos básicos e cálculo automático de bônus de perícias de acordo com o nível de treinamento.
   - Atributos e competências traduzidos para a era medieval (ex: *Ladinagem*, *Navegação*, *Heráldica* e *Erudição*).

2. **Mecânica de Rolagem Integrada**:
   - Rolagem automática de dados com a regra oficial de atributos de Ordem Paranormal (rola Xd20, escolhe o maior e soma o bônus).
   - Rolagem rápida para testes de atributos e de perícias diretamente pela interface.
   - Detecção de desvantagem (Atributo 0) rolando 2d20 e escolhendo o menor resultado.

3. **Mapeamento de Origens e Classes**:
   - Integração das 24 novas origens medievais, preenchendo automaticamente as perícias iniciais e os benefícios passivos (ex: *Cicatrizes de Batalha* do Recruta Forçado ou *Imunidade de Rebanho* do Médico de Peste).
   - Suporte para as classes: Combatente (Beligerante), Especialista (Artífice) e Ocultista (Canalizador - Teurgo/Flagelado).

4. **Sistema de Carga e Carga Monetária**:
   - Inventário com espaços físicos que atualiza a carga do personagem.
   - Integração monetária medieval: Cobre, Prata, Ouro, Platina e Platina Real.
   - Regra de peso para moedas: cada lote de 100 moedas consome 1 espaço físico de carga.

5. **Aba de Rituais e Conjuração**:
   - Registro de rituais com seus círculos e elementos associados (Sangue, Morte, Conhecimento, Energia e Medo).
   - Botão para conjurar ritual que debita de forma automática a Sanidade do personagem de acordo com o custo.

6. **Log de Alterações (Anti-Cheat)**:
   - Todas as modificações de status, rolagens de dados, gastos de Sanidade e transações financeiras são registradas com data e hora.
   - O histórico de logs é salvo diretamente no banco de dados Supabase e exibido em tempo real, permitindo que o Mestre acompanhe as rolagens e edições da ficha para evitar trapaças.

7. **Compêndio Embutido**:
   - Painel superior deslizante contendo a história e as regras básicas do cenário para consulta ágil em mesa.

---

## Tecnologias e Integração

- **Frontend**: React + TypeScript + Vite + CSS Puro (Visual Dark Fantasy / Glassmorphic).
- **Banco de Dados**: Supabase (utilizando Supabase Auth, RLS habilitado e tabelas relacionais).

## Configuração Local

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Crie um arquivo `.env.local` no diretório raiz e insira suas chaves do Supabase:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave-anon
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
