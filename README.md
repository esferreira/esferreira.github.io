# Site institucional — Rebellion + Babadoc

Página estática (HTML, CSS e JS puros, sem build). Fica fora do app Next:
está ignorada pelo ESLint e não entra no `tsconfig`.

## Rodar localmente

```bash
python -m http.server 4400 --directory website
```

Abra http://localhost:4400.

## Pendências

- **Prints reais:** as telas de linhagem e de artefato são ilustrações em HTML/SVG
  (`<figure class="shot ...">`). Quando o ambiente demo com dados fictícios estiver
  rodando, troque cada `figure` por um `<img>` em `assets/`. **Nunca use prints com
  dados reais de cliente.**
- **Prova social:** falta uma faixa logo após o hero com números reais (ativos
  mapeados, pipelines monitorados, tempo de resolução) ou depoimentos. Só com dados
  verdadeiros e autorizados.
- **Vídeo:** uma gravação curta da IA resolvendo o chamado da seção "Na prática",
  no ambiente demo.

## Publicar

Qualquer hospedagem estática serve (GitHub Pages, Vercel, Cloudflare Pages):
publique o conteúdo da pasta `website/` como raiz.
