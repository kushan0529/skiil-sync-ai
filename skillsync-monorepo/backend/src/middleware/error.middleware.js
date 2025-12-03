module.exports = function errorHandler(err, req, res, next) {
  console.error('[error]', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Server error' });
};
