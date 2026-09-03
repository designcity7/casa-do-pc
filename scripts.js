// scripts.js — comportamento: scroll animations, modal, carrinho simples, serviços
document.addEventListener('DOMContentLoaded', () => {
  // Utilities
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  // Set current year
  $('#year').textContent = new Date().getFullYear();

  // Mobile burger
  const burger = $('#burger');
  burger && burger.addEventListener('click', () => {
    document.querySelector('.nav').classList.toggle('open');
  });

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      const id = a.getAttribute('href');
      if (id && id.startsWith('#')) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({behavior:'smooth', block:'start'});
        }
      }
    });
  });

  // IntersectionObserver for fade-in animations
  const io = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, {threshold: 0.12});
  document.querySelectorAll('.fade-in').forEach(el=>io.observe(el));

  // Produtos (dados simples; em produção, buscar via API)
  const PRODUCTS = {
    'pc-1': { id:'pc-1', title:'PC Gamer Avançado', price:6499.00, img:'https://source.unsplash.com/1200x900/?desktop,computer', desc:'Ryzen 7, RTX 4070, 16GB RAM, SSD 1TB.' },
    'case-1': { id:'case-1', title:'Capinha Silicon', price:49.90, img:'https://source.unsplash.com/1200x900/?phone-case,phone-accessory', desc:'Capinha protetora com boa aderência.' },
    'jbl-1': { id:'jbl-1', title:'JBL Bluetooth Box', price:399.00, img:'https://source.unsplash.com/1200x900/?jbl,speaker,bluetooth', desc:'Som potente e conexão Bluetooth.' },
    'film-1': { id:'film-1', title:'Película Temperada', price:29.90, img:'https://source.unsplash.com/1200x900/?screen-protector,tempered,phone', desc:'Película protetora resistente.' }
  };

  // Serviços (adicionados com base no perfil que você enviou)
  const SERVICES = {
    'serv-1': { id:'serv-1', title:'Conserto de Celulares', priceText:'Orçamento', img:'https://source.unsplash.com/1200x800/?phone,screen,repair', desc:'Troca de tela, tampa, bateria, diagnóstico e manutenção geral.' },
    'serv-2': { id:'serv-2', title:'Manutenção de Computadores', priceText:'Orçamento', img:'https://source.unsplash.com/1200x800/?laptop,repair,technician', desc:'Limpeza interna, troca de peças, montagem e otimização de desempenho.' },
    'serv-3': { id:'serv-3', title:'Reparo de Videogames e Controles', priceText:'Orçamento', img:'https://source.unsplash.com/1200x800/?game-controller,repair,console', desc:'Conserto de consoles, limpeza de leitores, reparo de drift em controles.' },
    'serv-4': { id:'serv-4', title:'Limpeza e Reparos em Caixas de Som', priceText:'Orçamento', img:'https://source.unsplash.com/1200x800/?speaker,repair,cleaning', desc:'Higienização, troca de componentes e conserto de falhas em caixas e fones.' }
  };

  // Modal produto/serviço
  const modal = $('#product-modal'), modalBody = $('#modal-body'), modalClose = $('#modal-close');
  function openProduct(id){
    const p = PRODUCTS[id];
    modalBody.innerHTML = `
      <div style="display:flex;gap:1rem;flex-wrap:wrap">
        <img src="${p.img}" alt="${p.title}" style="width:320px;max-width:100%;height:auto;border-radius:8px;object-fit:cover"/>
        <div style="flex:1">
          <h3>${p.title}</h3>
          <p style="color:var(--accent);font-weight:700">R$ ${p.price.toFixed(2).replace('.',',')}</p>
          <p>${p.desc}</p>
          <div style="margin-top:1rem">
            <button class="btn primary add-cart" data-id="${p.id}">Adicionar ao carrinho</button>
          </div>
        </div>
      </div>
    `;
    modal.setAttribute('aria-hidden','false');
  }
  function openService(id){
    const s = SERVICES[id];
    modalBody.innerHTML = `
      <div style="display:flex;gap:1rem;flex-wrap:wrap">
        <img src="${s.img}" alt="${s.title}" style="width:320px;max-width:100%;height:auto;border-radius:8px;object-fit:cover"/>
        <div style="flex:1">
          <h3>${s.title}</h3>
          <p style="color:var(--accent);font-weight:700">${s.priceText}</p>
          <p>${s.desc}</p>
          <div style="margin-top:1rem">
            <a href="#contato" class="btn primary">Pedir Orçamento</a>
            <button class="btn ghost" onclick="closeModal()">Fechar</button>
          </div>
        </div>
      </div>
    `;
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); modalBody.innerHTML = ''; }
  modalClose && modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{ if(e.target === modal) closeModal(); });

  // Delegation: view product/service buttons
  document.body.addEventListener('click', (e)=>{
    if (e.target.matches('.view-product')) {
      openProduct(e.target.dataset.id);
    }
    if (e.target.matches('.view-service')) {
      openService(e.target.dataset.id);
    }
    if (e.target.matches('.add-cart')) {
      const id = e.target.dataset.id;
      addToCart(id);
      updateCartUI();
      if (modal.getAttribute('aria-hidden') === 'false') closeModal();
    }
  });

  // Cart (localStorage)
  const CART_KEY = 'casadopc_cart_v1';
  function getCart(){ return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
  function saveCart(cart){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  function addToCart(id){
    const cart = getCart();
    const item = cart.find(i=>i.id===id);
    if(item) item.qty++;
    else cart.push({id, qty:1});
    saveCart(cart);
    showToast('Adicionado ao carrinho');
  }
  function removeFromCart(id){
    let cart = getCart();
    cart = cart.filter(i=>i.id!==id);
    saveCart(cart);
    updateCartUI();
  }

  // Cart UI panel
  const cartBtn = $('#cart-btn'), cartPanel = $('#cart-panel'), closeCart = $('#close-cart');
  cartBtn && cartBtn.addEventListener('click', ()=>{ cartPanel.setAttribute('aria-hidden','false'); updateCartUI(); });
  closeCart && closeCart.addEventListener('click', ()=> cartPanel.setAttribute('aria-hidden','true'));

  function formatCurrency(v){ return 'R$ ' + v.toFixed(2).replace('.',','); }
  function updateCartUI(){
    const itemsContainer = $('#cart-items');
    const cart = getCart();
    const itemsHtml = cart.map(ci=>{
      const p = PRODUCTS[ci.id];
      return `<div style="display:flex;gap:.8rem;align-items:center;padding:.6rem 0;border-bottom:1px solid #eee">
        <img src="${p.img}" style="width:64px;height:48px;object-fit:cover;border-radius:6px" alt="${p.title}"/>
        <div style="flex:1">
          <div style="font-weight:600">${p.title}</div>
          <div style="color:#666">${ci.qty} x ${formatCurrency(p.price)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700">${formatCurrency(p.price * ci.qty)}</div>
          <button class="btn small" onclick="removeFromCartInline('${ci.id}')">Remover</button>
        </div>
      </div>`;
    }).join('') || '<p>Seu carrinho está vazio.</p>';
    itemsContainer.innerHTML = itemsHtml;
    const total = cart.reduce((s,ci)=> s + PRODUCTS[ci.id].price * ci.qty, 0);
    $('#cart-total').textContent = formatCurrency(total);
    $('#cart-count').textContent = cart.reduce((s,i)=>s+i.qty, 0);
  }

  // allow removing via inline onclick
  window.removeFromCartInline = function(id){
    removeFromCart(id);
    updateCartUI();
  };

  // small toast
  function showToast(text){
    let t = document.createElement('div');
    t.textContent = text;
    Object.assign(t.style,{position:'fixed',right:'20px',bottom:'20px',background:'rgba(0,0,0,0.8)',color:'#fff',padding:'10px 14px',borderRadius:'8px',zIndex:9999});
    document.body.appendChild(t);
    setTimeout(()=> t.style.opacity = '0',2200);
    setTimeout(()=> t.remove(),2600);
  }

  // Initialize
  updateCartUI();

  // Contact form basic handler (demo)
  $('#contact-form').addEventListener('submit', (e)=>{
    e.preventDefault();
    showToast('Mensagem enviada — entraremos em contato em breve.');
    e.target.reset();
  });

});
