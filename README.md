# Loja Foxyzin — Periféricos (template)

Site estático para vender periféricos gamers com exemplo de integração Stripe via Netlify Functions.

O que tem neste repositório:
- index.html, styles.css, app.js, products.json (frontend)
- netlify/functions/create-checkout-session.js (exemplo de função serverless que cria sessão Stripe)
- netlify.toml e .env.example

Testar localmente (frontend apenas):
1. Coloque os arquivos na pasta do projeto.
2. Abra um servidor local (recomendado): `python -m http.server 8000` ou `npx serve .`
3. Acesse http://localhost:8000

Deploy no Netlify (recomendado, gera HTTPS automático):
1. Vá em https://app.netlify.com/sites/new
2. Clique em "Import from Git" e conecte sua conta GitHub (autorize se necessário).
3. Escolha o repositório `foxyzin936/loja-foxyzin`.
4. Build command: (deixe vazio). Publish directory: `/` (root).
5. No painel do site, vá em Site settings → Build & deploy → Environment → Environment variables e adicione:
   - STRIPE_SECRET = sua_chave_secreta_do_stripe (modo teste)
   - STRIPE_PUBLISHABLE = sua_chave_publicavel
   - (Opcional) NETLIFY_SITE_URL = https://seu-site.netlify.app (normalmente não é necessário porque a função usa o Origin)
6. Clique em Deploy site. O Netlify fará o deploy e fornecerá HTTPS automático.

Segurança e notas:
- NÃO comite a STRIPE_SECRET no repositório. Use variáveis de ambiente no painel do Netlify.
- O exemplo de função lê `products.json` do repositório para usar preços confiáveis (evita confiar em valores enviados pelo frontend).

Se quiser, eu posso também conectar o Netlify ao repositório para você (preciso que me autorize a acessar sua conta Netlify), ou posso passar instruções passo-a-passo com capturas de tela.
