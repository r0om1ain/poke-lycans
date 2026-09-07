// Miroir exact des DTO C# (server/TcgWorld.Api/Dtos/*.cs), sérialisés en
// camelCase (Program.cs: PropertyNamingPolicy = CamelCase). IDs `number`
// (auto-incrémentés), séparation Carte/Item (remplace l'ancien `Product`
// unifié), noms de champs alignés sur le DBML français mais sans les
// préfixes de colonnes (ex. `AnnPrix` -> `prix`).

export type ItemKind = 'carte' | 'item';

export interface Serie {
  id: number;
  nom: string;
  code: string | null;
  label: string;
}

export interface Bloc {
  id: number;
  nom: string;
  series: Serie[];
}

export interface TypeItem {
  id: number;
  nom: string;
  code: string | null;
}

export interface Langue {
  id: number;
  nom: string;
  code: string;
}

export interface SocieteGradation {
  id: number;
  nom: string;
  code: string | null;
}

// Résumé unifié Carte|Item — remplace l'ancien `Product`.
export interface ProduitResume {
  type: ItemKind;
  id: number;
  nom: string;
  image: string | null;
  numero: string | null;
  rarete: string | null;
  serie: Serie;
  slug: string;
  prixMin: number | null;
}

export interface CarteDetail {
  id: number;
  nom: string;
  numero: string | null;
  code: string | null;
  numeroSerie: string | null;
  rarete: string | null;
  image: string | null;
  serie: Serie;
  slug: string;
}

export interface ItemDetail {
  id: number;
  nom: string;
  numero: string | null;
  image: string | null;
  serie: Serie;
  type: TypeItem;
  slug: string;
}

export interface HomeData {
  tendances: ProduitResume[];
  series: Serie[];
  bonnesAffaires: ProduitResume[];
  encheresBientotTerminees: EnchereResume[];
}

export interface SearchResult {
  resultats: ProduitResume[];
  total: number;
  page: number;
  pageSize: number;
}

export interface Personne {
  id: number;
  pseudo: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  adresse: string | null;
  codePostal: string | null;
  ville: string | null;
  pays: string | null;
  role: string;
  dateCreation: string;
}

export interface PersonneResume {
  id: number;
  pseudo: string;
}

export interface Caracteristiques {
  etat: string | null;
  idLangue: number | null;
  holo: boolean;
  edition1: boolean;
  pokeball: boolean;
  misscut: boolean;
  missprint: boolean;
  stamp: boolean;
  reverse: boolean;
  grade: boolean;
  idSocieteGradation: number | null;
  noteGradation: number | null;
}

export interface Annonce {
  id: number;
  vendeur: PersonneResume;
  produit: ProduitResume;
  prix: number;
  quantite: number;
  description: string | null;
  statut: string;
  caracteristiques: Caracteristiques | null;
  photos: string[];
  dateCreation: string;
}

export interface FacetCategorie {
  idTypeItem: number | null;
  nom: string;
  total: number;
}

export interface Mise {
  id: number;
  personne: PersonneResume;
  montant: number;
  date: string;
}

export interface EnchereResume {
  id: number;
  produit: ProduitResume;
  prixCourant: number;
  dateFin: string;
  statut: string;
  nombreMises: number;
}

export interface EnchereDetail {
  id: number;
  vendeur: PersonneResume;
  produit: ProduitResume;
  description: string | null;
  prixDepart: number;
  prixReserve: number | null;
  prixCourant: number;
  prixFinal: number | null;
  dateDebut: string;
  dateFin: string;
  statut: string;
  caracteristiques: Caracteristiques | null;
  photos: string[];
  mises: Mise[];
  idPersonneGagnant: number | null;
}

export interface CollectionCarte {
  id: number;
  produit: ProduitResume;
  quantite: number;
  caracteristiques: Caracteristiques;
  dateAjout: string;
}

export interface CollectionItem {
  id: number;
  produit: ProduitResume;
  quantite: number;
  etat: string | null;
  dateAjout: string;
}

export interface Estimation {
  estime: number | null;
  min: number | null;
  max: number | null;
  tailleEchantillon: number;
  correspondanceExacte: boolean;
}

export interface ValeurTotale {
  total: number;
  articlesEstimes: number;
  articlesTotal: number;
}

export interface ProgressionSerie {
  serie: Serie;
  possedees: number;
  total: number;
  pourcentage: number;
}

export interface PanierLigne {
  id: number;
  annonce: Annonce;
  quantite: number;
  prixUnitaire: number;
}

export interface PanierVendeur {
  vendeur: PersonneResume;
  lignes: PanierLigne[];
  sousTotal: number;
}

export interface PanierSummary {
  nombreVendeurs: number;
  nombreArticles: number;
  valeurTotale: number;
}

export interface Panier {
  vendeurs: PanierVendeur[];
  summary: PanierSummary;
}

export interface CommandeLigne {
  id: number;
  produit: ProduitResume;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
}

export interface Expedition {
  transporteur: string | null;
  numeroSuivi: string | null;
  modeLivraison: string | null;
  frais: number | null;
  statut: string | null;
  dateExpedition: string | null;
  dateLivraison: string | null;
}

export interface Commande {
  id: number;
  acheteur: PersonneResume;
  vendeur: PersonneResume;
  statut: string;
  montantTotal: number;
  fraisLivraison: number;
  fraisService: number;
  adresse: string | null;
  codePostal: string | null;
  ville: string | null;
  pays: string | null;
  lignes: CommandeLigne[];
  expedition: Expedition | null;
  dateCreation: string;
}

export interface SellerProfile {
  id: number;
  pseudo: string;
  dateCreation: string;
  noteMoyenne: number;
  nombreEvaluations: number;
}

export interface Evaluation {
  id: number;
  auteurPseudo: string;
  note: number;
  commentaire: string | null;
  date: string;
}

export interface Conversation {
  id: number;
  acheteur: PersonneResume;
  vendeur: PersonneResume;
  idAnnonce: number | null;
  idEnchere: number | null;
  idCommande: number | null;
  dateCreation: string;
}

export interface OffrePrix {
  id: number;
  montant: number;
  statut: string;
  dateCreation: string;
}

export interface Message {
  id: number;
  idConversation: number;
  expediteur: PersonneResume;
  type: string;
  contenu: string | null;
  image: string | null;
  offre: OffrePrix | null;
  dateCreation: string;
}

export interface RecentlyViewedEntry extends ProduitResume {}

export type ExemplarFilters = {
  etat?: string | null;
  etatMin?: string | null;
  idLangue?: number | null;
  holo?: boolean;
  edition1?: boolean;
  pokeball?: boolean;
  misscut?: boolean;
  missprint?: boolean;
  stamp?: boolean;
  reverse?: boolean;
  grade?: boolean;
  idSocieteGradation?: number | null;
  noteGradation?: number | null;
  description?: string | null;
} & {
  type?: ItemKind;
  q?: string;
  idSerie?: number;
  idBloc?: number;
  idTypeItem?: number;
  minPrice?: number | string;
  maxPrice?: number | string;
  availableOnly?: boolean;
  page?: number;
  pageSize?: number;
};
