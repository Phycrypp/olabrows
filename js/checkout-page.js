'use strict';
(function () {
  const naira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
  const $ = (id) => document.getElementById(id);

  function readCart() {
    try {
      const items = JSON.parse(localStorage.getItem('ola_cart') || '[]');
      return Array.isArray(items) ? items : [];
    } catch { return []; }
  }

  // Merge the cart into Web ID + quantity only. Prices always come from the server.
  function cartToItems(cart) {
    const bySlug = new Map();
    for (const item of cart) {
      const slug = String(item?.id || '').trim().toLowerCase();
      const qty = Math.max(1, Math.min(10, parseInt(item?.qty, 10) || 1));
      if (!/^[a-z0-9-]+$/.test(slug)) continue;
      bySlug.set(slug, Math.min(10, (bySlug.get(slug) || 0) + qty));
    }
    return [...bySlug].map(([slug, qty]) => ({ slug, qty }));
  }

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function showEmpty() {
    const box = el('div', 'empty');
    box.append(el('h1', null, 'Your cart is empty'), el('p', 'lead', 'Add a product to your cart to check out.'));
    const link = el('a', null, 'Go to the shop');
    link.href = 'shop.html';
    box.append(link);
    $('checkout').replaceChildren(box);
  }

  let items = [];

  async function loadSummary() {
    items = cartToItems(readCart());
    if (!items.length) { showEmpty(); return; }
    try {
      const res = await fetch(window.OLA_API_BASE + '/api/products');
      if (!res.ok) throw new Error('API returned ' + res.status);
      const products = new Map((await res.json()).map((p) => [p.slug, p]));
      let total = 0;
      const rows = [];
      items = items.filter((i) => {
        const p = products.get(i.slug);
        if (!p || p.active === false) return false;
        const lineTotal = Number(p.price) * i.qty;
        total += lineTotal;
        const left = el('div');
        left.append(el('span', null, (p.name || i.slug) + ' × ' + i.qty));
        if (p.variant) left.append(el('small', null, p.variant));
        const row = el('div', 'line');
        row.append(left, el('span', 'amt', naira.format(lineTotal)));
        rows.push(row);
        return true;
      });
      if (!items.length) { showEmpty(); return; }
      $('lines').replaceChildren(...rows);
      $('total').textContent = naira.format(total);
    } catch (err) {
      console.error('Could not load prices:', err);
      $('lines').replaceChildren(el('p', 'note', 'Prices could not be loaded. They will be confirmed when you continue to payment.'));
    }
  }

  $('checkout-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const error = $('error');
    error.textContent = '';
    const customer = {
      name: $('name').value.trim(),
      email: $('email').value.trim(),
      phone: $('phone').value.trim(),
      address: $('address').value.trim(),
      city: $('city').value.trim(),
      state: $('state').value.trim(),
      country: $('country').value.trim() || 'Nigeria'
    };
    if (!customer.name || !customer.address || !customer.city) { error.textContent = 'Please fill in your name and delivery address.'; return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) { error.textContent = 'Please enter a valid email address.'; return; }
    if (!customer.phone) { error.textContent = 'Please enter a phone number for delivery.'; return; }
    if (!items.length) { showEmpty(); return; }

    const btn = $('pay-btn');
    btn.disabled = true;
    btn.textContent = 'Taking you to Paystack…';
    try {
      const res = await fetch(window.OLA_API_BASE + '/api/checkout/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) throw new Error('Too many attempts. Please wait a minute and try again.');
      if (!res.ok || !data.authorizationUrl) throw new Error(data.error || 'We could not start the payment. Please try again.');
      // Only ever send the customer to Paystack's own checkout
      const url = new URL(data.authorizationUrl);
      if (url.protocol !== 'https:' || !/(^|\.)paystack\.(com|co)$/.test(url.hostname)) throw new Error('Unexpected payment address. Please contact us.');
      window.location.href = url.href;
    } catch (err) {
      error.textContent = err.message;
      btn.disabled = false;
      btn.textContent = 'Continue to payment';
    }
  });

  loadSummary();
})();
