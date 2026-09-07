using Microsoft.EntityFrameworkCore;
using TcgWorld.Api.Data.Entities;

namespace TcgWorld.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Personne> Personnes => Set<Personne>();
    public DbSet<VueRecente> VuesRecentes => Set<VueRecente>();
    public DbSet<Jeu> Jeux => Set<Jeu>();
    public DbSet<Bloc> Blocs => Set<Bloc>();
    public DbSet<Serie> Series => Set<Serie>();
    public DbSet<TypeItem> TypesItem => Set<TypeItem>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Carte> Cartes => Set<Carte>();
    public DbSet<Langue> Langues => Set<Langue>();
    public DbSet<SocieteGradation> SocietesGradation => Set<SocieteGradation>();
    public DbSet<Annonce> Annonces => Set<Annonce>();
    public DbSet<AnnonceCarte> AnnoncesCarte => Set<AnnonceCarte>();
    public DbSet<PhotoAnnonce> PhotosAnnonce => Set<PhotoAnnonce>();
    public DbSet<Panier> Paniers => Set<Panier>();
    public DbSet<PanierLigne> PanierLignes => Set<PanierLigne>();
    public DbSet<Enchere> Encheres => Set<Enchere>();
    public DbSet<EnchereCarte> EncheresCarte => Set<EnchereCarte>();
    public DbSet<MiseEnchere> MisesEnchere => Set<MiseEnchere>();
    public DbSet<PhotoEnchere> PhotosEnchere => Set<PhotoEnchere>();
    public DbSet<Collection> Collections => Set<Collection>();
    public DbSet<CollectionCarte> CollectionsCarte => Set<CollectionCarte>();
    public DbSet<CollectionItem> CollectionsItem => Set<CollectionItem>();
    public DbSet<StatutCommande> StatutsCommande => Set<StatutCommande>();
    public DbSet<Commande> Commandes => Set<Commande>();
    public DbSet<CommandeLigne> CommandeLignes => Set<CommandeLigne>();
    public DbSet<Expedition> Expeditions => Set<Expedition>();
    public DbSet<Evaluation> Evaluations => Set<Evaluation>();
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<OffrePrix> OffresPrix => Set<OffrePrix>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // ── Clés primaires explicites : la convention EF Core ne reconnaît que
        // "Id" ou "{Entité}Id" comme PK auto-détectée, pas le préfixe "Id{Entité}"
        // utilisé par le DBML fourni (ex. IdAnnonce) — il faut donc les déclarer. ──
        b.Entity<Personne>().HasKey(e => e.IdPersonne);
        b.Entity<VueRecente>().HasKey(e => e.IdVueRecente);
        b.Entity<Jeu>().HasKey(e => e.IdJeu);
        b.Entity<Bloc>().HasKey(e => e.IdBloc);
        b.Entity<Serie>().HasKey(e => e.IdSerie);
        b.Entity<TypeItem>().HasKey(e => e.IdTypeItem);
        b.Entity<Item>().HasKey(e => e.IdItem);
        b.Entity<Carte>().HasKey(e => e.IdCarte);
        b.Entity<Langue>().HasKey(e => e.IdLangue);
        b.Entity<SocieteGradation>().HasKey(e => e.IdSocieteGradation);
        b.Entity<Annonce>().HasKey(e => e.IdAnnonce);
        b.Entity<AnnonceCarte>().HasKey(e => e.IdAnnonceCarte);
        b.Entity<PhotoAnnonce>().HasKey(e => e.IdPhotoAnnonce);
        b.Entity<Panier>().HasKey(e => e.IdPanier);
        b.Entity<PanierLigne>().HasKey(e => e.IdPanierLigne);
        b.Entity<Enchere>().HasKey(e => e.IdEnchere);
        b.Entity<EnchereCarte>().HasKey(e => e.IdEnchereCarte);
        b.Entity<MiseEnchere>().HasKey(e => e.IdMiseEnchere);
        b.Entity<PhotoEnchere>().HasKey(e => e.IdPhotoEnchere);
        b.Entity<Collection>().HasKey(e => e.IdCollection);
        b.Entity<CollectionCarte>().HasKey(e => e.IdCollectionCarte);
        b.Entity<CollectionItem>().HasKey(e => e.IdCollectionItem);
        b.Entity<StatutCommande>().HasKey(e => e.IdStatutCommande);
        b.Entity<Commande>().HasKey(e => e.IdCommande);
        b.Entity<CommandeLigne>().HasKey(e => e.IdCommandeLigne);
        b.Entity<Expedition>().HasKey(e => e.IdExpedition);
        b.Entity<Evaluation>().HasKey(e => e.IdEvaluation);
        b.Entity<Conversation>().HasKey(e => e.IdConversation);
        b.Entity<Message>().HasKey(e => e.IdMessage);
        b.Entity<OffrePrix>().HasKey(e => e.IdOffrePrix);

        // ── Noms de table dat* explicites (convention du DBML fourni) ──
        b.Entity<Personne>().ToTable("datPersonne");
        b.Entity<VueRecente>().ToTable("datVueRecente");
        b.Entity<Jeu>().ToTable("datJeu");
        b.Entity<Bloc>().ToTable("datBloc");
        b.Entity<Serie>().ToTable("datSerie");
        b.Entity<TypeItem>().ToTable("datTypeItem");
        b.Entity<Item>().ToTable("datItem");
        b.Entity<Carte>().ToTable("datCarte");
        b.Entity<Langue>().ToTable("datLangue");
        b.Entity<SocieteGradation>().ToTable("datSocieteGradation");
        b.Entity<Annonce>().ToTable("datAnnonce");
        b.Entity<AnnonceCarte>().ToTable("datAnnonceCarte");
        b.Entity<PhotoAnnonce>().ToTable("datPhotoAnnonce");
        b.Entity<Panier>().ToTable("datPanier");
        b.Entity<PanierLigne>().ToTable("datPanierLigne");
        b.Entity<Enchere>().ToTable("datEnchere");
        b.Entity<EnchereCarte>().ToTable("datEnchereCarte");
        b.Entity<MiseEnchere>().ToTable("datMiseEnchere");
        b.Entity<PhotoEnchere>().ToTable("datPhotoEnchere");
        b.Entity<Collection>().ToTable("datCollection");
        b.Entity<CollectionCarte>().ToTable("datCollectionCarte");
        b.Entity<CollectionItem>().ToTable("datCollectionItem");
        b.Entity<StatutCommande>().ToTable("datStatutCommande");
        b.Entity<Commande>().ToTable("datCommande");
        b.Entity<CommandeLigne>().ToTable("datCommandeLigne");
        b.Entity<Expedition>().ToTable("datExpedition");
        b.Entity<Evaluation>().ToTable("datEvaluation");
        b.Entity<Conversation>().ToTable("datConversation");
        b.Entity<Message>().ToTable("datMessage");
        b.Entity<OffrePrix>().ToTable("datOffrePrix");

        // ── Enums stockés en string ──
        b.Entity<Annonce>().Property(e => e.AnnStatut).HasConversion<string>();
        b.Entity<AnnonceCarte>().Property(e => e.AncEtat).HasConversion<string>();
        b.Entity<Enchere>().Property(e => e.EncStatut).HasConversion<string>();
        b.Entity<EnchereCarte>().Property(e => e.EncEtat).HasConversion<string>();
        b.Entity<CollectionCarte>().Property(e => e.ColcEtat).HasConversion<string>();
        b.Entity<Expedition>().Property(e => e.ExpStatut).HasConversion<string>();
        b.Entity<Message>().Property(e => e.MsgType).HasConversion<string>();
        b.Entity<OffrePrix>().Property(e => e.OfrStatut).HasConversion<string>();

        // ── Précision décimale (numeric(12,2) comme le DBML ; notes de gradation numeric(4,2)) ──
        b.Entity<Annonce>().Property(e => e.AnnPrix).HasPrecision(12, 2);
        b.Entity<AnnonceCarte>().Property(e => e.AncNoteGradation).HasPrecision(4, 2);
        b.Entity<PanierLigne>().Property(e => e.PnlPrixUnitaire).HasPrecision(12, 2);
        b.Entity<Enchere>().Property(e => e.EncPrixDepart).HasPrecision(12, 2);
        b.Entity<Enchere>().Property(e => e.EncPrixReserve).HasPrecision(12, 2);
        b.Entity<Enchere>().Property(e => e.EncPrixFinal).HasPrecision(12, 2);
        b.Entity<EnchereCarte>().Property(e => e.EncNoteGradation).HasPrecision(4, 2);
        b.Entity<MiseEnchere>().Property(e => e.MisMontant).HasPrecision(12, 2);
        b.Entity<CollectionCarte>().Property(e => e.ColcNoteGradation).HasPrecision(4, 2);
        b.Entity<Commande>().Property(e => e.CmdMontantTotal).HasPrecision(12, 2);
        b.Entity<Commande>().Property(e => e.CmdFraisLivraison).HasPrecision(12, 2);
        b.Entity<Commande>().Property(e => e.CmdFraisService).HasPrecision(12, 2);
        b.Entity<CommandeLigne>().Property(e => e.CmlPrixUnitaire).HasPrecision(12, 2);
        b.Entity<CommandeLigne>().Property(e => e.CmlMontantTotal).HasPrecision(12, 2);
        b.Entity<Expedition>().Property(e => e.ExpFraisLivraison).HasPrecision(12, 2);
        b.Entity<OffrePrix>().Property(e => e.OfrMontant).HasPrecision(12, 2);

        // ── Contraintes uniques ──
        b.Entity<Personne>().HasIndex(e => e.PrsPseudo).IsUnique();
        b.Entity<Personne>().HasIndex(e => e.PrsEmail).IsUnique();
        b.Entity<StatutCommande>().HasIndex(e => e.StcCode).IsUnique();
        b.Entity<AnnonceCarte>().HasIndex(e => e.IdAnnonce).IsUnique();
        b.Entity<EnchereCarte>().HasIndex(e => e.IdEnchere).IsUnique();
        b.Entity<Expedition>().HasIndex(e => e.IdCommande).IsUnique();
        b.Entity<Evaluation>().HasIndex(e => new { e.IdCommande, e.IdPersonneAuteur }).IsUnique();

        // ── Index de requête ──
        b.Entity<Carte>().HasIndex(e => e.IdSerie);
        b.Entity<Carte>().HasIndex(e => e.CrtNom);
        b.Entity<Item>().HasIndex(e => e.IdSerie);
        b.Entity<Annonce>().HasIndex(e => e.IdCarte);
        b.Entity<Annonce>().HasIndex(e => e.IdItem);
        b.Entity<Annonce>().HasIndex(e => e.IdPersonne);
        b.Entity<Annonce>().HasIndex(e => e.AnnStatut);
        b.Entity<Enchere>().HasIndex(e => e.IdCarte);
        b.Entity<Enchere>().HasIndex(e => e.IdItem);
        b.Entity<Enchere>().HasIndex(e => e.IdPersonne);
        b.Entity<Enchere>().HasIndex(e => e.EncStatut);
        b.Entity<Enchere>().HasIndex(e => e.EncDateFin);
        b.Entity<MiseEnchere>().HasIndex(e => e.IdEnchere);
        b.Entity<CollectionCarte>().HasIndex(e => e.IdCollection);
        b.Entity<CollectionCarte>().HasIndex(e => e.IdCarte);
        b.Entity<CollectionItem>().HasIndex(e => e.IdCollection);
        b.Entity<CollectionItem>().HasIndex(e => e.IdItem);
        b.Entity<Commande>().HasIndex(e => e.IdAcheteur);
        b.Entity<Commande>().HasIndex(e => e.IdVendeur);
        b.Entity<Commande>().HasIndex(e => e.IdStatutCommande);
        b.Entity<CommandeLigne>().HasIndex(e => e.IdCommande);
        b.Entity<Evaluation>().HasIndex(e => e.IdPersonneEvaluee);
        b.Entity<OffrePrix>().HasIndex(e => e.IdAnnonce);
        b.Entity<OffrePrix>().HasIndex(e => e.IdPersonneAcheteur);
        b.Entity<OffrePrix>().HasIndex(e => e.OfrStatut);
        b.Entity<Conversation>().HasIndex(e => e.IdPersonneAcheteur);
        b.Entity<Conversation>().HasIndex(e => e.IdPersonneVendeur);
        b.Entity<Message>().HasIndex(e => e.IdConversation);
        b.Entity<VueRecente>().HasIndex(e => e.IdPersonne);

        // ── Relations : Cascade uniquement pour les enfants réellement "possédés"
        // (photos, lignes, caractéristiques d'exemplaire) ; Restrict partout
        // ailleurs pour éviter les cycles de cascade multiples (nombreuses FK
        // convergeant vers Personne/Carte/Item/Annonce/Enchere/Commande). ──

        b.Entity<AnnonceCarte>().HasOne(e => e.Annonce).WithOne(a => a.AnnonceCarte)
            .HasForeignKey<AnnonceCarte>(e => e.IdAnnonce).OnDelete(DeleteBehavior.Cascade);
        b.Entity<PhotoAnnonce>().HasOne(e => e.Annonce).WithMany(a => a.Photos)
            .HasForeignKey(e => e.IdAnnonce).OnDelete(DeleteBehavior.Cascade);
        b.Entity<PanierLigne>().HasOne(e => e.Panier).WithMany(p => p.Lignes)
            .HasForeignKey(e => e.IdPanier).OnDelete(DeleteBehavior.Cascade);
        b.Entity<EnchereCarte>().HasOne(e => e.Enchere).WithOne(a => a.EnchereCarte)
            .HasForeignKey<EnchereCarte>(e => e.IdEnchere).OnDelete(DeleteBehavior.Cascade);
        b.Entity<PhotoEnchere>().HasOne(e => e.Enchere).WithMany(a => a.Photos)
            .HasForeignKey(e => e.IdEnchere).OnDelete(DeleteBehavior.Cascade);
        b.Entity<MiseEnchere>().HasOne(e => e.Enchere).WithMany(a => a.Mises)
            .HasForeignKey(e => e.IdEnchere).OnDelete(DeleteBehavior.Cascade);
        b.Entity<CollectionCarte>().HasOne(e => e.Collection).WithMany(c => c.Cartes)
            .HasForeignKey(e => e.IdCollection).OnDelete(DeleteBehavior.Cascade);
        b.Entity<CollectionItem>().HasOne(e => e.Collection).WithMany(c => c.Items)
            .HasForeignKey(e => e.IdCollection).OnDelete(DeleteBehavior.Cascade);
        b.Entity<CommandeLigne>().HasOne(e => e.Commande).WithMany(c => c.Lignes)
            .HasForeignKey(e => e.IdCommande).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Expedition>().HasOne(e => e.Commande).WithOne(c => c.Expedition)
            .HasForeignKey<Expedition>(e => e.IdCommande).OnDelete(DeleteBehavior.Cascade);
        b.Entity<Message>().HasOne(e => e.Conversation).WithMany(c => c.Messages)
            .HasForeignKey(e => e.IdConversation).OnDelete(DeleteBehavior.Cascade);
        b.Entity<OffrePrix>().HasOne(e => e.Conversation).WithMany(c => c.OffresPrix)
            .HasForeignKey(e => e.IdConversation).OnDelete(DeleteBehavior.Cascade);

        // ── Restrict (FK simplement référentielles) ──
        b.Entity<VueRecente>().HasOne(e => e.Personne).WithMany()
            .HasForeignKey(e => e.IdPersonne).OnDelete(DeleteBehavior.Restrict);
        b.Entity<VueRecente>().HasOne(e => e.Carte).WithMany()
            .HasForeignKey(e => e.IdCarte).OnDelete(DeleteBehavior.Restrict);
        b.Entity<VueRecente>().HasOne(e => e.Item).WithMany()
            .HasForeignKey(e => e.IdItem).OnDelete(DeleteBehavior.Restrict);

        b.Entity<Bloc>().HasOne(e => e.Jeu).WithMany(j => j.Blocs)
            .HasForeignKey(e => e.IdJeu).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Serie>().HasOne(e => e.Bloc).WithMany(bl => bl.Series)
            .HasForeignKey(e => e.IdBloc).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Item>().HasOne(e => e.Serie).WithMany(s => s.Items)
            .HasForeignKey(e => e.IdSerie).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Item>().HasOne(e => e.TypeItem).WithMany(t => t.Items)
            .HasForeignKey(e => e.IdTypeItem).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Carte>().HasOne(e => e.Serie).WithMany(s => s.Cartes)
            .HasForeignKey(e => e.IdSerie).OnDelete(DeleteBehavior.Restrict);

        b.Entity<Annonce>().HasOne(e => e.Personne).WithMany()
            .HasForeignKey(e => e.IdPersonne).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Annonce>().HasOne(e => e.Carte).WithMany()
            .HasForeignKey(e => e.IdCarte).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Annonce>().HasOne(e => e.Item).WithMany()
            .HasForeignKey(e => e.IdItem).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Annonce>().HasOne(e => e.Langue).WithMany()
            .HasForeignKey(e => e.IdLangue).OnDelete(DeleteBehavior.Restrict);
        b.Entity<AnnonceCarte>().HasOne(e => e.SocieteGradation).WithMany()
            .HasForeignKey(e => e.IdSocieteGradation).OnDelete(DeleteBehavior.Restrict);

        b.Entity<Panier>().HasOne(e => e.Personne).WithMany()
            .HasForeignKey(e => e.IdPersonne).OnDelete(DeleteBehavior.Restrict);
        b.Entity<PanierLigne>().HasOne(e => e.Annonce).WithMany()
            .HasForeignKey(e => e.IdAnnonce).OnDelete(DeleteBehavior.Restrict);

        b.Entity<Enchere>().HasOne(e => e.Personne).WithMany()
            .HasForeignKey(e => e.IdPersonne).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Enchere>().HasOne(e => e.Carte).WithMany()
            .HasForeignKey(e => e.IdCarte).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Enchere>().HasOne(e => e.Item).WithMany()
            .HasForeignKey(e => e.IdItem).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Enchere>().HasOne(e => e.Langue).WithMany()
            .HasForeignKey(e => e.IdLangue).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Enchere>().HasOne(e => e.PersonneGagnant).WithMany()
            .HasForeignKey(e => e.IdPersonneGagnant).OnDelete(DeleteBehavior.Restrict);
        b.Entity<EnchereCarte>().HasOne(e => e.SocieteGradation).WithMany()
            .HasForeignKey(e => e.IdSocieteGradation).OnDelete(DeleteBehavior.Restrict);
        b.Entity<MiseEnchere>().HasOne(e => e.Personne).WithMany()
            .HasForeignKey(e => e.IdPersonne).OnDelete(DeleteBehavior.Restrict);

        b.Entity<Collection>().HasOne(e => e.Personne).WithMany()
            .HasForeignKey(e => e.IdPersonne).OnDelete(DeleteBehavior.Restrict);
        b.Entity<CollectionCarte>().HasOne(e => e.Carte).WithMany()
            .HasForeignKey(e => e.IdCarte).OnDelete(DeleteBehavior.Restrict);
        b.Entity<CollectionCarte>().HasOne(e => e.Langue).WithMany()
            .HasForeignKey(e => e.IdLangue).OnDelete(DeleteBehavior.Restrict);
        b.Entity<CollectionCarte>().HasOne(e => e.SocieteGradation).WithMany()
            .HasForeignKey(e => e.IdSocieteGradation).OnDelete(DeleteBehavior.Restrict);
        b.Entity<CollectionItem>().HasOne(e => e.Item).WithMany()
            .HasForeignKey(e => e.IdItem).OnDelete(DeleteBehavior.Restrict);
        b.Entity<CollectionItem>().HasOne(e => e.Langue).WithMany()
            .HasForeignKey(e => e.IdLangue).OnDelete(DeleteBehavior.Restrict);

        b.Entity<Commande>().HasOne(e => e.Acheteur).WithMany()
            .HasForeignKey(e => e.IdAcheteur).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Commande>().HasOne(e => e.Vendeur).WithMany()
            .HasForeignKey(e => e.IdVendeur).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Commande>().HasOne(e => e.StatutCommande).WithMany()
            .HasForeignKey(e => e.IdStatutCommande).OnDelete(DeleteBehavior.Restrict);
        b.Entity<CommandeLigne>().HasOne(e => e.Annonce).WithMany()
            .HasForeignKey(e => e.IdAnnonce).OnDelete(DeleteBehavior.Restrict);

        b.Entity<Evaluation>().HasOne(e => e.PersonneAuteur).WithMany()
            .HasForeignKey(e => e.IdPersonneAuteur).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Evaluation>().HasOne(e => e.PersonneEvaluee).WithMany()
            .HasForeignKey(e => e.IdPersonneEvaluee).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Evaluation>().HasOne(e => e.Commande).WithMany(c => c.Evaluations)
            .HasForeignKey(e => e.IdCommande).OnDelete(DeleteBehavior.Restrict);

        b.Entity<Conversation>().HasOne(e => e.PersonneAcheteur).WithMany()
            .HasForeignKey(e => e.IdPersonneAcheteur).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Conversation>().HasOne(e => e.PersonneVendeur).WithMany()
            .HasForeignKey(e => e.IdPersonneVendeur).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Conversation>().HasOne(e => e.Annonce).WithMany()
            .HasForeignKey(e => e.IdAnnonce).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Conversation>().HasOne(e => e.Enchere).WithMany()
            .HasForeignKey(e => e.IdEnchere).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Conversation>().HasOne(e => e.Commande).WithMany()
            .HasForeignKey(e => e.IdCommande).OnDelete(DeleteBehavior.Restrict);

        b.Entity<Message>().HasOne(e => e.PersonneExpediteur).WithMany()
            .HasForeignKey(e => e.IdPersonneExpediteur).OnDelete(DeleteBehavior.Restrict);
        b.Entity<Message>().HasOne(e => e.OffrePrix).WithMany(o => o.Messages)
            .HasForeignKey(e => e.IdOffrePrix).OnDelete(DeleteBehavior.Restrict);

        b.Entity<OffrePrix>().HasOne(e => e.Annonce).WithMany()
            .HasForeignKey(e => e.IdAnnonce).OnDelete(DeleteBehavior.Restrict);
        b.Entity<OffrePrix>().HasOne(e => e.PersonneAcheteur).WithMany()
            .HasForeignKey(e => e.IdPersonneAcheteur).OnDelete(DeleteBehavior.Restrict);
        b.Entity<OffrePrix>().HasOne(e => e.PersonneVendeur).WithMany()
            .HasForeignKey(e => e.IdPersonneVendeur).OnDelete(DeleteBehavior.Restrict);
    }
}
