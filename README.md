# My Financial Compass

📋 Script para o Lovable

Crie um aplicativo web de Dashboard Financeiro Pessoal completo, moderno e responsivo. A stack tecnológica deve ser React, Tailwind CSS, shadcn/ui e Recharts para a visualização de dados. O aplicativo deve estar preparado para integração com o Supabase.

Diretrizes de Design e UX: O design deve ser minimalista, elegante e profissional, com foco em uma leitura de dados clara, sem excessos visuais. Use uma paleta de cores neutra (tons de cinza, branco e preto) com cores de destaque suaves para indicar receitas (verde), despesas (vermelho) e investimentos (azul).

Páginas e Funcionalidades Principais:

1. Dashboard Principal (Visão Geral):

Cards de Resumo (Topo): Quatro cards exibindo: Saldo Atual, Total de Investimentos, Fatura da Conta 1 e Fatura da Conta 2.

Visualização de Dados (Gráficos didáticos):

Gráfico de Projeção (Line Chart): Um gráfico mostrando a evolução do patrimônio nos últimos meses e uma linha pontilhada projetando valores futuros (calculada com base na média de receitas e despesas).

Gráfico de Despesas (Pie/Doughnut Chart): Distribuição dos gastos por categoria.

Transações Recentes: Uma tabela limpa mostrando as últimas 5 movimentações com Data, Descrição, Categoria e Valor.

2. Inserção de Dados (Transações):

Um formulário intuitivo, acessível via modal ou página dedicada, para adicionar novas movimentações.

Campos necessários: > - Tipo (Receita, Despesa, Investimento)

Valor (Input numérico formatado como moeda)

Descrição do gasto (Texto livre)

Categoria (Select com opções como Alimentação, Transporte, Lazer, Moradia, etc.)

Conta associada (Select: Conta Principal, Conta 1, Conta 2)

Data (Date picker)

3. Gestão de Faturas (Contas 1 e 2):

Uma seção específica para gerenciar os gastos dos dois cartões/contas.

Deve incluir uma barra de progresso mostrando o limite gasto e o fechamento da fatura de ambas as contas separadamente.

4. Carteira de Investimentos:

Uma interface simples para atualizar o montante total investido e um pequeno histórico de aportes.

Estrutura de Dados Esperada (Preparação para Supabase): Crie a lógica de estado do frontend (usando React Query ou Context API) simulando o seguinte esquema de banco de dados para facilitar a conexão posterior:

transactions: id, type, amount, description, category, account_id, date.

accounts: id, name (Conta 1, Conta 2), current_balance, credit_limit.

investments: id, total_amount, last_updated.

Inclua estados de "loading" suaves e mensagens de sucesso ao adicionar novos dados (toast notifications). O código deve ser modular e pronto para eu conectar minhas credenciais do Supabase.

conta 1(Banco Inter), conta 2(banco Itau)

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://financegutisccp.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/17bfafc2-e0d6-4461-bfcb-5ba38b8bb393).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
