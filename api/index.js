const server = require('../backend/server');

module.exports = (req, res) => {
  // Correct rewrites where Vercel changes req.url to /api/index.js
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || req.headers['x-forwarded-uri'];
  if (matchedPath && req.url.startsWith('/api/index.js')) {
    const qIndex = req.url.indexOf('?');
    req.url = matchedPath + (qIndex >= 0 ? req.url.slice(qIndex) : '');
  }
  server.emit('request', req, res);
};
