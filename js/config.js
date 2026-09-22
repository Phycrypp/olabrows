// Picks the API address automatically: local API on this Mac, live API everywhere else
window.OLA_API_BASE = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://127.0.0.1:8080'
  : 'https://api.olabrows.store';

// Formats any amount as naira, e.g. 5000 -> "₦5,000"
window.olaNaira = function (amount) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(Number(amount) || 0);
};
