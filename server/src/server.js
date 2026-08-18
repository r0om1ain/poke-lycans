import { app } from './app.js';
import { env } from './config/env.js';
import { startAuctionScheduler } from './services/auctionSchedulerService.js';

app.listen(env.port, () => {
  console.log(`[server] TCGWorld API listening on http://localhost:${env.port}`);
  startAuctionScheduler();
});
