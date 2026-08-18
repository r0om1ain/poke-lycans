# Spécifications fonctionnelles — Marketplace Pokémon

## 1. Objectif de l'application

L'application est une **marketplace dédiée aux cartes et produits Pokémon**, avec un fonctionnement proche de Cardmarket.

Elle permet aux utilisateurs de :

- rechercher des cartes et produits Pokémon ;
- consulter les offres disponibles ;
- acheter auprès d'autres utilisateurs ;
- vendre leurs propres cartes et produits ;
- participer à des enchères ;
- créer leurs propres enchères ;
- gérer leur collection personnelle ;
- suivre leur progression dans les différentes séries ;
- connaître une estimation de la valeur de leur collection ;
- consulter le profil public des vendeurs ;
- voir les autres articles proposés par un vendeur ;
- communiquer avec les autres utilisateurs ;
- demander des informations ou des photos supplémentaires ;
- négocier le prix d'une offre ;
- suivre leurs achats ;
- suivre leurs ventes ;
- gérer leur compte, leurs adresses et leurs moyens de paiement.

Un même utilisateur peut être à la fois **acheteur et vendeur**.

---

# 2. Rôles

Pour le moment, l'application possède deux rôles.

## Client

Le client peut :

- consulter l'accueil ;
- rechercher des produits ;
- consulter les fiches produits ;
- consulter les offres ;
- filtrer les offres ;
- acheter ;
- vendre ;
- gérer son panier ;
- participer à des enchères ;
- créer des enchères ;
- gérer sa collection ;
- suivre l'avancement de ses séries ;
- consulter la valeur estimée de sa collection ;
- mettre directement un élément de sa collection en vente ;
- consulter le profil public d'un vendeur ;
- parcourir les produits vendus par un vendeur ;
- envoyer des messages ;
- demander des photos supplémentaires ;
- négocier le prix d'une vente ;
- suivre ses achats ;
- suivre ses ventes ;
- gérer son compte.

## Administrateur

L'administrateur permet de gérer les principaux éléments nécessaires au fonctionnement de la plateforme, notamment :

- utilisateurs ;
- catalogue ;
- produits ;
- offres de vente ;
- enchères.

Le détail complet du back-office administrateur sera défini séparément.

---

# 3. Catalogue Pokémon

L'application repose sur un **catalogue centralisé** de cartes et produits Pokémon.

Les types de produits peuvent notamment être :

- Cartes ;
- ETB ;
- Displays ;
- Boosters ;
- Coffrets ;
- autres produits Pokémon présents dans le catalogue.

Un produit possède une seule référence dans le catalogue.

Cette référence peut ensuite être liée à :

- plusieurs vendeurs ;
- plusieurs offres ;
- plusieurs prix ;
- différents états ;
- différentes langues ;
- différentes caractéristiques ;
- plusieurs enchères ;
- plusieurs collections personnelles.

Il ne faut donc pas créer une nouvelle fiche catalogue pour chaque vendeur.

---

# 4. Séries Pokémon

Lorsqu'un produit appartient à une série, celle-ci doit être affichée sous la forme :

**CODE : Nom de la série**

Exemple :

**EV10 : Rivalités Destinées**

Le code seul ne doit pas être utilisé.

Ce format est utilisé partout :

- accueil ;
- recherche ;
- filtres ;
- fiches produits ;
- ventes ;
- enchères ;
- collection ;
- profil vendeur.

---

# 5. États

Pour les cartes et les produits concernés, les états disponibles sont :

- **NM**
- **Excellent**
- **Good**
- **LP**
- **Played**

L'état est utilisé pour :

- les ventes ;
- les enchères ;
- la collection ;
- les filtres ;
- l'estimation de la valeur d'une collection.

---

# 6. Caractéristiques facultatives des cartes

Une carte peut posséder plusieurs caractéristiques particulières.

Toutes les informations de cette section sont **facultatives**.

Elles peuvent être utilisées dans :

- les ventes ;
- les enchères ;
- la collection personnelle ;
- les filtres ;
- l'estimation de valeur lorsque cela est pertinent.

---

# 7. Caractéristiques ON / OFF

Les caractéristiques suivantes fonctionnent avec un système **ON / OFF** :

- **Holo**
- **1re édition**
- **Poké Ball**
- **Miscut / Misprint**
- **Stamp**
- **Reverse**

Exemple :

- Holo : ON
- 1re édition : OFF
- Poké Ball : OFF
- Miscut / Misprint : ON
- Stamp : OFF
- Reverse : OFF

