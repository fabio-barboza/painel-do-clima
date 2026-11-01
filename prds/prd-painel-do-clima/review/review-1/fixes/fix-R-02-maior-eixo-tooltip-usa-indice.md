---
id: R-02
severidade: MAIOR
status: resolvido
---

# Tarefa de Correção: eixo X e tooltip do gráfico mostram índice (0h, 3h, 00h) em vez da hora real

## Problema
Em `frontend/src/components/HourlyChart.jsx`:
- linha 102: os rótulos do eixo X usam o índice — `{i}h` com `i = 0,3,…,21`;
- linhas 143–148: o tooltip exibe `String(hover.idx).padStart(2, '0') + 'h'`.

No protótipo `painel.html` (linhas 710 e 791) o índice era equivalente à hora do dia porque a data fixa começava em 00:00. Com a janela **rolante de 24 h** decidida na TechSpec ("agora" no índice 0), índice ≠ hora: se o usuário busca às 14h, o eixo mostra "0h, 3h, …, 21h" com "agora" em 0h e o tooltip mostra "00h · 21°C" — a hora real não é legível em lugar nenhum do gráfico. Viola FR-25 (tooltip com "hora, temperatura e precipitação" da hora mais próxima) e FR-38 (conteúdo dinâmico real em pt-BR).

## Arquivo
`frontend/src/components/HourlyChart.jsx` — linha 102 (eixo X) e linhas 143–148 (tooltip)

## Impacto
O gráfico — um dos três blocos centrais do painel — não informa a hora real de cada ponto; o usuário não consegue responder "a que hora chove?". Os testes atuais mascaram o problema porque usam dados em que índice == hora do dia (`TIMES` começando em 00:00) e afirmam os rótulos por índice ('0h', '00h', '08h').

## Sugestão de Correção
1. Derivar a hora de `hourly.time[i]` (ISO local da cidade, já no envelope):
   - criar helper local, ex.: `const hourLabel = (iso) => iso ? iso.slice(11, 13) + 'h' : ''`;
   - eixo X (linhas 99–104): `hourLabel(hourly.time[i])` no lugar de `{i}h` (para `i = 0,3,…,21`);
   - tooltip (linhas 143–148): `hourLabel(hourly.time[hover.idx])` no lugar de `String(hover.idx).padStart(2, '0') + 'h'` (manter `°C`, `mm` e o sufixo `· agora` quando `hover.idx === nowIndex`).
2. Atualizar `frontend/src/__tests__/HourlyChart.test.jsx`:
   - "rótulos de hora a cada 3 + 'agora'": os dados de teste já têm `TIMES` 00:00–23:00 (índice == hora), então os rótulos continuariam '0h'…'21h' — trocar a fixture para uma janela rolante (ex.: horas a partir de 14:00, como `2026-10-16T14:00`…) e afirmar rótulos reais ('14h', '17h', …, '13h');
   - "hover … tooltip com hora/temperatura/precipitação": com a fixture rolante, afirmar a hora real do índice hoverado (ex.: clientX 300 → índice 8 → hora correspondente a `TIMES[8]`);
   - "tooltip mostra '· agora' no índice 0": afirmar a hora real de `TIMES[0]` + 'agora'.
3. Rodar a suíte do frontend (`cd frontend && npm test -- run`) e o lint.

## Resolução

Correção aplicada em `frontend/src/components/HourlyChart.jsx`:

- Criado o helper `hourLabel(iso)` (deixa de usar o índice como hora): `iso.slice(11,13) + 'h'`, com proteção contra `iso` ausente.
- Eixo X (rótulos a cada 3h): `{i}h` → `{hourLabel(hourly.time[i])}`.
- Tooltip: `String(hover.idx).padStart(2,'0')+'h'` → `hourLabel(hourly.time[hover.idx])`; mantidos `°C`, `mm` e o sufixo `· agora` quando `hover.idx === nowIndex`.

Correção dos testes em `frontend/src/__tests__/HourlyChart.test.jsx` (antes mascavam o problema com `TIMES` 00h–23h, onde índice == hora):

- Fixture `TIMES` virou janela rolante a partir de 14h (`START_HOUR = 14`), então índice ≠ hora do dia.
- "rótulos de hora a cada 3 + 'agora'": afirma rótulos reais '14h','17h','20h','23h','02h','05h','08h','11h'.
- "hover … tooltip": clientX 300 → índice 8 → hora real '22h'.
- "tooltip '· agora' no índice 0": clientX 44 → índice 0 → hora real '14h' + 'agora'.

Validação: suíte do frontend 176/176 verdes; lint 0 erros (o único warning é o pré-existente R-07 em `coverage/block-navigation.js`, arquivo gerado). FR-25 e FR-38 atendidas: o eixo e o tooltip passam a exibir a hora real da janela rolante.
