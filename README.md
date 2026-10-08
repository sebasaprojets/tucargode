# Tucargo — Envíos de Alemania a Venezuela

Site institucional e comercial da **Tucargo Düsseldorf**: envios aéreos e marítimos da Alemanha para a Venezuela, porta a porta, coleta DHL, casillero internacional e atendimento personalizado.

Feito com **React 18 + Vite 6 + Framer Motion**, CSS com design tokens (sem framework CSS), fontes self-hosted (Manrope + Inter — sem Google Fonts, bom para GDPR).

## Rodar localmente

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção em dist/
npm run preview  # pré-visualizar o build
npm run lint
```

## Onde editar o conteúdo

| O quê | Arquivo |
| --- | --- |
| Contato, WhatsApp, endereço, horário, redes, cifras | `src/config/siteConfig.js` |
| **Tarifas, mínimos, divisor volumétrico, recargos** | `src/data/shippingRates.js` |
| Destinos (e rotas fechadas) | `src/data/destinations.js` |
| Serviços | `src/data/services.js` |
| FAQ | `src/data/faq.js` |
| História, "Por qué Tucargo", passos, comparação, **depoimentos**, mosaico do Instagram | `src/data/content.js` |
| Design tokens (cores, tipografia, espaçamento, sombras, motion) | `src/styles/tokens.css` |

Os preços **nunca** ficam espalhados nos componentes — tudo é lido de `shippingRates.js`.

## Integrações preparadas (sem backend fingido)

Copie `.env.example` para `.env` e preencha:

- **Formulário de cotação** — `VITE_FORM_PROVIDER` = `formspree` | `emailjs` | `supabase` | `api`. Sem provedor, o formulário abre o WhatsApp com a solicitação já redigida.
- **Rastreamento** — `VITE_TRACKING_API_URL`. Sem API, a busca mostra um aviso honesto e oferece consulta via WhatsApp com o número já preenchido.

## Fontes dos dados

Os dados vêm do conteúdo publicado em tucargo.de (início, «¿Quiénes somos?», «Preguntas frecuentes», «Planillas y tarifas») e dos perfis oficiais (@tucargode, @tucargo1). Pontos a confirmar com a empresa:

- **Horário**: páginas do site oficial mostram horários diferentes (usado o da página inicial: L–V 9–19, Sáb 9–14).
- **Prazo aéreo**: a home diz 12–15 dias úteis; a FAQ antiga fala em 5–7 dias. Usado o da home.
- **Recargo aduanal 38,04 %** (vigente desde 08.07.2023) — confirmar se continua válido.
- **Tarifa marítima**: não publicada → "Cotización personalizada".
- **Depoimentos**: `testimonials` está vazio de propósito (nada inventado). Ao adicionar avaliações reais, a seção aparece automaticamente.
- **Logo oficial**: ainda não foi possível obter o arquivo (veja "Logo oficial" abaixo). Enquanto isso aparece um logo provisório.
- **Impressum / Datenschutz**: obrigatórios na Alemanha — preencher `legal` em `siteConfig.js`.

## Logo oficial

1. Coloque o arquivo em `public/brand/` — de preferência **SVG**, ou **PNG/WebP com fundo transparente** (mín. 600 px de largura). Ideal ter duas versões: uma **clara/branca** (para fundos escuros) e uma colorida.
2. Em `src/config/siteConfig.js` → `brand.logo`, preencha `onDark` (ex.: `'brand/tucargo-logo-white.svg'`) e, se houver, `onLight`. Ajuste `height` se precisar.
3. Header, menu mobile e rodapé passam a usar o logo oficial automaticamente. Para o favicon, substitua `public/favicon.svg`, `public/favicon-32.png` e `public/apple-touch-icon.png`.

## Globo do hero

- `src/components/Globe/` — globo interativo. Com WebGL usa texturas reais da Terra (`public/globe/`); sem WebGL, o globo de pontos.
- Texturas: NASA Blue Marble / Black Marble (domínio público), via [three-globe](https://github.com/vasturiano/three-globe), convertidas para WebP 2048×1024.
- Pontos de terra: Natural Earth (domínio público) via `world-atlas`. Para regenerar: `npm run globe:dots`.

## Deploy

O workflow `.github/workflows/deploy.yml` gera o build e publica `dist/` na branch `gh-pages` (GitHub Pages). O `base: './'` do Vite permite servir o site em qualquer subpasta.
