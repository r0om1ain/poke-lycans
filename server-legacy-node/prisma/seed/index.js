import { seedLookups } from './lookups.js';
import { fetchCards } from './fetchCards.js';
import { downloadSealedImages } from './downloadSealedImages.js';
import { prisma } from '../../src/config/prisma.js';

async function main() {
  console.log('[seed] démarrage...');
  await seedLookups();
  await fetchCards();
  await downloadSealedImages();
  console.log('[seed] terminé.');
}

main()
  .catch((err) => {
    console.error('[seed] échec :', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
