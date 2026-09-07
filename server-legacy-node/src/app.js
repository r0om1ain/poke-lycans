import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import accountRoutes from './routes/account.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import listingRoutes from './routes/listing.routes.js';
import sellerRoutes from './routes/seller.routes.js';
import auctionRoutes from './routes/auction.routes.js';
import collectionRoutes from './routes/collection.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';
import messageRoutes from './routes/message.routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/sellers', sellerRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
