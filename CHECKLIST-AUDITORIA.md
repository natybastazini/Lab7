# Checklist de auditoria de deploy — NOC Command Center LAB 7

Medido no build de produção (`npm run build` + `vite preview`), com Chrome
headless. Refaça a coluna da direita depois do deploy, usando a URL pública.

## 1. Infraestrutura e build

| Item | Status | Como foi verificado |
|------|--------|---------------------|
| Build sem erros nem avisos | OK | `tsc -b && vite build` conclui em ~0,8s, 2158 módulos, sem avisos |
| Assets minificados | OK | JS principal 273 kB → **86 kB** em gzip; chunk do gráfico 374 kB → **100 kB** |
| Tailwind com PurgeCSS ativo | OK | O CSS final tem **15,5 kB** (4,2 kB em gzip); só as classes usadas sobrevivem |
| Variáveis de ambiente | OK | `VITE_REFRESH_MS` e `VITE_OTEL_EXPORTER_URL` lidas via `import.meta.env`, documentadas em `.env.example` |

## 2. Integridade e performance do front-end

Lighthouse (Chrome headless, preset mobile, build de produção):

| Categoria | Exigido | Medido |
|-----------|---------|--------|
| Performance | > 90 | **97** |
| Best Practices | > 90 | **100** |
| Accessibility | — | **100** |
| SEO | — | **100** |

Métricas: FCP 1,8 s · LCP 2,3 s · TBT 100 ms · CLS 0.

| Item | Status | Como foi verificado |
|------|--------|---------------------|
| Responsividade 360px (mobile) | OK | Sem rolagem horizontal; controles e cartões empilham |
| Responsividade 768px (tablet) | OK | Sem rolagem horizontal; cartões em 2 colunas |
| Responsividade ultrawide (2560px) | OK | Sem rolagem horizontal; container limitado a 1500px |
| Animação respeita prefers-reduced-motion | OK | O LED do cabeçalho e o cursor do terminal param quando o sistema pede menos movimento |
| Error Boundaries | OK | O botão "Corromper sensor" lança um erro real; o bloco é isolado e o restante do painel continua clicável |

## 3. Conectividade e observabilidade

| Item | Status | Como foi verificado |
|------|--------|---------------------|
| Distributed Tracing visível | OK | Cada coleta imprime um `traceparent` no padrão W3C e aparece no painel "Spans do tracing" |
| Exportação para coletor | Opcional | Com `VITE_OTEL_EXPORTER_URL` preenchida, os spans também saem em OTLP/JSON |
| Polling / revalidação | OK | A telemetria é relida a cada 5s (`VITE_REFRESH_MS`); o gráfico passou de 2 para 5 pontos em 11s, com botões de pausar e revalidar agora |
| Regra de dependência dos enlaces | OK | Teste automatizado derruba os 5 enlaces, um a um: em todos, veículos online caem para 80.000, links para 4/5, alertas para 1, e as duas categorias corretas viram OFF na distribuição, OFFLINE na tabela e aparecem no incidente. Com os 5 caídos, o contador chega a 0; "Restaurar todos" devolve 100.000 |
| CORS | Não se aplica | Este projeto não consome API externa; toda a frota é gerada em memória |

## O que foi corrigido em relação à primeira versão

A auditoria da versão anterior apontou seis defeitos. Todos foram resolvidos:

| Defeito | Antes | Depois |
|---------|-------|--------|
| Só o VSAT derrubava veículos | OSPF, BGP e LTE caíam sem tirar nenhum veículo do ar: o painel parecia não funcionar | Tabela `INFRASTRUCTURE` liga cada enlace a duas categorias; qualquer queda tira 20.000 veículos, e cartões, distribuição, tabela e incidentes reagem juntos |
| IDs de veículo repetidos | `tipo.slice(0,2)` gerava `CA-00001` para Caminhão, Carro e Caminhonete — 30.000 registros com id duplicado e chave repetida no React | Mapa `VEHICLE_PREFIXES` com prefixo próprio de cada categoria (`CAM`, `CAR`, `CNT`…) |
| Erro no console | Sem favicon declarado, o navegador pedia `/favicon.ico` e recebia 404 | Ícone SVG embutido no próprio HTML |
| Contraste insuficiente | Textos pequenos em `slate-500` rendiam 3,75:1, abaixo do mínimo 4,5:1 da WCAG AA | Tons 500 e 600 redefinidos no `tailwind.config.js`, agora em 6,4:1 e 5,3:1 |
| Aviso de bundle grande | Pacote único de 639 kB; o build avisava a cada execução | Gráfico carregado sob demanda: 273 kB no pacote principal e o Recharts em chunk separado |
| Gráfico com dados fixos | A curva era gerada por uma lista de deslocamentos, sempre igual | Pontos reais coletados a cada ciclo, com horário da leitura |
| Logs congelados | O painel dizia "LIVE" mas mostrava um texto fixo com horários de 19:42 | Spans reais do módulo de tracing; incidentes derivados do estado atual dos links |
| Recálculo caro | `filter` + `reduce` criavam um array intermediário de 100.000 posições a cada mudança | Uma passada só sobre a frota; TBT caiu de 160 ms para 120 ms |

Resultado no Lighthouse, antes e depois:

| Categoria | Primeira versão | Agora |
|-----------|-----------------|-------|
| Performance | 97 | 97 |
| Accessibility | 92 | **100** |
| Best Practices | 96 | **100** |
| SEO | 82 | **100** |

## Observação sobre o OpenTelemetry

O tracing foi escrito à mão, seguindo o padrão **W3C Trace Context** — o mesmo
cabeçalho `traceparent` que o SDK oficial do OpenTelemetry usa. A escolha foi
por peso: o SDK completo (`@opentelemetry/sdk-trace-web` mais o exportador OTLP)
passa de 100 kB e derrubaria a nota de Performance, além de exigir um coletor no
ar para servir de alguma coisa.

Como o formato do identificador e o corpo OTLP/JSON são os mesmos, trocar pela
biblioteca oficial depois não muda o resto do código.
