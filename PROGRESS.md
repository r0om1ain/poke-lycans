# TCGWorld — État d'avancement

Plan complet validé : `C:\Users\romai\.claude\plans\zesty-singing-shamir.md`
Specs source : `Spécifications fonctionnelles complètes — Marketplace Pokémon.md`, `GUIDE_RECUPERATION_TCG.md`

Architecture : monorepo `server` (API Express/MVC + PostgreSQL/Prisma) + `client` (React/Vite, la vue).
Déploiement prévu sur **Railway** en fin de projet (noté pour la config de déploiement à faire plus tard).
**L'API est codée en entier, démarre, tourne sur une vraie base Postgres seedée. Le frontend React est codé en entier, buildé sans erreur, et testé bout en bout contre l'API réelle** (voir section Frontend). Reste : polish visuel/responsive fin, tests automatisés, déploiement Railway.

---

## ✅ Fait

### Scaffold
- `package.json` racine (workspaces + script `dev` concurrently), `.gitignore`, `docker-compose.yml` (Postgres local, non lancé)
- `server/package.json` (Express, Prisma, bcryptjs, jsonwebtoken, multer, zod, cookie-parser, cors), `server/.env.example`
- `client/` : scaffold Vite + React (`react-router-dom` ajouté), branding par défaut retiré, favicon TCGWorld — voir section Frontend ci-dessous pour le contenu réel

### Base de données (`server/prisma/schema.prisma`)
Schéma Prisma **revu suite à une review approfondie** (8 lacunes corrigées) :
- `ShippingMethod` (par vendeur : nom, prix, pays, actif) + `Order.shippingMethodId/shippingMethodSnapshot` → le panier peut enfin représenter un vrai choix de mode de livraison par vendeur (§35-36)
- `Auction.winnerId` / `winningBidId` + `Order.auctionId` (unique) → une enchère remportée peut désormais devenir une vraie commande, suivie côté acheteur ("Mes achats") et vendeur ("Mes ventes")
- `Conversation.orderId` → une conversation peut être liée à une commande, pas seulement à une offre/enchère (§64)
- `Review` (orderId, authorId, targetUserId, rating, comment) → les compteurs d'évaluation du profil vendeur (§22) sont désormais calculés depuis de vrais avis tracés, plus stockés en dur sur `User`
- `Language` et `GradingCompany` deviennent des tables de référence (au lieu de `String` libres) → `languageId`/`gradingCompanyId` partout, évite les doublons ("PSA"/"Psa"/"psa") qui auraient cassé les filtres et l'estimation de valeur (§50)
- `PriceOffer` (listingId, buyerId, sellerId, amount, status, expiresAt, usedAt) → la négociation de prix (§29-30) est un vrai modèle avec garde anti double-utilisation, `Message` ne porte plus que l'affichage (`priceOfferId`)
- `Payment` (provider, transactionId, amount, status, paidAt) → distinct du statut `Order.status`, prêt pour un vrai prestataire plus tard
- `ProductType` (enum) → `ProductCategory` (table) → nouvelles catégories ajoutables sans migration (§3 : "autres produits Pokémon présents dans le catalogue")

`npm install` fait, **`npx prisma migrate dev` appliqué sur un vrai Postgres** (via Docker, `docker-compose.yml` à la racine — `docker compose up -d`), **DB seedée avec de vraies données** :
- Lookups : 6 langues, 5 sociétés de gradation, 6 catégories de produit
- **1452 cartes** importées depuis l'API TCGdex sur 7 sets réels (`server/prisma/seed/seedSets.json`, extensible en y ajoutant une ligne) : EV10 Rivalités Destinées, EV08.5 Évolutions Prismatiques, EV08 Étincelles Déferlantes, EV04 Faille Paradoxe, EV03.5 151, EB03 Ténèbres Embrasées, BS Set de Base — codes officiels français mappés manuellement (TCGdex n'expose que ses ids internes `sv10`, `swsh3`, etc., pas les codes EV/EB)
- **9 produits scellés** (ETB, Coffret, Display, Booster) avec visuels réellement téléchargés depuis Poképédia/Bulbagarden Archives selon la méthode du guide (`server/prisma/seed/downloadSealedImages.js` + `sealedProducts.json`), fichiers vérifiés un par un avant d'être retenus (plusieurs noms de fichiers devinés n'existaient pas, seuls les confirmés ont été gardés) — stockés dans `server/public/uploads/products/`
- Bug corrigé au passage : l'API MediaWiki de Bulbagarden Archives est servie sous `/w/api.php` (pas `/api.php` comme Poképédia) — géré via `API_PATH_BY_DOMAIN` dans `downloadSealedImages.js`
- Vérifié en conditions réelles : `GET /api/catalog/home` interrogé sur le serveur tournant contre cette DB renvoie de vraies données (ex. `"EV04 : Faille Paradoxe"` correctement formaté)

