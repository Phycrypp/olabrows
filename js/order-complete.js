'use strict';
(function () {
  const naira = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const reference = (params.get('reference') || params.get('trxref') || '').trim();
  const MAX_CHECKS = 24;          // about 2 minutes, for bank transfers still on their way
  let checks = 0;

  function show(title, message) {
    $('title').textContent = title;
    $('message').textContent = message;
  }

  function showSummary(order) {
    const rows = [['Order reference', order.reference], ['Items', order.items || ''], ['Total paid', naira.format(Number(order.total) || 0)]];
    const summary = $('summary');
    summary.replaceChildren(...rows.map(([k, v]) => {
      const row = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      row.append(dt, dd);
      return row;
    }));
    summary.hidden = false;
  }

  async function check() {
    if (!/^OLA-[A-Z0-9]{10}$/.test(reference)) {
      show('We could not find your order', 'The link is missing an order reference. If you paid, check your email or contact us with your payment receipt.');
      return;
    }
    checks++;
    try {
      const res = await fetch(window.OLA_API_BASE + '/api/checkout/verify/' + encodeURIComponent(reference));
      const data = await res.json().catch(() => ({}));
      if (res.status === 404) { show('We could not find your order', data.error || 'Please contact us with your payment receipt.'); return; }
      if (!res.ok) throw new Error(data.error || 'Could not check payment');

      if (data.paid) {
        localStorage.removeItem('ola_cart');
        show('Thank you' + (data.firstName ? ', ' + data.firstName : '') + '!',
             'Your payment was successful and your order is confirmed. Keep your order reference in case you need to contact us.');
        showSummary(data);
        return;
      }
      if (checks < MAX_CHECKS) {
        show('Waiting for your payment', 'If you paid by bank transfer, it can take a minute or two to arrive. This page will update on its own.');
        setTimeout(check, 5000);
      } else {
        show('Payment not confirmed yet', 'We have not received your payment yet. If you completed a transfer, it will be confirmed automatically and you will not be charged twice. Your order reference is ' + reference + '.');
      }
    } catch (err) {
      console.error(err);
      if (checks < MAX_CHECKS) setTimeout(check, 5000);
      else show('We could not check your payment', 'Please refresh this page in a moment. Your order reference is ' + reference + '.');
    }
  }

  check();
})();