Ces informations ne sont jamais obligatoires.

---

# 8. Carte gradée

Une carte peut également être indiquée comme étant gradée.

### Gradée

**ON / OFF**

Cette information est également facultative.

## Si Gradée = OFF

Aucune information supplémentaire de gradation n'est nécessaire.

## Si Gradée = ON

Deux champs supplémentaires deviennent disponibles.

### Société de gradation

L'utilisateur sélectionne la société ayant effectué la gradation.

Exemples :

- PCA
- PSA
- autres sociétés de gradation présentes dans la liste de l'application.

### Note

L'utilisateur renseigne la note obtenue.

Exemple :

**Gradée : ON**

**Société : PSA**

**Note : 10**

---

# 9. Informations possibles d'un exemplaire

Un exemplaire précis d'une carte peut donc contenir :

- carte ;
- série ;
- état ;
- langue ;
- quantité ;
- Holo ;
- 1re édition ;
- Poké Ball ;
- Miscut / Misprint ;
- Stamp ;
- Reverse ;
- Gradée ;
- société de gradation si Gradée = ON ;
- note si Gradée = ON.

Ces caractéristiques sont **facultatives**.

---

# 10. Navigation principale

La navigation principale contient au minimum :

1. **Accueil**
2. **Recherche / Marketplace**
3. **Enchères**
4. **Collection**
5. **Panier**
6. **Compte**

Le profil vendeur est accessible en cliquant sur le pseudo d'un vendeur.

---

# 11. Page Accueil

La page d'accueil permet de découvrir rapidement les produits et l'activité de la marketplace.

Elle contient plusieurs sections.

## Best-sellers

Présentation des cartes et produits les plus vendus.

## Les plus vus

Présentation des cartes et produits les plus consultés.

## Nouveautés

Présentation des nouvelles cartes et nouveaux produits ajoutés au catalogue.

## Dernières mises en vente

Présentation des produits récemment proposés à la vente.

## Enchères

Présentation de certaines enchères actuellement en cours, notamment celles se terminant prochainement.

Chaque produit présenté est cliquable et permet d'accéder à sa fiche.

---

# 12. Page Recherche / Marketplace

Cette page permet de rechercher un produit dans le catalogue.

L'utilisateur dispose de plusieurs filtres.

## Type d'item

Exemples :

- Carte ;
- ETB ;
- Display ;
- Booster ;
- Coffret ;
- autres catégories.

## Série

Les séries sont affichées sous la forme :

**EV10 : Rivalités Destinées**

## Nom

L'utilisateur peut rechercher directement une carte ou un produit grâce à son nom.

## Caractéristiques facultatives

Lorsque cela est applicable, les filtres peuvent également comprendre :

- Holo : ON / OFF ;
- 1re édition : ON / OFF ;
- Poké Ball : ON / OFF ;
- Miscut / Misprint : ON / OFF ;
- Stamp : ON / OFF ;
- Reverse : ON / OFF ;
- Gradée : ON / OFF ;
- société de gradation ;
- note.

Les filtres peuvent être combinés.

---

# 13. Résultats de recherche

Les résultats correspondant aux critères sont affichés à l'utilisateur.

Chaque résultat permet au minimum d'identifier :

- image ;
- nom ;
- série ;
- type de produit.

Un clic sur un résultat ouvre la fiche du produit.

---

# 14. Fiche produit

Chaque carte ou produit possède une fiche principale.

Elle contient notamment :

- image ;
- nom ;
- série ;
- type de produit ;
- informations permettant d'identifier précisément le produit.

Sous cette fiche apparaissent les différentes offres actuellement disponibles.

---

# 15. Enchères en cours sur une fiche produit

Si des enchères existent actuellement pour le produit, une indication apparaît au-dessus des offres.

Exemple :

**3 enchères en cours**

Cette indication ne présente pas directement le détail des enchères.

Elle permet simplement de savoir que des enchères existent pour ce produit et d'accéder à celles-ci.

---

# 16. Offres de vente

Un même produit peut avoir plusieurs offres proposées par plusieurs vendeurs.

Chaque offre correspond à **un exemplaire précis vendu par un vendeur précis**.

Une offre peut contenir :

- vendeur ;
- prix ;
- quantité ;
- état ;
- langue ;
- Holo ;
- 1re édition ;
- Poké Ball ;
- Miscut / Misprint ;
- Stamp ;
- Reverse ;
- Gradée ;
- société de gradation ;
- note ;
- description facultative.