### Code serveur (`server/src`)
- `config/` : `env.js`, `prisma.js` (client Prisma partagé)
- `lib/` : `formatSeries.js` (§4), `characteristics.js` (§6-9, parsing + filtres — clés `languageId`/`gradingCompanyId`), `serializers.js` (formatage JSON de toutes les entités, y compris lookups/reviews/offres/paiement), `asyncHandler.js`, `httpError.js`, `token.js` (JWT + cookie)
- `middleware/` : `auth.js` (`requireAuth`, `attachUserIfPresent`, `requireAdmin`), `errorHandler.js`, `upload.js` (multer, photos enchères/messages)
- `models/` : **tous écrits, alignés sur le schéma revu** — `userModel`, `addressModel`, `paymentMethodModel`, `seriesModel`, `productModel` (recherche + home sections, par catégorie), `listingModel` (catégorie, négociation), `auctionModel` (bids, clôture, gagnant), `collectionModel` (progression série), `cartModel`, `orderModel` (checkout par vendeur **et** par enchère gagnée, snapshot corrigé, livraison), `conversationModel` + `messageModel`, `priceOfferModel` (négociation sécurisée), `reviewModel` (stats calculées), `shippingMethodModel`, `paymentModel`, `lookupModel` (langues, sociétés de gradation, catégories)
- `services/` : `pricingService.js` (estimation valeur §50, relâchement progressif des critères, clés FK), `seriesProgressService.js` (§49, filtre par catégorie "card"), `auctionSchedulerService.js` (clôture auto §45), `paymentService.js` (mock, point d'intégration futur)
- `controllers/` : **tous écrits** — `authController`, `accountController` (profil, adresses, moyens de paiement, **modes de livraison**), `catalogController` (accueil + recherche + fiche produit + lookups), `listingController` (mise en vente classique), `sellerController` (profil public §21-24), `auctionController` (liste/détail/création/enchérir/**finalisation d'achat après victoire**), `collectionController` (CRUD + progression + valeur estimée + mise en vente), `cartController` (groupé par vendeur avec modes de livraison), `orderController` (checkout par vendeur, mes achats/ventes, paiement mock, statuts, avis), `messageController` (conversations, contact, texte/image, **négociation de prix sécurisée**)
- `routes/` : un fichier par domaine, tous montés dans `app.js`
- `app.js` (Express, cors, cookie-parser, static `/uploads`, tous les routers, errorHandler) + `server.js` (bootstrap + démarrage `auctionScheduler`)
- **Le serveur démarre réellement** : testé (`node src/server.js`), `/api/health` répond, les routes atteignent bien Prisma (erreur DB propre et attendue puisque Postgres n'est pas encore lancé)
- Point important : la négociation de prix (§29-30) est maintenant réellement "consommée" à l'achat — `orderModel.createOrderForSeller` vérifie dans la même transaction s'il existe une `PriceOffer` acceptée pour (offre, acheteur), l'utilise comme prix et la marque `USED` de façon atomique
- Idem pour les enchères : la clôture (`auctionSchedulerService`) fixe désormais `winnerId`/`winningBidId`, et `POST /api/auctions/:id/finalize` permet au gagnant de choisir adresse + livraison pour transformer l'enchère en vraie commande suivie dans achats/ventes

### Frontend (`client/src`)
- `styles/` : `theme.css` (tokens repris du prototype : fond `#0b0b0f`, accent bleu), `global.css` (reset, boutons, formulaires, badges, grilles), `layout.css` (header/bottom-nav responsive), `product.css`, `forms-extra.css` (filtres, enchères, panier, messagerie, collection, compte)
- `api/` : un wrapper par domaine (`auth`, `account`, `catalog`, `listings`, `sellers`, `auctions`, `collection`, `cart`, `orders`, `messages`) + `client.js` (fetch avec cookies, gestion d'erreurs typée `ApiError`)
- `context/` : `AuthContext` (session via cookie httpOnly), `CartContext` (panier synchronisé serveur)
- `components/` : layout (`Header` desktop + recherche, `BottomNav` mobile — specs §10), `product` (`ProductCard`, `ListingRow`, `ExemplarBadges`, `ExemplarFormFields`, `ProductPicker`, `SeriesLabel` — format "CODE : Nom" partout), `filters/FilterPanel` (partagé Recherche/Enchères), `auction/AuctionCard` (compte à rebours live), `common` (Spinner, EmptyState, ProtectedRoute, icônes SVG maison)
- `pages/` : Home (5 sections §11), Search (§12-13), ProductDetail (offres + badge enchères §14-18), SellClassic (§19), Auctions/AuctionDetail (§37-45, avec finalisation d'achat après victoire), CreateAuction (upload photos, durée max 7j), SellerProfile (§21-24), Cart (groupé par vendeur, livraison, récap §31-36), Collection (progression séries, valeur estimée, mise en vente §46-52), Login/Register, `account/*` (profil, adresses, paiement, **livraison vendeur**, achats/ventes avec onglets et compteurs §57-61, enchères §62, messagerie avec négociation de prix §26-30 en polling 5s)
- Routing avec `react-router-dom`, routes protégées (`ProtectedRoute`) pour tout ce qui nécessite une session
- **Bug serveur trouvé et corrigé pendant l'intégration** : `listingModel.countsByCategoryForSeller` ne renvoyait pas l'`id` de catégorie (seulement slug/nom), ce qui cassait le filtre par catégorie sur le profil vendeur — corrigé
- **Endpoint manquant ajouté** : `GET /api/sellers/:id/shipping-methods` (public) — nécessaire pour que l'acheteur choisisse une livraison lors de la finalisation d'achat après une enchère gagnée (le seul endpoint existant était privé, réservé au vendeur lui-même)

### Vérifications effectuées
- `npm run build` (client) : ✅ sans erreur
- API + client lancés ensemble, testés via requêtes HTTP réelles à travers le proxy Vite : accueil, recherche, fiche produit (image servie correctement), inscription + cookie de session, création d'offre, ajout panier, ajout adresse, **checkout réel**, **paiement mock réel** (statut `PAID` + `Payment` créé), ajout collection, **progression de série** (vérifié : les produits scellés ne comptent pas dans la progression, seules les cartes — comportement conforme §49)
- Données de test nettoyées de la DB après vérification
- Vérification visuelle dans un vrai navigateur **non faite** : l'extension Claude in Chrome s'est déconnectée en cours de session et n'a pas pu être rétablie après plusieurs tentatives — tout a été validé via l'API/HTTP à la place

---

## ⏳ Reste à faire

### 1. Polish visuel & UX
- Vérification visuelle réelle dans un navigateur (mobile + desktop) — à faire dès que possible, non couverte par les tests HTTP
- États de chargement/erreur plus fins, animations, détails visuels

### 2. Finition technique
- Tests automatisés des services critiques (pricing, progression série, clôture enchères)
- Config de déploiement Railway (variables d'env, build, Postgres managé) à faire en toute fin de projet

**Ordre conseillé pour reprendre** : (1) vérification visuelle navigateur + ajustements → (2) tests auto → (3) déploiement Railway.

## Notes pratiques pour reprendre en local
- `docker compose up -d` (depuis la racine) pour la DB Postgres — le conteneur `tcgfinal-postgres-1` tourne déjà si Docker Desktop est lancé
- `server/.env` existe déjà en local (copié depuis `.env.example`, gitignored)
- Pour reseeder : `cd server && node prisma/seed/index.js` (idempotent, upserts)
- **`npm install` doit être fait à la racine du monorepo** (pas seulement dans `server/` et `client/`) pour installer `concurrently`, sinon `npm run dev` échoue silencieusement en ne lançant que le client → 502 côté API. Corrigé et vérifié le 2026-08-18.
- Vulnérabilité `npm audit` connue : `deepmerge-ts` (dépendance transitive de l'outil CLI `prisma`, dev-only, jamais exécutée en runtime) — pas de correctif non-breaking disponible sans upgrade majeur de Prisma, risque nul pour l'app déployée.
