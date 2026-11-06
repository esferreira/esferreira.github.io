# Site institucional — Rebellion + Babadoc

Página estática (HTML, CSS e JS puros, sem build), publicada pelo GitHub Pages
a partir da raiz deste repositório.

## Rodar localmente

```bash
python -m http.server 4400
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

O push para `main` publica em https://esferreira.github.io/.

## Envio do formulário

Sem chave, o botão monta o e-mail e abre o Gmail ou o programa de e-mail do visitante.
Para receber direto na caixa de entrada, crie uma chave gratuita em web3forms.com
e preencha `WEB3FORMS_ACCESS_KEY` em `script.js`.
