# Guide Complet : Récupération des Visuels & Données Officiels du JCC Pokémon

Ce guide explique étape par étape comment récupérer de manière fiable et automatisée les visuels **100% officiels** pour **toutes les catégories de produits Pokémon TCG** : cartes à l'unité et produits scellés (*ETB, Displays, UPC, Booster Bundles, Coffrets, Pokébox*).

---

## Sommaire

1. [Vue d'ensemble : Cartes vs Produits Scellés](#1-vue-densemble--cartes-vs-produits-scellés)
2. [Méthode 1 : Récupérer les Cartes (API TCGdex)](#2-méthode-1--récupérer-les-cartes-api-tcgdex)
3. [Méthode 2 : Récupérer les Produits Scellés (ETB, Display, UPC, Bundles)](#3-méthode-2--récupérer-les-produits-scellés-etb-display-upc-bundles)
   - [A. Pourquoi les API de cartes ne suffisent pas](#a-pourquoi-les-api-de-cartes-ne-suffisent-pas)
   - [B. Les sources officielles d'archives](#b-les-sources-officielles-darchives)
   - [C. Nomenclatures officielles des fichiers](#c-nomenclatures-officielles-des-fichiers)
4. [Automatisation : Scripts clé en main (Node.js & Python)](#4-automatisation--scripts-clé-en-main-nodejs--python)
   - [Script universel MediaWiki API](#script-universel-mediawiki-api)
   - [Script de téléchargement sécurisé anti-403](#script-de-téléchargement-sécurisé-anti-403)
5. [Tableau récapitulatif par type de produit](#5-tableau-récapitulatif-par-type-de-produit)

---

## 1. Vue d'ensemble : Cartes vs Produits Scellés

| Catégorie | Ce que c'est | Meilleure Source | Méthode d'accès |
|---|---|---|---|
| **Cartes** | Cartes à l'unité (Dracaufeu, Pikachu, etc.) | **TCGdex API** (Gratuit, FR/EN, sans clé) | Requête HTTP REST (`GET`) |
| **ETB** | Coffret Dresseur d'Élite | **Poképédia / Bulbapedia Archives** | API MediaWiki / URL CDN |
| **Display** | Boîte de 36 boosters | **Bulbagarden Archives / Poképédia** | API MediaWiki / URL CDN |
| **UPC / Super-Premium** | Coffrets Ultra-Premium (15+ boosters) | **Poképédia / Pokémon Center CDN** | API MediaWiki / URL CDN |
| **Booster Bundle** | Lots de 6 boosters scellés | **Poképédia / Bulbapedia Archives** | API MediaWiki / URL CDN |
| **Boosters unitaires** | Pochettes individuelles | **Poképédia / TCGdex** | API MediaWiki / CDN |

---

## 2. Méthode 1 : Récupérer les Cartes (API TCGdex)

Pour les cartes, **TCGdex** est la référence absolue :
- ✅ Données et cartes disponibles en **Français** (`/fr/`) et Anglais (`/en/`).
- ✅ Scans haute définition officiels en format WebP ultra-léger.
- ✅ Aucune clé API requise, pas de limite agressive.

### URL de Base de l'API
```text
https://api.tcgdex.net/v2/fr/cards/{set_id}-{card_local_id}
```

### Exemples d'appels :
* **Dracaufeu Set de Base 1ère Édition :**
  ```text
  GET https://api.tcgdex.net/v2/fr/cards/base1-4
  ```
* **Mewtwo de Destinées Occultes :**
  ```text
  GET https://api.tcgdex.net/v2/fr/cards/sm115-31
  ```
* **Pikachu Évolutions Prismatiques :**
  ```text
  GET https://api.tcgdex.net/v2/fr/cards/sv08.5-027
  ```

### Structure des URLs d'images retournées :
* Image haute résolution : `https://assets.tcgdex.net/fr/{serie}/{set}/{card_number}/high.webp`
* Image basse résolution (vignette) : `https://assets.tcgdex.net/fr/{serie}/{set}/{card_number}/low.webp`

---

## 3. Méthode 2 : Récupérer les Produits Scellés (ETB, Display, UPC, Bundles)

### A. Pourquoi les API de cartes ne suffisent pas
Les API classiques du JCC (*TCGdex*, *PokemonTCG.io*) n'indexent **que les cartes et les extensions**, pas les boîtes commerciales scellées (*packaging*).

### B. Les sources officielles d'archives
Les visuels de packaging officiels de *The Pokémon Company* sont hébergés et référencés sur les encyclopédies officielles MediaWiki :
1. **Poképédia (Français) :** `https://www.pokepedia.fr/`
2. **Bulbagarden Archives (International) :** `https://archives.bulbagarden.net/`

### C. Nomenclatures officielles des fichiers

Pour trouver instantanément le visuel d'un item, il suffit d'utiliser le pattern de nommage standard MediaWiki :

#### 1. Coffret Dresseur d'Élite (ETB) :
* Modèle Poképédia : `Fichier:Coffret_Dresseur_d'élite_{Nom_Extension_Complet}.png`
* Exemples :
  - **EV10 Rivalités Destinées :** `Coffret_Dresseur_d'élite_Écarlate_et_Violet_Rivalités_Destinées.png`
  - **EV02 Évolutions à Paldea :** `Coffret_Dresseur_d'élite_Écarlate_et_Violet_Évolutions_à_Paldea.png`
  - **ME02.5 Héros Transcendants :** `Coffret_Dresseur_d'élite_Méga-Évolution_Héros_Transcendants.png`
  - **Célébrations (25 ans) :** `Coffret_Dresseur_d'élite_Célébrations.png`

#### 2. Boîtes de Boosters (Displays 36 packs) :
* Modèle Bulbapedia Archives : `File:{Code_Set}_Booster_Display_Box.jpg` ou `.png`
* Exemples :
  - **Display EV02 (Paldea Evolved) :** `File:SV2_Booster_Display_Box.jpg`
  - **Display EV04 (Paradox Rift) :** `File:SV4_Booster_Display_Box.jpg`
  - **Display EV05 (Forces Temporelles) :** `File:SV5_Booster_Display_Box.png`
  - **Display EV06 (Mascarade Crépusculaire) :** `File:SV6_Booster_Display_Box.png`

#### 3. Coffrets Ultra-Premium (UPC) & Super-Premium :
* Modèle Poképédia : `Fichier:Collection_Super-Premium_{Nom_Extension}.png` ou `Fichier:Coffret_Ultra-Premium_{Nom}.png`
* Exemples :
  - **UPC EV8.5 (Évolutions Prismatiques) :** `Collection_Super-Premium_Écarlate_et_Violet_Évolutions_Prismatiques.png`
  - **UPC 151 (Mew) :** `Collection_Ultra-Premium_Écarlate_et_Violet_151.png`
  - **UPC Dracaufeu (Épée et Bouclier) :** `Collection_Ultra-Premium_Dracaufeu.png`

#### 4. Booster Bundle (Lot de 6 boosters) :
* Modèle : `File:{Code_Set}_Booster_Bundle.jpg` ou `Fichier:Lot_de_boosters_{Nom_Extension}.png`
* Exemples :
  - **Bundle EV8.5 :** `Lot_de_6_boosters_Écarlate_et_Violet_Évolutions_Prismatiques.png`
  - **Bundle EV04 :** `File:SV4_Booster_Bundle.jpg`

---

## 4. Automatisation : Scripts clé en main (Node.js & Python)

### Script universel MediaWiki API
L'API MediaWiki permet de donner le nom d'un produit et d'obtenir **automatiquement l'URL directe de l'image haute définition** en JSON.

#### Exemple d'appel API direct :
```text
https://www.pokepedia.fr/api.php?action=query&titles=Fichier:Coffret_Dresseur_d%27%C3%A9lite_%C3%89carlate_et_Violet_Rivalit%C3%A9s_Destin%C3%A9es.png&prop=imageinfo&iiprop=url&format=json
```

#### Réponse JSON reçue :
```json
{
  "query": {
    "pages": {
      "619085": {
        "imageinfo": [
          {
            "url": "https://www.pokepedia.fr/images/d/dd/Coffret_Dresseur_d%27%C3%A9lite_%C3%89carlate_et_Violet_Rivalit%C3%A9s_Destin%C3%A9es.png"
          }
        ]
      }
    }
  }
}
```

---

### Script Node.js complet : Téléchargement automatique

Créez un script `download_product.js` pour télécharger n'importe quel item automatiquement en local :

```javascript
const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Récupère l'image officielle d'un fichier MediaWiki (Poképédia ou Bulbagarden)
 * @param {string} wikiDomain - 'www.pokepedia.fr' ou 'archives.bulbagarden.net'
 * @param {string} fileName - Ex: 'Coffret_Dresseur_d\'élite_Écarlate_et_Violet_Rivalités_Destinées.png'
 * @param {string} outputFilePath - Chemin local de sauvegarde
 */
async function downloadOfficialProductImage(wikiDomain, fileName, outputFilePath) {
  const apiUrl = `https://${wikiDomain}/api.php?action=query&titles=File:${encodeURIComponent(fileName)}|Fichier:${encodeURIComponent(fileName)}&prop=imageinfo&iiprop=url&format=json`;

  return new Promise((resolve, reject) => {
    https.get(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let rawData = '';
      res.on('data', chunk => rawData += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(rawData);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          
          if (pageId === '-1' || !pages[pageId].imageinfo) {
            return reject(new Error(`Fichier introuvable sur ${wikiDomain} : ${fileName}`));
          }

          const directImageUrl = pages[pageId].imageinfo[0].url;
          console.log(`[OK] Image trouvée : ${directImageUrl}`);

          // Télécharger le fichier binaire
          const file = fs.createWriteStream(outputFilePath);
          https.get(directImageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (imgRes) => {
            imgRes.pipe(file);
            file.on('finish', () => {
              file.close();
              console.log(`[SUCCÈS] Enregistré dans : ${outputFilePath}`);
              resolve(outputFilePath);
            });
          }).on('error', reject);

        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

// ==========================================
// EXEMPLES D'UTILISATION :
// ==========================================
(async () => {
  try {
    // 1. Télécharger une ETB (ex: EV10)
    await downloadOfficialProductImage(
      'www.pokepedia.fr',
      "Coffret_Dresseur_d'élite_Écarlate_et_Violet_Rivalités_Destinées.png",
      'assets/etb_ev10.png'
    );

    // 2. Télécharger une Display (ex: EV02 Paldea Evolved)
    await downloadOfficialProductImage(
      'archives.bulbagarden.net',
      'SV2_Booster_Display_Box.jpg',
      'assets/display_ev02.jpg'
    );

    // 3. Télécharger une UPC (ex: EV8.5 Évolutions Prismatiques)
    await downloadOfficialProductImage(
      'www.pokepedia.fr',
      'Collection_Super-Premium_Écarlate_et_Violet_Évolutions_Prismatiques.png',
      'assets/upc_ev85.png'
    );
  } catch (err) {
    console.error('[ERREUR]', err.message);
  }
})();
```

---

## 5. Tableau récapitulatif par type de produit

| Produit recherché | Format de recherche recommandé | Source privilégiée |
|---|---|---|
| **Carte spécifique** | `api.tcgdex.net/v2/fr/cards/{set}-{number}` | **TCGdex API** |
| **ETB (Coffret Dresseur d'élite)** | `Coffret_Dresseur_d'élite_{Nom_Extension}.png` | **Poképédia** |
| **Display 36 Boosters** | `{CodeSet}_Booster_Display_Box.jpg` | **Bulbagarden Archives** |
| **UPC (Ultra-Premium Collection)** | `Collection_Ultra-Premium_{Nom}.png` ou `Collection_Super-Premium_{Nom}.png` | **Poképédia** |
| **Booster Bundle (6 Boosters)** | `{CodeSet}_Booster_Bundle.jpg` ou `Lot_de_6_boosters_{Nom}.png` | **Bulbagarden / Poképédia** |
| **Tripack / Blister** | `Tripack_{Nom_Extension}_{Pokemon}.png` | **Poképédia** |
| **Pokébox (Tin Box)** | `Pokébox_{Nom_Extension}_{Pokemon}.png` | **Poképédia** |

---

### Bonnes pratiques & Conseils importants :
1. **Toujours enregistrer les images localement dans un dossier `assets/`** : L'intégration d'images directes depuis des sites tiers dans un navigateur peut provoquer des erreurs CORS ou HTTP 403 (protection anti-hotlinking).
2. **Utiliser un `User-Agent` standard** lors de vos requêtes Node.js/Python (`User-Agent: Mozilla/5.0...`) pour éviter tout blocage réseau.
3. **Privilégier TCGdex pour les cartes** et **l'API MediaWiki pour tous les items scellés**.
