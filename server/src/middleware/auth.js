import { env } from '../config/env.js';
import { verifyToken } from '../lib/token.js';
import { unauthorized, forbidden } from '../lib/httpError.js';

function extractPayload(req) {
  const token = req.cookies?.[env.cookieName];
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function requireAuth(req, res, next) {
  const payload = extractPayload(req);
  if (!payload) return next(unauthorized());
  req.user = { id: payload.sub, role: payload.role };
  next();
}

export function attachUserIfPresent(req, res, next) {
  const payload = extractPayload(req);
  if (payload) req.user = { id: payload.sub, role: payload.role };
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user) return next(unauthorized());
  if (req.user.role !== 'ADMIN') return next(forbidden());
  next();
}
