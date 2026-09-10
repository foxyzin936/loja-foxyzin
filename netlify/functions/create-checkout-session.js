// Exemplo de função Netlify para criar sessão de checkout no Stripe
// Lembre-se: configure STRIPE_SECRET no painel do Netlify (variáveis de ambiente)

const fs = require('fs');
const path = require('path');
const stripeLib = require('stripe');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const origin = (event.headers && (event.headers.origin || event.headers.Origin || event.headers.referer)) || '';

  const stripeSecret = process.env.STRIPE_SECRET;
  if(!stripeSecret){
    return { statusCode: 500, body: JSON.stringify({ error: 'STRIPE_SECRET not configured' }) };
  }
  const stripe = stripeLib(stripeSecret);

  let body = {};
  try{
    body = JSON.parse(event.body || '{}');
  }catch(e){
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const items = body.items || [];
  if(!Array.isArray(items) || items.length === 0){
    return { statusCode: 400, body: JSON.stringify({ error: 'Empty cart' }) };
  }

  // Carrega produtos do repositório para validar preços
  const productsPath = path.resolve(process.cwd(), 'products.json');
  let prodList = [];
  try{
    const raw = fs.readFileSync(productsPath, 'utf8');
    prodList = JSON.parse(raw);
  }catch(e){
    return { statusCode: 500, body: JSON.stringify({ error: 'Could not read products.json', detail: e.message }) };
  }

  // Monta line_items para Stripe
  const line_items = [];
  for(const it of items){
    const p = prodList.find(x => x.id === it.id);
    if(!p){
      return { statusCode: 400, body: JSON.stringify({ error: `Produto não encontrado: ${it.id}` }) };
    }
    const unit_amount = Math.round(p.price * 100); // centavos
    line_items.push({
      price_data: {
        currency: 'brl',
        product_data: { name: p.name },
        unit_amount
      },
      quantity: it.quantity || 1
    });
  }

  try{
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url: session.url })
    };
  }catch(e){
    console.error('Stripe error', e);
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe error', detail: e.message }) };
  }
};
