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
- **Impressum / Datenschutz**: obrigatórios na Alemanha — preencher `legal` em `siteConfig.js`.

## Logo e cores da marca

- Logo oficial (insígnia circular com o navio) em `public/brand/`: original recortado com fundo transparente (`tucargo-logo.png`) e versões 128/256/512 em WebP/PNG. Favicons (`favicon.ico`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192/512.png`) gerados a partir dele.
- A paleta do site vem do logo (`src/styles/tokens.css`): mar `#019DD8`/`#01B9FF`, céu `#E1F5FE`, casco `#CC4D47`, carga `#7A664D`/`#A6875F`. Para textos e botões com fundo de cor usam-se versões mais profundas (`#0077A8`, `#C2423C`) que cumprem contraste AA.
- Para trocar o logo: substitua os arquivos mantendo os nomes (ou ajuste `siteConfig.brand.logo`).

## Globo do hero

- `src/components/Globe/` — globo interativo. Com WebGL usa texturas reais da Terra (`public/globe/`); sem WebGL, o globo de pontos.
- Texturas: NASA Blue Marble / Black Marble (domínio público), via [three-globe](https://github.com/vasturiano/three-globe), convertidas para WebP 2048×1024.
- Pontos de terra: Natural Earth (domínio público) via `world-atlas`. Para regenerar: `npm run globe:dots`.

## Experiência e movimento

- **Hero**: globo interativo (WebGL com texturas NASA; arrastar, inércia, volta à rota).
- **Travessia** (`src/components/Connection/`): cena ilustrada no estilo do logo, guiada pelo scroll — amanhecer em Düsseldorf (Rheinturm, Medienhafen, ponte do Reno), navio da marca cruzando o Atlântico, pôr do sol na costa venezuelana (El Ávila, Puerto Cabello). As 5 etapas aparecem em sequência.
- **Distância** (`src/components/Distance/`): globo + «≈ 7.965 km en línea recta» (calculado entre Düsseldorf e Caracas) e a mensagem «Ninguna distancia es suficiente para separar a una familia».
- Microinterações: botões magnéticos, cartões com inclinação 3D, faixa infinita que reage à velocidade do scroll, barra de progresso, rolagem suave (Lenis) no desktop, barra de ações fixa no celular.
- Tudo respeita `prefers-reduced-motion` e pausa fora da tela.

## Intro cinematográfica (splash)

- Arquivos em `src/components/Intro/`. **Todos os ajustes** (duração de cada fase, cores, quantidade de partículas, câmera lenta, tilt, sacudida, aberração cromática, grão, som) ficam em `introConfig.js`.
- Usa o mesmo logo do header (`siteConfig.brand.logo`); no final o logo voa até a posição exata dele no header (GSAP Flip).
- Aparece só na primeira visita (`localStorage`, chave `tucargo:intro-v1`). Para rever: botão **Ver intro** no rodapé, ou abra o site com `?intro`. Links diretos a uma seção (`#calculadora`) pulam a intro.
- Interação: tilt 3D com o mouse ou giroscópio, cursor com brilho e efeito magnético, partículas com repulsão, clique no logo = onda de choque, segurar = bullet time. `Esc` ou **Saltar intro** pulam.
- Com «reduzir movimento» ativo, faz só um fundido do logo (no celular e tablet; no computador segue o mesmo critério do resto do site, ajustável em `respectReducedMotionOnDesktop`).
- O som é gerado no navegador (Web Audio, sem arquivos) e começa desligado.
- Se mudar `storageKey`, atualize também o script no `<head>` do `index.html`.

## Vídeos cinematográficos (Higgsfield)

A seção da travessia aceita um vídeo no lugar da ilustração: preencha `siteConfig.media.voyage` (`mp4`, `webm`, `poster`, `mobileMp4`) com arquivos em `public/media/`. Recomendações: 1920×1080 (e 1080×1920 para celular), 8–15 s em loop, sem áudio, ≤ 4 MB, H.264.

Prompts sugeridos para gerar no Higgsfield:

1. **Travessia (horizontal)** — *"Cinematic slow aerial tracking shot of a red-hulled cargo ship loaded with wooden crates sailing across a calm turquoise Atlantic ocean at golden hour, soft clouds, gentle waves, warm sunlight, slow camera drift, photorealistic, 4K, seamless loop, no text, no logos"*
2. **Travessia (vertical, celular)** — mesmo prompt, *"vertical 9:16 framing, ship centered"*.
3. **Avião de carga** — *"Slow-motion cinematic shot of a cargo airplane taking off at dusk, runway lights, subtle lens flare, deep blue sky, smooth camera pan, photorealistic, seamless loop, no text"*.
4. **Chegada / família** — *"Warm cinematic close-up of hands receiving a cardboard package at a doorstep in a sunny Caribbean neighborhood, shallow depth of field, slow push-in, soft natural light, no faces, no text"*.

Para usar o Higgsfield direto daqui: libere `higgsfield.ai`/`api.higgsfield.ai` na rede do ambiente e guarde a chave como `HIGGSFIELD_API_KEY` nos segredos do ambiente (nunca no código).

## Deploy

O workflow `.github/workflows/deploy.yml` gera o build e publica `dist/` na branch `gh-pages` (GitHub Pages). O `base: './'` do Vite permite servir o site em qualquer subpasta.
