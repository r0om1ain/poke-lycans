import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { userModel } from '../models/userModel.js';
import { asyncHandler } from '../lib/asyncHandler.js';
import { badRequest, conflict, unauthorized } from '../lib/httpError.js';
import { signToken, cookieOptions } from '../lib/token.js';
import { serializeUserPrivate } from '../lib/serializers.js';
import { env } from '../config/env.js';

const registerSchema = z.object({
  username: z.string().min(3).max(32),
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  country: z.string().optional(),
});

const loginSchema = z.object({
  identifier: z.string().min(1), // email ou pseudo
  password: z.string().min(1),
});

function setAuthCookie(res, user) {
  const token = signToken(user);
  res.cookie(env.cookieName, token, cookieOptions);
}

export const authController = {
  register: asyncHandler(async (req, res, next) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));
    const { username, email, password, firstName, lastName, country } = parsed.data;

    if (await userModel.findByEmail(email)) return next(conflict('Cet e-mail est déjà utilisé'));
    if (await userModel.findByUsername(username)) return next(conflict('Ce pseudo est déjà pris'));

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.create({ username, email, passwordHash, firstName, lastName, country });

    setAuthCookie(res, user);
    res.status(201).json({ user: serializeUserPrivate(user) });
  }),

  login: asyncHandler(async (req, res, next) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return next(badRequest('Champs invalides', parsed.error.flatten()));
    const { identifier, password } = parsed.data;

    const user = identifier.includes('@')
      ? await userModel.findByEmail(identifier)
      : await userModel.findByUsername(identifier);
    if (!user) return next(unauthorized('Identifiants incorrects'));

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return next(unauthorized('Identifiants incorrects'));

    setAuthCookie(res, user);
    res.json({ user: serializeUserPrivate(user) });
  }),

  logout: asyncHandler(async (req, res) => {
    res.clearCookie(env.cookieName, { ...cookieOptions, maxAge: undefined });
    res.status(204).end();
  }),

  me: asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user.id);
    if (!user) return next(unauthorized());
    res.json({ user: serializeUserPrivate(user) });
  }),
};
