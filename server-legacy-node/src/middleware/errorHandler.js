import { HttpError } from '../lib/httpError.js';
import { isProd } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Route introuvable' });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  console.error(err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    ...(isProd ? {} : { detail: err.message, stack: err.stack }),
  });
}
