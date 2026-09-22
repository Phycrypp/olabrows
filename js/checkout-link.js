'use strict';
// Sends every "Proceed to Checkout" button to the Paystack checkout page,
// replacing the old Stripe checkout pop-up.
document.addEventListener('click', function (event) {
  const btn = event.target.closest('#checkoutBtn, .cart-checkout-btn, [onclick*="startCheckout"], [onclick*="openCheckout"]');
  if (!btn) return;
  event.preventDefault();
  event.stopPropagation();
  location.href = 'checkout.html';
}, true);