Toutes les caractéristiques supplémentaires sont facultatives.

---

# 17. Description d'une vente

Lors de la création d'une offre, le vendeur peut ajouter une :

**description facultative**

Elle permet de préciser des informations concernant son exemplaire.

---

# 18. Filtres des offres

Depuis une fiche produit, l'utilisateur peut filtrer les offres proposées.

## État

- NM
- Excellent
- Good
- LP
- Played

## Langue

Par exemple :

- Français ;
- Anglais ;
- Japonais ;
- autres langues disponibles.

## Caractéristiques

Les filtres peuvent également comprendre :

- Holo ;
- 1re édition ;
- Poké Ball ;
- Miscut / Misprint ;
- Stamp ;
- Reverse ;
- Gradée ;
- société de gradation ;
- note.

L'utilisateur peut donc rechercher précisément la version qui l'intéresse.

---

# 19. Mise en vente classique

Un utilisateur peut mettre une carte ou un produit en vente.

Il sélectionne d'abord le produit correspondant dans le catalogue.

Il peut ensuite renseigner :

- état ;
- langue ;
- quantité ;
- prix ;
- Holo ;
- 1re édition ;
- Poké Ball ;
- Miscut / Misprint ;
- Stamp ;
- Reverse ;
- Gradée ;
- société de gradation ;
- note ;
- description facultative.

Toutes les caractéristiques particulières sont facultatives.

Une fois publiée, l'offre apparaît sur la fiche du produit.

---

# 20. Pseudo du vendeur

Le pseudo du vendeur est **cliquable**.

Il peut notamment apparaître :

- dans une offre ;
- dans une enchère ;
- dans le panier ;
- dans une commande.

Un clic ouvre le profil public du vendeur.

---

# 21. Profil public vendeur

Chaque vendeur possède un profil public.

Cette page permet :

- d'obtenir des informations sur le vendeur ;
- de voir son activité ;
- de consulter tous les produits qu'il vend.

---

# 22. Informations publiques du vendeur

La partie supérieure du profil peut afficher :

- pseudo ;
- pays ;
- membre depuis ;
- nombre de ventes réalisées ;
- évaluation générale ;
- évaluations positives ;
- évaluations neutres ;
- évaluations négatives.

Les informations personnelles privées ne sont pas affichées.

---

# 23. Articles en vente du vendeur

Sous les informations du vendeur se trouvent tous ses produits actuellement disponibles.

Ils sont regroupés par catégorie.

Exemple :

- Cartes ;
- ETB ;
- Displays ;
- Boosters ;
- Coffrets ;
- autres catégories.

Chaque catégorie affiche le nombre d'articles.

Exemple :

**Cartes (126)**

**ETB (4)**

**Displays (8)**

**Boosters (23)**

---

# 24. Navigation dans les produits du vendeur

L'utilisateur peut cliquer sur une catégorie.

Exemple :

**Cartes (126)**

Il voit uniquement les cartes actuellement vendues par cet utilisateur.

Chaque offre peut afficher :

- image ;
- nom ;
- série ;
- état ;
- langue ;
- caractéristiques ;
- gradation si applicable ;
- prix.

---

# 25. Contacter un vendeur

Depuis le profil d'un vendeur ou depuis une offre, l'utilisateur peut contacter le vendeur.

Exemple :

**Contacter le vendeur**

Une conversation est créée dans la messagerie.

---

# 26. Messagerie

L'application possède une messagerie permettant aux utilisateurs de communiquer.

Elle peut servir à :

- demander des informations ;
- demander des précisions sur l'état ;
- demander des photos supplémentaires ;
- parler d'un produit ;
- négocier le prix ;
- discuter d'une commande.

---

# 27. Discussion liée à une offre

Lorsqu'un utilisateur contacte un vendeur depuis une offre, la conversation peut être directement liée à cette offre.

Le vendeur sait ainsi immédiatement de quel produit il est question.

---

# 28. Photos supplémentaires

Un acheteur peut demander des photos supplémentaires.

Le vendeur peut lui envoyer ces photos directement dans la conversation.

---

# 29. Négociation du prix

Pour une vente classique, l'acheteur peut proposer un autre prix.

Exemple :

Prix affiché :

**100 €**

Proposition :

**90 €**

Le vendeur peut :

- accepter ;
- refuser ;
- continuer la discussion.

---

# 30. Prix négocié accepté

Si le vendeur accepte le prix proposé, l'acheteur concerné peut acheter le produit au prix accepté.

Exemple :

