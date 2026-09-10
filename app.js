// Carrega produtos e gerencia carrinho simples (localStorage)
const PRODUCTS_URL = 'products.json';

let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '{}');

function money(v){ return v.toFixed(2); }

async function loadProducts(){
  try{
    const res = await fetch(PRODUCTS_URL);
    products = await res.json();
    renderProducts();
    updateCartCount();
  }catch(e){
    console.error('Erro carregando produtos', e);
    document.getElementById('products').innerText = 'Erro ao carregar produtos.';
  }
}

function renderProducts(){
  const container = document.getElementById('products');
  container.innerHTML = '';
  products.forEach(p=>{
    const card = document.createElement('article');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <h4>${p.name}</h4>
      <p>R$ ${money(p.price)}</p>
      <div class="price">
        <button data-id="${p.id}" class="add-btn">Adicionar ao Carrinho</button>
      </div>
    `;
    container.appendChild(card);
  });
  container.querySelectorAll('.add-btn').forEach(b=>{
    b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      addToCart(id);
    })
  });
}

function addToCart(id){
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
  updateCartCount();
}

function saveCart(){
  localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount(){
  const count = Object.values(cart).reduce((s,v)=>s+v,0);
  document.getElementById('cart-count').innerText = count;
}

function openCart(){
  const modal = document.getElementById('cart-modal');
  modal.setAttribute('aria-hidden','false');
  renderCartItems();
}

function closeCart(){
  const modal = document.getElementById('cart-modal');
  modal.setAttribute('aria-hidden','true');
}

function renderCartItems(){
  const cont = document.getElementById('cart-items');
  cont.innerHTML = '';
  const entries = Object.entries(cart);
  if(entries.length === 0){
    cont.innerHTML = '<p>Seu carrinho está vazio.</p>';
    document.getElementById('cart-total').innerText = '0.00';
    return;
  }
  let total = 0;
  entries.forEach(([id, qty])=>{
    const p = products.find(x=>x.id===id);
    if(!p) return;
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div>
        <div><strong>${p.name}</strong></div>
        <div>R$ ${money(p.price)} x ${qty}</div>
        <div style="margin-top:6px">
          <button data-id="${id}" class="dec">-</button>
          <button data-id="${id}" class="inc">+</button>
          <button data-id="${id}" class="rem">Remover</button>
        </div>
      </div>
    `;
    cont.appendChild(item);
    total += p.price * qty;
  });
  document.getElementById('cart-total').innerText = money(total);
  // eventos
  cont.querySelectorAll('.inc').forEach(b=>b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id; cart[id] = (cart[id]||0)+1; saveCart(); renderCartItems(); updateCartCount();
  }));
  cont.querySelectorAll('.dec').forEach(b=>b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id; cart[id] = Math.max(0,(cart[id]||0)-1); if(cart[id]===0) delete cart[id]; saveCart(); renderCartItems(); updateCartCount();
  }));
  cont.querySelectorAll('.rem').forEach(b=>b.addEventListener('click', e=>{
    const id = e.currentTarget.dataset.id; delete cart[id]; saveCart(); renderCartItems(); updateCartCount();
  }));
}

async function checkout(){
  // Envia o carrinho para a função serverless que cria sessão Stripe
  const items = Object.entries(cart).map(([id, qty])=>({id, quantity: qty}));
  if(items.length === 0){ alert('Carrinho vazio'); return; }
  try{
    const res = await fetch('/.netlify/functions/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items })
    });
    const data = await res.json();
    if(data.url){
      // Redireciona para o Checkout do Stripe
      window.location = data.url;
    }else{
      alert('Erro ao criar sessão de pagamento');
      console.error(data);
    }
  }catch(err){
    console.error('Erro no checkout', err);
    alert('Erro ao processar o checkout. Veja o console.');
  }
}


document.getElementById('cart-btn').addEventListener('click', openCart);
document.getElementById('close-cart').addEventListener('click', closeCart);
document.getElementById('checkout-btn').addEventListener('click', checkout);

loadProducts();
