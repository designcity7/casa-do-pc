
 document.querySelectorAll('.reveal:not(.visible)').forEach(element=>observer.observe(element));
}
function renderProducts(){productGrid.innerHTML=products.map(productTemplate).join('');observeReveals()}
function saveCart(){localStorage.setItem('casa-do-pc-cart',JSON.stringify(cart))}
function renderCart(){
 cartCount.textContent=cart.reduce((total,item)=>total+item.quantity,0);
 cartItems.innerHTML=cart.length?cart.map(item=>{const product=products.find(entry=>entry.id===item.id);return `<div class="cart-item"><img src="${product.image}" alt=""><div><h4>${product.name}</h4><p>${item.quantity} × ${money(product.price)}</p></div><button data-remove="${item.id}">Remover</button></div>`}).join(''):'<div class="cart-empty"><b>Seu carrinho está vazio.</b><p>Escolha seus equipamentos e volte aqui.</p></div>';
 const total=cart.reduce((sum,item)=>{const product=products.find(entry=>entry.id===item.id);return sum+product.price*item.quantity},0);
 cartTotal.textContent=money(total);
}
function showToast(message){clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('visible');toastTimer=setTimeout(()=>toast.classList.remove('visible'),2500)}
function openCart(){cartDrawer.removeAttribute('inert');cartDrawer.setAttribute('aria-hidden','false');scrim.classList.add('visible');document.body.classList.add('locked');document.querySelector('#close-cart').focus()}
function closeCart(){cartDrawer.setAttribute('inert','');cartDrawer.setAttribute('aria-hidden','true');scrim.classList.remove('visible');document.body.classList.remove('locked');document.querySelector('#cart-button').focus()}

document.addEventListener('click',event=>{
 const addButton=event.target.closest('[data-add]');const removeButton=event.target.closest('[data-remove]');const toastButton=event.target.closest('[data-toast]');
 if(addButton){const item=cart.find(entry=>entry.id===addButton.dataset.add);if(item)item.quantity+=1;else cart.push({id:addButton.dataset.add,quantity:1});saveCart();renderCart();showToast('Produto adicionado ao carrinho!')}
 if(removeButton){cart=cart.filter(entry=>entry.id!==removeButton.dataset.remove);saveCart();renderCart()}
 if(toastButton&&!addButton)showToast(toastButton.dataset.toast);
});
document.querySelector('#cart-button').addEventListener('click',openCart);
document.querySelector('#close-cart').addEventListener('click',closeCart);
scrim.addEventListener('click',closeCart);
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeCart()});
const menuButton=document.querySelector('#menu-button');const navigation=document.querySelector('#main-nav');
menuButton.addEventListener('click',()=>{const isOpen=navigation.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(isOpen))});
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{navigation.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));
document.querySelector('#show-more').addEventListener('click',event=>{document.querySelectorAll('.hidden-product').forEach(card=>card.classList.remove('hidden-product'));event.currentTarget.remove();showToast('Todos os produtos foram exibidos.')});
document.querySelector('#newsletter-form').addEventListener('submit',event=>{event.preventDefault();showToast('Cadastro realizado! Bem-vindo à comunidade.');event.currentTarget.reset()});
document.querySelector('#checkout').addEventListener('click',()=>showToast(cart.length?'Checkout demonstrativo — integração em breve.':'Adicione um produto antes de continuar.'));
document.querySelector('#year').textContent=new Date().getFullYear();
renderProducts();renderCart();observeReveals()
