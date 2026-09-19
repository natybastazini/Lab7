# NOC Command Center — LAB 7

Dashboard de **Monitoramento de Frota** do Laboratório 7 — Arquitetura e Refatoração Modular.

## O que está implementado

- Vite + React + TypeScript
- Tailwind CSS com identidade `noc`
- `StatusCard.tsx` para veículos, links e alertas
- `TelemetryChart.tsx` para a velocidade média, alimentado por leituras reais
- `ConnectivityLink.tsx` para os 5 links de comunicação
- `FleetTable.tsx` para a frota por categoria
- `SystemLogs.tsx` para incidentes e spans do tracing
- `ErrorBoundary.tsx` para isolar a falha de um componente
- `useFleetMonitor.ts` para estado da frota e regras de negócio
- `observability/tracing.ts` para o Distributed Tracing
- Frota de 100.000 veículos (10 categorias × 10.000)
- Regra de falha em cascata: cada enlace atende duas categorias
- Revalidação automática da telemetria a cada 5 segundos
- Cabeçalho com LED de status pulsante e relógio do NOC (`StatusClock.tsx`)
- Layout responsivo para desktop, tablet e celular

## Importante

Este projeto é **somente o dashboard do LAB 7**. Não possui CRUD, páginas de
veículos, API REST, Express ou SQLite do LAB 6.

## Executar

```bash
npm install
npm run dev
```

Depois abra o endereço mostrado pelo Vite. No Windows, se o PowerShell recusar
os scripts, use o Prompt de Comando ou troque `npm` por `npm.cmd`.

## Regra de dependência dos enlaces

As 10 categorias da frota estão distribuídas entre os 5 enlaces. Derrubar
qualquer um deles tira 20.000 veículos do ar:

| Enlace | Categorias que dependem dele | Veículos |
|--------|------------------------------|----------|
| VSAT — Hub Principal | Carro, SUV | 20.000 |
| VSAT — BGAN Backup | Caminhão, Caminhonete | 20.000 |
| OSPF | Van, Trator | 20.000 |
| BGP | Ônibus, Esportivo | 20.000 |
| LTE Móvel | Moto, Ambulância | 20.000 |

Essa tabela vive em `constants.ts` (`INFRASTRUCTURE`), e é a **única** fonte da
regra. O índice inverso `LINK_DA_CATEGORIA` é montado a partir dela, então não
existe uma segunda lista que possa sair de sincronia.

Ao derrubar um enlace, cinco partes do painel reagem juntas:

1. o cartão **Veículos online** cai para 80.000 e explica quantos ficaram sem telemetria;
2. o cartão **Links de telecom** vai para 4 / 5 e **Alertas** sobe para 1;
3. na **distribuição por categoria**, as duas categorias daquele link viram OFF;
4. na **tabela da frota**, as mesmas duas linhas viram OFFLINE, e a coluna *Enlace* mostra o porquê;
5. um **incidente** é aberto nomeando as categorias e a quantidade de veículos.

Derrubando os cinco, o contador chega a zero. O botão **Restaurar todos** volta
tudo. Não existe troca automática de abas a cada 5 segundos.

## Cabeçalho

O LED à esquerda do título pulsa enquanto o painel recebe telemetria. Quando um
enlace cai, ele muda para âmbar, pulsa mais rápido e o subtítulo passa de
"Online" para "Degradado" — junto com a pastilha ao lado, que passa a contar os
enlaces em queda.

O relógio mostra hora com segundos e a data. O fuso não está fixo no código: sai
do próprio navegador, via `getTimezoneOffset`.

A animação respeita `prefers-reduced-motion`: quem configurou o sistema para
menos movimento vê o LED parado.

## Demonstração do Error Boundary

O botão **Corromper sensor** faz um componente lançar um erro de verdade. Só o
bloco dele é substituído pelo aviso de falha; o restante do painel continua
operando e os outros botões seguem funcionando.

## Observabilidade

Cada coleta de telemetria abre um trace e registra um span. Abra o console do
navegador (F12) e veja as linhas no padrão **W3C Trace Context**, o mesmo
cabeçalho que o OpenTelemetry usa:

```
[OTel] traceparent: 00-20a47c882546ebf4b298ec2d2eb280d2-c5953e6ca225492f-01 | telemetria.coleta | 0.1ms | {...}
```

Os mesmos spans aparecem no painel **Spans do tracing**, no rodapé da página.

## Variáveis de ambiente

Copie `.env.example` para `.env` e ajuste. Só variáveis com o prefixo `VITE_`
chegam ao navegador, e o valor é gravado dentro do bundle na hora do build —
por isso nunca coloque segredo nelas.

| Chave | Para que serve |
|-------|----------------|
| `VITE_REFRESH_MS` | Intervalo da revalidação da telemetria, em ms (padrão 5000) |
| `VITE_OTEL_EXPORTER_URL` | Coletor OTLP. Em branco, os spans ficam só no console |

## Deploy na Vercel

O `vercel.json` já traz a configuração. Em **Add New > Project**, importe o
repositório, confirme o preset **Vite** (build `npm run build`, saída `dist`) e,
se quiser mudar o intervalo de revalidação, cadastre `VITE_REFRESH_MS` em
**Settings > Environment Variables** antes do deploy.

Os resultados da auditoria de deploy estão em
[CHECKLIST-AUDITORIA.md](CHECKLIST-AUDITORIA.md).
# Lab7
