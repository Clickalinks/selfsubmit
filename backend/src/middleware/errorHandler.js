/**
 * Centralised error handling for Express.
 * Controllers should `next(err)` with AppError or plain Error.
 */
class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function notFoundHandler(_req, res, _next) {
  res.status(404).json({ error: 'Not found' });
}

function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const payload = {
    error: err.message || 'Internal server error',
  };
  if (err.details) {
    payload.details = err.details;
  }
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) {
    payload.stack = err.stack;
  }
  res.status(statusCode).json(payload);
}

module.exports = {
  AppError,
  notFoundHandler,
  errorHandler,
};
