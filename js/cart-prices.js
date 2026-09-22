'use strict';
// Replaces the prices built into the page with the real ones from the admin panel,
// both for items already in the cart and for anything added later.
(async function () {
  try {
    const res = await fetch(window.OLA_API_BASE + '/api/products');
    if (!res.ok) return;
    const products = new Map((await res.json()).map((p) => [p.slug, p]));
    if (typeof PRODUCT_DATA === 'object' && PRODUCT_DATA) {
      for (const [slug, item] of Object.entries(PRODUCT_DATA)) {
        const p = products.get(slug);
        if (p) item.price = Number(p.price);
      }
    }
    if (typeof cart !== 'undefined' && Array.isArray(cart)) {
      cart.forEach((item) => { const p = products.get(item.id); if (p) item.price = Number(p.price); });
      if (typeof saveCart === 'function') saveCart();
    }
  } catch (err) {
    console.warn('Could not refresh cart prices', err);
  }
})();
