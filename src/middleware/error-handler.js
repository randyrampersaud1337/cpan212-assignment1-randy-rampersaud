import { HttpError } from '../lib/http-error.js';

// Express treats a middleware with four parameters as an error handler.
export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    const body = { message: err.message };

    if (err.status === 400 && err.details) {
      body.details = err.details;
    }

    return res.status(err.status).json({ error: body });
  }

  // Anything else is a bug. The details go to the terminal, never to the client.
  console.error(err);
  res.status(500).json({ error: { message: 'Internal server error' } });
}