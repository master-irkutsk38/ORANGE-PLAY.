const $ = (s) => document.querySelector(s);
let products = [];
let cart = [];

const money = (n) => `${Number(n).toLocaleString('ru-RU')} ₽`;
const toast = (message) => {
  const node = $('#toast');
  node.textContent = message;
  node.classList.add('show');
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => node.classList.remove('show'), 2200);
};

function render() {
  const query = ($('#search').value || '').trim().toLowerCase();
  const platform = $('#platform').value;
  const sort = $('#sort').value;
  let list = products.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(query);
    const platforms = Array.isArray(p.platforms) ? p.platforms : [p.platform];
    const matchesPlatform = platform === 'all' || platforms.includes(platform);
    return matchesName && matchesPlatform;
  });

  if (sort === 'cheap') list.sort((a,b) => a.prices[0].price - b.prices[0].price);
  if (sort === 'expensive') list.sort((a,b) => b.prices[0].price - a.prices[0].price);
  if (sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name, 'ru'));

  $('#result-count').textContent = `${list.length} ${list.length === 1 ? 'игра' : 'игр'}`;
  $('#products').innerHTML = list.map((p) => {
    const price = p.prices[0];
    const unavailable = p.available === false;
    return `<article class="product-card">
      <div class="cover" style="--c1:${p.colors[0]};--c2:${p.colors[1]}">
        <span class="platform-badge">${p.platformLabel}</span><span class="p2-badge">ПРОФИЛЬ P2</span>
        <div class="cover-title">${p.name}</div>
      </div>
      <div class="product-info"><div class="genre">${p.genre}</div><h3>${p.name}</h3>
        <div class="price-line"><div><strong>${money(price.price)}</strong><small>${price.days} дней аренды</small></div>
        <button class="add-button" data-add="${p.id}" ${unavailable ? 'disabled' : ''}>${unavailable ? 'Недоступно' : 'В корзину'}</button></div>
        <div class="availability ${unavailable ? 'busy' : ''}">${p.status || 'Наличие уточняйте перед заказом'}</div>
      </div></article>`;
  }).join('') || '<p class="empty">По вашему запросу ничего не найдено.</p>';
}

function updateCart() {
  $('#cart-count').textContent = cart.length;
  $('#cart-total').textContent = money(cart.reduce((sum, item) => sum + item.price, 0));
  $('#cart-items').innerHTML = cart.length ? cart.map((item, index) =>
    `<div class="cart-row"><div>${item.name}<small>${item.days} дней · ${money(item.price)}</small></div><button class="remove" data-remove="${index}">Удалить</button></div>`
  ).join('') : '<p class="empty">Пока ничего нет. Добавьте игру из каталога.</p>';
}

$('#products').addEventListener('click', (event) => {
  const button = event.target.closest('[data-add]');
  if (!button) return;
  const product = products.find((p) => p.id === button.dataset.add);
  if (!product || product.available === false) return;
  const tariff = product.prices[0];
  cart.push({name: product.name, price: tariff.price, days: tariff.days});
  updateCart();
  toast('Добавлено в корзину');
});

$('#cart-items').addEventListener('click', (event) => {
  const button = event.target.closest('[data-remove]');
  if (!button) return;
  cart.splice(Number(button.dataset.remove), 1);
  updateCart();
});

$('#search').addEventListener('input', render);
$('#platform').addEventListener('change', render);
$('#sort').addEventListener('change', render);
$('#cart-open').addEventListener('click', () => document.body.classList.add('drawer-open'));
$('#cart-close').addEventListener('click', () => document.body.classList.remove('drawer-open'));
$('#backdrop').addEventListener('click', () => document.body.classList.remove('drawer-open'));
$('#checkout').addEventListener('click', () => toast('Демо-версия: оплата пока не подключена'));

fetch('data/products.json')
  .then((response) => {
    if (!response.ok) throw new Error('Не удалось загрузить каталог');
    return response.json();
  })
  .then((data) => {
    products = data;
    render();
  })
  .catch(() => {
    $('#result-count').textContent = 'Ошибка загрузки';
    $('#products').innerHTML = '<p class="empty">Не удалось загрузить каталог. Проверьте файл data/products.json.</p>';
  });

updateCart();
