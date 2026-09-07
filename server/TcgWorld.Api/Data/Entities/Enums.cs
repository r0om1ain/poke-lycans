namespace TcgWorld.Api.Data.Entities;

// État d'un exemplaire de carte (Cardmarket-like, du meilleur au pire) — utilisé sur
// AnnonceCarte, EnchereCarte, CollectionCarte (AncEtat/EncEtat/ColcEtat, varchar(50) dans le DBML).
public enum EtatCarte { MINT, NM, EXCELLENT, GOOD, LP, PLAYED, POOR }

public enum AnnonceStatut { ACTIVE, VENDUE, SUPPRIMEE }

public enum EnchereStatut { ACTIVE, TERMINEE, ANNULEE }

public enum ExpeditionStatut { PREPAREE, EXPEDIEE, LIVREE }

// Tables datConversation/datMessage/datOffrePrix ajoutées par rapport au DBML fourni
// (décision utilisateur : messagerie/négociation conservées — voir addendum du plan).
public enum TypeMessage { TEXTE, IMAGE, OFFRE }

public enum StatutOffrePrix { EN_ATTENTE, ACCEPTEE, REFUSEE, EXPIREE, UTILISEE }
