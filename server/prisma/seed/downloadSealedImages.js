import { readFileSync, mkdirSync, createWriteStream, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { prisma } from '../../src/config/prisma.js';
import { categoryModel } from '../../src/models/lookupModel.js';
import { seriesModel } from '../../src/models/seriesModel.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'public', 'uploads', 'products');
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) TCGWorldSeedBot/1.0';

// Suit exactement la méthode MediaWiki décrite dans GUIDE_RECUPERATION_TCG.md
// (§4) : Poképédia et Bulbagarden Archives n'indexent pas les produits
// scellés via une API de cartes classique, il faut passer par l'API
// MediaWiki des encyclopédies pour obtenir l'URL directe de l'image.
// Poképédia sert son API MediaWiki à la racine (/api.php) ; Bulbagarden
// Archives la sert sous /w/api.php — chemins différents selon l'installation.
const API_PATH_BY_DOMAIN = {
  'archives.bulbagarden.net': '/w/api.php',
};

async function resolveWikiImageUrl(domain, fileName) {
  const apiPath = API_PATH_BY_DOMAIN[domain] ?? '/api.php';
  const apiUrl =
    `https://${domain}${apiPath}?action=query&titles=` +
    `File:${encodeURIComponent(fileName)}|Fichier:${encodeURIComponent(fileName)}` +
    `&prop=imageinfo&iiprop=url&format=json`;

  const res = await fetch(apiUrl, { headers: { 'User-Agent': USER_AGENT } });
  const json = await res.json();
  const pages = json.query?.pages ?? {};
  const pageId = Object.keys(pages)[0];
  if (pageId === '-1' || !pages[pageId]?.imageinfo) {
    throw new Error(`Fichier introuvable sur ${domain} : ${fileName}`);
  }
  return pages[pageId].imageinfo[0].url;
}

async function downloadToFile(url, destPath) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok || !res.body) throw new Error(`Téléchargement échoué (${res.status}) : ${url}`);
  await pipeline(Readable.fromWeb(res.body), createWriteStream(destPath));
}

export async function downloadSealedImages() {
  mkdirSync(UPLOADS_DIR, { recursive: true });

  const items = JSON.parse(
    readFileSync(path.join(__dirname, 'sealedProducts.json'), 'utf-8'),
  );

  let created = 0;
  for (const item of items) {
    const category = await categoryModel.findBySlug(item.categorySlug);
    if (!category) {
      console.warn(`[seed] catégorie "${item.categorySlug}" introuvable, "${item.name}" ignoré`);
      continue;
    }
    const series = await seriesModel.findByCode(item.seriesCode);
    if (!series) {
      console.warn(`[seed] série "${item.seriesCode}" introuvable, "${item.name}" ignoré (lancer fetchCards() avant)`);
      continue;
    }

    const ext = path.extname(item.wikiFile) || '.png';
    const localFileName = `${item.slug}${ext}`;
    const localPath = path.join(UPLOADS_DIR, localFileName);
    const publicUrl = `/uploads/products/${localFileName}`;

    if (!existsSync(localPath)) {
      try {
        const remoteUrl = await resolveWikiImageUrl(item.wikiDomain, item.wikiFile);
        await downloadToFile(remoteUrl, localPath);
        console.log(`[seed] image téléchargée : ${item.name} <- ${item.wikiDomain}`);
      } catch (err) {
        console.warn(`[seed] échec téléchargement "${item.name}" : ${err.message}`);
        continue;
      }
    }

    await prisma.product.upsert({
      where: { tcgdexId: `sealed:${item.slug}` },
      update: { name: item.name, imageUrl: publicUrl, seriesId: series.id, categoryId: category.id },
      create: {
        tcgdexId: `sealed:${item.slug}`,
        name: item.name,
        imageUrl: publicUrl,
        seriesId: series.id,
        categoryId: category.id,
      },
    });
    created += 1;
  }

  console.log(`[seed] produits scellés : ${created}/${items.length} traités`);
}
