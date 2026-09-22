// Picks the API address automatically: local API on this Mac, live API everywhere else
window.OLA_API_BASE = ['localhost', '127.0.0.1'].includes(location.hostname)
  ? 'http://127.0.0.1:8080'
  : 'https://api.olabrows.store';