Prix initial :

**100 €**

Prix accepté :

**90 €**

---

# 31. Ajout au panier

Depuis une offre, l'utilisateur peut ajouter le produit à son panier.

C'est **l'offre précise du vendeur** qui est ajoutée.

Le panier conserve notamment :

- produit ;
- vendeur ;
- prix ;
- état ;
- langue ;
- caractéristiques ;
- gradation si applicable ;
- quantité.

---

# 32. Page Panier

Les articles sont organisés **par vendeur**.

Les produits provenant de plusieurs vendeurs ne sont pas mélangés.

---

# 33. Regroupement par vendeur

Exemple :

L'utilisateur achète :

- 1 ETB EV10 chez Vendeur A ;
- 1 ETB EV11 chez Vendeur B.

Le panier contient :

## Vendeur A

- ETB EV10

## Vendeur B

- ETB EV11

---

# 34. Plusieurs articles chez le même vendeur

Si plusieurs produits proviennent du même vendeur, ils sont regroupés.

Exemple :

## Vendeur A

- Carte Pikachu
- ETB EV10
- Display EV08

Ils utilisent le même bloc vendeur.

---

# 35. Bloc vendeur dans le panier

Chaque bloc contient notamment :

- pseudo du vendeur ;
- articles ;
- quantité ;
- état ;
- langue ;
- caractéristiques si applicables ;
- prix ;
- sous-total ;
- mode de livraison ;
- frais de livraison ;
- total du vendeur.

---

# 36. Récapitulatif du panier

Le panier possède également un récapitulatif global :

- nombre de vendeurs ;
- nombre d'articles ;
- valeur totale des articles ;
- frais de livraison ;
- montant total.

Fonctionnement :

**Vendeur A**

→ produits  
→ livraison  
→ total

**Vendeur B**

→ produits  
→ livraison  
→ total

Puis :

**Total général du panier**

---

# 37. Page Enchères

Une page spécifique permet de consulter toutes les enchères actives.

---

# 38. Classement des enchères

Sans filtre, les enchères se terminant le plus rapidement sont affichées en premier.

---

# 39. Filtres des enchères

La page Enchères possède les filtres suivants.

## Type d'item

- Carte ;
- ETB ;
- Display ;
- Booster ;
- Coffret ;
- autres catégories.

## Série

Exemple :

**EV10 : Rivalités Destinées**

## Nom

Recherche par nom.

## Caractéristiques facultatives

Lorsque cela est applicable :

- état ;
- langue ;
- Holo ;
- 1re édition ;
- Poké Ball ;
- Miscut / Misprint ;
- Stamp ;
- Reverse ;
- Gradée ;
- société de gradation ;
- note.

Les filtres peuvent être combinés.

---

# 40. Affichage d'une enchère

Une enchère affiche notamment :

- produit ;
- image ;
- prix actuel ;
- date et heure de fin.

Un clic ouvre son détail.

---

# 41. Détail d'une enchère

La page d'une enchère contient notamment :

- produit ;
- photos du produit réel ;
- vendeur ;
- état ;
- langue ;
- Holo ;
- 1re édition ;
- Poké Ball ;
- Miscut / Misprint ;
- Stamp ;
- Reverse ;
- Gradée ;
- société de gradation ;
- note ;
- description facultative ;
- prix actuel ;
- date et heure de fin.

Toutes les caractéristiques sont facultatives.

---

# 42. Création d'une enchère

L'utilisateur sélectionne le produit dans le catalogue.

Il peut ensuite renseigner :

- photos ;
- état ;
- langue ;
- Holo ;
- 1re édition ;
- Poké Ball ;
- Miscut / Misprint ;
- Stamp ;
- Reverse ;
- Gradée ;
- société de gradation si nécessaire ;
- note si nécessaire ;
- description facultative ;
- prix de départ ;
- prix de réserve si activé ;
- date et heure de fin.

---

# 43. Prix de réserve

Le vendeur peut utiliser :

**Prix de réserve : ON / OFF**

Si ON, il renseigne un montant.

Pour les autres utilisateurs, l'application peut afficher :

- prix de réserve atteint ;
- prix de réserve non atteint.

Le montant du prix de réserve n'est pas obligatoirement visible.

---

# 44. Durée maximale d'une enchère

Une enchère ne peut pas durer plus de :

**7 jours**

---

# 45. Participer à une enchère

Tant que l'enchère est active, un utilisateur peut placer une enchère.

Le prix actuel évolue selon les enchères placées.

À la date et l'heure de fin, l'enchère se termine.

---

# 46. Collection personnelle

Chaque utilisateur possède une page dédiée à sa collection Pokémon.

Elle permet d'enregistrer les cartes et produits qu'il possède.

---

# 47. Ajouter une carte à sa collection

Lorsqu'une carte est ajoutée, l'utilisateur peut renseigner :

- carte ;
- série ;
- quantité ;
- état ;
- langue ;
- Holo ;
- 1re édition ;
- Poké Ball ;
- Miscut / Misprint ;
- Stamp ;
- Reverse ;
- Gradée ;
- société de gradation ;
- note.

Toutes ces caractéristiques sont facultatives.

---

# 48. Affichage de la collection

Pour chaque élément, l'utilisateur peut retrouver :

- image ;
- nom ;
- série ;
- état ;
- langue ;
- quantité ;
- caractéristiques ;
- informations de gradation si présentes.

---

# 49. Progression d'une série

L'application permet de suivre le pourcentage de complétion d'une série.

Exemple :

**EV10 : Rivalités Destinées — 72 %**

Le pourcentage correspond au nombre de cartes possédées par rapport au nombre de cartes nécessaires pour compléter la série.

---

# 50. Valeur estimée d'une carte

L'application estime la valeur à partir des offres disponibles sur la marketplace.

Elle doit rechercher autant que possible des offres correspondant au même exemplaire.

Elle prend donc en compte lorsque les informations existent :

- même carte ;
- même état ;
- même langue ;
- Holo ;
- 1re édition ;
- Poké Ball ;
- Miscut / Misprint ;
- Stamp ;
- Reverse ;
- Gradée ;
- société de gradation ;
- note.

Exemple :

**Carte X**

**Français**

**NM**

**Holo : ON**

**Gradée : ON**

**PSA 10**

L'estimation doit autant que possible utiliser des offres correspondant à cette même configuration.

---

# 51. Valeur de la collection

L'utilisateur peut consulter :

- valeur estimée d'une carte ;
- valeur estimée d'une série ;
- valeur estimée totale de sa collection.

Cette valeur reste une **estimation basée sur les offres présentes sur la marketplace**.

---

# 52. Mise en vente depuis la collection

Depuis sa collection, l'utilisateur possède un bouton :

**Mettre en vente**

Les informations existantes sont reprises automatiquement :

- produit ;
- série ;
- état ;
- langue ;
- Holo ;
- 1re édition ;
- Poké Ball ;
- Miscut / Misprint ;
- Stamp ;
- Reverse ;
- Gradée ;
- société de gradation ;
- note.

L'utilisateur complète ensuite notamment :

- prix ;
- quantité si nécessaire ;
- description facultative.

---

# 53. Page Compte

La page Compte est l'espace personnel privé de l'utilisateur.

Elle contient notamment :

- informations personnelles ;
- adresses ;
- paiement ;
- mes achats ;
- mes ventes ;
- mes enchères ;
- messages.

---

# 54. Informations personnelles

L'utilisateur peut gérer notamment :

- nom ;
- prénom ;
- adresse e-mail ;
- informations nécessaires à son compte.

---

# 55. Adresses

L'utilisateur peut :

- ajouter une adresse ;
- modifier une adresse ;
- sélectionner une adresse pour une commande.

---

# 56. Paiement

L'utilisateur peut gérer les moyens de paiement proposés par la plateforme.

---

# 57. Suivi des achats

La partie **Mes achats** permet de suivre ses commandes.

Les onglets comprennent notamment :

### Dans le panier

Articles ajoutés au panier.

### À payer

Commandes créées mais pas encore payées.

### Payée

Commandes payées.

### Envoyée

Commandes expédiées.

### Arrivée

Commandes reçues.

Chaque onglet affiche le nombre de commandes concernées.

---

# 58. Détail d'un achat

Le détail peut contenir :

- vendeur ;
- produits ;
- quantité ;
- prix ;
- frais de livraison ;
- total ;
- adresse de livraison ;
- statut.

L'utilisateur peut également contacter le vendeur.

---

# 59. Suivi des ventes

La partie **Mes ventes** permet au vendeur de suivre ses commandes.

Les onglets comprennent notamment :

### En attente de paiement

L'acheteur n'a pas encore payé.

### Payée

Le paiement a été effectué.

### Envoyée

La commande a été expédiée.

### Arrivée

La commande a été reçue.

---

# 60. Détail d'une vente

Le vendeur peut consulter notamment :

- acheteur ;
- articles ;
- quantité ;
- prix ;
- frais de livraison ;
- total ;
- statut ;
- informations nécessaires à l'envoi.

Il peut également contacter l'acheteur.

---

# 61. Synchronisation des statuts

Le statut est commun entre l'acheteur et le vendeur.

Exemple :

Le vendeur indique :

**Envoyée**

La commande apparaît également comme :

**Envoyée**

chez l'acheteur.

---

# 62. Mes enchères

L'utilisateur peut retrouver :

- les enchères qu'il a créées ;
- les enchères auxquelles il participe.

---

# 63. Messages

La section **Messages** permet de retrouver les conversations.

Elles peuvent concerner :

- une offre ;
- une demande d'information ;
- une demande de photos ;
- une négociation ;
- une commande.

---

# 64. Messagerie après un achat

Une fois la commande passée, l'acheteur et le vendeur peuvent continuer à discuter.

La conversation peut servir à :

- parler de l'envoi ;
- donner une information ;
- demander une précision ;
- discuter du produit ;
- discuter de la commande.

---

# 65. Compte et profil vendeur

Il existe deux espaces distincts.

## Compte

Privé.

Il contient :

- informations personnelles ;
- adresses ;
- paiement ;
- achats ;
- ventes ;
- enchères ;
- messages.

## Profil vendeur

Public.

Il contient :

- pseudo ;
- pays ;
- ancienneté ;
- nombre de ventes ;
- évaluations ;
- catégories d'articles ;
- produits actuellement en vente.

---

# 66. Parcours d'achat classique

L'utilisateur recherche une carte.

↓

Il sélectionne une série.

↓

Il ouvre la fiche.

↓

Il voit par exemple :

**2 enchères en cours**

↓

Il consulte les offres.

Exemple :

**Vendeur A**

Français  
NM  
Holo : ON  
Reverse : OFF  
Gradée : ON  
PSA 10  
100 €

↓

Il contacte le vendeur.

↓

Il demande des photos supplémentaires.

↓

Le vendeur envoie les photos.

↓

L'acheteur propose :

**90 €**

↓

Le vendeur accepte.

↓

L'utilisateur achète à **90 €**.

↓

La commande apparaît dans :

**Mes achats**

↓

Paiement :

**Payée**

↓

Le vendeur retrouve la commande dans :

**Mes ventes > Payée**

↓

Il expédie.

↓

Statut :

**Envoyée**

↓

La commande est reçue.

↓

Statut :

**Arrivée**

---

# 67. Parcours avec plusieurs vendeurs

L'utilisateur ajoute :

- une carte chez Vendeur A ;
- une ETB chez Vendeur A ;
- un Display chez Vendeur B.

Le panier devient :

## Vendeur A

- Carte
- ETB
- livraison
- total

## Vendeur B

- Display
- livraison
- total

Puis :

**Total général**

---

# 68. Parcours via le profil vendeur

L'utilisateur trouve une carte.

↓

Il clique sur le vendeur.

↓

Il arrive sur son profil.

↓

Il voit par exemple :

**Cartes (126)**  
**ETB (4)**  
**Displays (8)**  
**Boosters (23)**

↓

Il clique sur une catégorie.

↓

Il parcourt les autres produits du vendeur.

↓

Il peut ajouter plusieurs produits de ce vendeur au panier.

Ils seront regroupés dans le même bloc vendeur.

---

# 69. Principe général des données

Le fonctionnement repose sur plusieurs niveaux.

## Catalogue

Référence officielle d'une carte ou d'un produit.

## Exemplaire

Version réellement possédée ou vendue par un utilisateur.

Elle peut posséder :

- état ;
- langue ;
- caractéristiques ;
- gradation.

## Offre

Exemplaire mis en vente avec notamment :

- prix ;
- quantité ;
- description facultative.

## Enchère

Exemplaire proposé aux enchères avec notamment :

- photos ;
- prix de départ ;
- prix de réserve éventuel ;
- date de fin ;
- description facultative.

## Collection

Exemplaires réellement possédés par l'utilisateur.

Une même référence du catalogue peut donc avoir de nombreux exemplaires différents selon :

- vendeur ;
- état ;
- langue ;
- Holo ;
- 1re édition ;
- Poké Ball ;
- Miscut / Misprint ;
- Stamp ;
- Reverse ;
- gradation ;
- société de gradation ;
- note ;
- prix.

Cette structure constitue la base fonctionnelle complète de la marketplace Pokémon définie jusqu'à présent.