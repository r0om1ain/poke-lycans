using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace TcgWorld.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "datJeu",
                columns: table => new
                {
                    IdJeu = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    JeuNom = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datJeu", x => x.IdJeu);
                });

            migrationBuilder.CreateTable(
                name: "datLangue",
                columns: table => new
                {
                    IdLangue = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LngNom = table.Column<string>(type: "text", nullable: false),
                    LngCode = table.Column<string>(type: "text", nullable: false),
                    LngFlgArchive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datLangue", x => x.IdLangue);
                });

            migrationBuilder.CreateTable(
                name: "datPersonne",
                columns: table => new
                {
                    IdPersonne = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PrsNom = table.Column<string>(type: "text", nullable: false),
                    PrsPrenom = table.Column<string>(type: "text", nullable: false),
                    PrsPseudo = table.Column<string>(type: "text", nullable: false),
                    PrsEmail = table.Column<string>(type: "text", nullable: false),
                    PrsMotDePasseHash = table.Column<string>(type: "text", nullable: false),
                    PrsTelephone = table.Column<string>(type: "text", nullable: true),
                    PrsDateNaissance = table.Column<DateOnly>(type: "date", nullable: true),
                    PrsAdresse = table.Column<string>(type: "text", nullable: true),
                    PrsCodePostal = table.Column<string>(type: "text", nullable: true),
                    PrsVille = table.Column<string>(type: "text", nullable: true),
                    PrsPays = table.Column<string>(type: "text", nullable: true),
                    PrsRole = table.Column<string>(type: "text", nullable: false),
                    PrsFlgEmailVerifie = table.Column<bool>(type: "boolean", nullable: false),
                    PrsFlgCompteVerifie = table.Column<bool>(type: "boolean", nullable: false),
                    PrsDateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PrsDateDerniereConnexion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    PrsFlgArchive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datPersonne", x => x.IdPersonne);
                });

            migrationBuilder.CreateTable(
                name: "datSocieteGradation",
                columns: table => new
                {
                    IdSocieteGradation = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    SgrNom = table.Column<string>(type: "text", nullable: false),
                    SgrCode = table.Column<string>(type: "text", nullable: true),
                    SgrFlgArchive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datSocieteGradation", x => x.IdSocieteGradation);
                });

            migrationBuilder.CreateTable(
                name: "datStatutCommande",
                columns: table => new
                {
                    IdStatutCommande = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StcCode = table.Column<string>(type: "text", nullable: false),
                    StcNom = table.Column<string>(type: "text", nullable: false),
                    StcOrdre = table.Column<int>(type: "integer", nullable: true),
                    StcFlgArchive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datStatutCommande", x => x.IdStatutCommande);
                });

            migrationBuilder.CreateTable(
                name: "datTypeItem",
                columns: table => new
                {
                    IdTypeItem = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    TypNom = table.Column<string>(type: "text", nullable: false),
                    TypCode = table.Column<string>(type: "text", nullable: true),
                    TypFlgArchive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datTypeItem", x => x.IdTypeItem);
                });

            migrationBuilder.CreateTable(
                name: "datBloc",
                columns: table => new
                {
                    IdBloc = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdJeu = table.Column<int>(type: "integer", nullable: false),
                    BlcNom = table.Column<string>(type: "text", nullable: false),
                    BlcDateSortie = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datBloc", x => x.IdBloc);
                    table.ForeignKey(
                        name: "FK_datBloc_datJeu_IdJeu",
                        column: x => x.IdJeu,
                        principalTable: "datJeu",
                        principalColumn: "IdJeu",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datCollection",
                columns: table => new
                {
                    IdCollection = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdPersonne = table.Column<int>(type: "integer", nullable: false),
                    ColDateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ColDateModification = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datCollection", x => x.IdCollection);
                    table.ForeignKey(
                        name: "FK_datCollection_datPersonne_IdPersonne",
                        column: x => x.IdPersonne,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datPanier",
                columns: table => new
                {
                    IdPanier = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdPersonne = table.Column<int>(type: "integer", nullable: false),
                    PnrDateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    PnrDateModification = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datPanier", x => x.IdPanier);
                    table.ForeignKey(
                        name: "FK_datPanier_datPersonne_IdPersonne",
                        column: x => x.IdPersonne,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datCommande",
                columns: table => new
                {
                    IdCommande = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdAcheteur = table.Column<int>(type: "integer", nullable: false),
                    IdVendeur = table.Column<int>(type: "integer", nullable: false),
                    IdStatutCommande = table.Column<int>(type: "integer", nullable: false),
                    CmdMontantTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    CmdFraisLivraison = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    CmdFraisService = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    CmdAdresse = table.Column<string>(type: "text", nullable: true),
                    CmdCodePostal = table.Column<string>(type: "text", nullable: true),
                    CmdVille = table.Column<string>(type: "text", nullable: true),
                    CmdPays = table.Column<string>(type: "text", nullable: true),
                    CmdDateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CmdDateValidation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CmdDateExpedition = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CmdDateReception = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CmdFlgArchive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datCommande", x => x.IdCommande);
                    table.ForeignKey(
                        name: "FK_datCommande_datPersonne_IdAcheteur",
                        column: x => x.IdAcheteur,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datCommande_datPersonne_IdVendeur",
                        column: x => x.IdVendeur,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datCommande_datStatutCommande_IdStatutCommande",
                        column: x => x.IdStatutCommande,
                        principalTable: "datStatutCommande",
                        principalColumn: "IdStatutCommande",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datSerie",
                columns: table => new
                {
                    IdSerie = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdBloc = table.Column<int>(type: "integer", nullable: false),
                    SerNom = table.Column<string>(type: "text", nullable: false),
                    SerCode = table.Column<string>(type: "text", nullable: true),
                    SerDateSortie = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datSerie", x => x.IdSerie);
                    table.ForeignKey(
                        name: "FK_datSerie_datBloc_IdBloc",
                        column: x => x.IdBloc,
                        principalTable: "datBloc",
                        principalColumn: "IdBloc",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datEvaluation",
                columns: table => new
                {
                    IdEvaluation = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdPersonneAuteur = table.Column<int>(type: "integer", nullable: false),
                    IdPersonneEvaluee = table.Column<int>(type: "integer", nullable: false),
                    IdCommande = table.Column<int>(type: "integer", nullable: false),
                    EvaNote = table.Column<int>(type: "integer", nullable: false),
                    EvaCommentaire = table.Column<string>(type: "text", nullable: true),
                    EvaDateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EvaFlgArchive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datEvaluation", x => x.IdEvaluation);
                    table.ForeignKey(
                        name: "FK_datEvaluation_datCommande_IdCommande",
                        column: x => x.IdCommande,
                        principalTable: "datCommande",
                        principalColumn: "IdCommande",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datEvaluation_datPersonne_IdPersonneAuteur",
                        column: x => x.IdPersonneAuteur,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datEvaluation_datPersonne_IdPersonneEvaluee",
                        column: x => x.IdPersonneEvaluee,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datExpedition",
                columns: table => new
                {
                    IdExpedition = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdCommande = table.Column<int>(type: "integer", nullable: false),
                    ExpTransporteur = table.Column<string>(type: "text", nullable: true),
                    ExpNumeroSuivi = table.Column<string>(type: "text", nullable: true),
                    ExpModeLivraison = table.Column<string>(type: "text", nullable: true),
                    ExpFraisLivraison = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: true),
                    ExpDateExpedition = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpDateLivraisonPrevue = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpDateLivraison = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ExpStatut = table.Column<string>(type: "text", nullable: true),
                    ExpFlgArchive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datExpedition", x => x.IdExpedition);
                    table.ForeignKey(
                        name: "FK_datExpedition_datCommande_IdCommande",
                        column: x => x.IdCommande,
                        principalTable: "datCommande",
                        principalColumn: "IdCommande",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "datCarte",
                columns: table => new
                {
                    IdCarte = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdSerie = table.Column<int>(type: "integer", nullable: false),
                    CrtNom = table.Column<string>(type: "text", nullable: false),
                    CrtNumero = table.Column<string>(type: "text", nullable: true),
                    CrtCode = table.Column<string>(type: "text", nullable: true),
                    CrtNumeroSerie = table.Column<string>(type: "text", nullable: true),
                    CrtRarete = table.Column<string>(type: "text", nullable: true),
                    CrtImage = table.Column<string>(type: "text", nullable: true),
                    CrtDateSortie = table.Column<DateOnly>(type: "date", nullable: true),
                    CrtFlgArchive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datCarte", x => x.IdCarte);
                    table.ForeignKey(
                        name: "FK_datCarte_datSerie_IdSerie",
                        column: x => x.IdSerie,
                        principalTable: "datSerie",
                        principalColumn: "IdSerie",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datItem",
                columns: table => new
                {
                    IdItem = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdSerie = table.Column<int>(type: "integer", nullable: false),
                    IdTypeItem = table.Column<int>(type: "integer", nullable: false),
                    ItmNom = table.Column<string>(type: "text", nullable: false),
                    ItmNumero = table.Column<string>(type: "text", nullable: true),
                    ItmDateSortie = table.Column<DateOnly>(type: "date", nullable: true),
                    ItmImage = table.Column<string>(type: "text", nullable: true),
                    ItmFlgArchive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datItem", x => x.IdItem);
                    table.ForeignKey(
                        name: "FK_datItem_datSerie_IdSerie",
                        column: x => x.IdSerie,
                        principalTable: "datSerie",
                        principalColumn: "IdSerie",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datItem_datTypeItem_IdTypeItem",
                        column: x => x.IdTypeItem,
                        principalTable: "datTypeItem",
                        principalColumn: "IdTypeItem",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datCollectionCarte",
                columns: table => new
                {
                    IdCollectionCarte = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdCollection = table.Column<int>(type: "integer", nullable: false),
                    IdCarte = table.Column<int>(type: "integer", nullable: false),
                    IdLangue = table.Column<int>(type: "integer", nullable: true),
                    ColcQuantite = table.Column<int>(type: "integer", nullable: false),
                    ColcEtat = table.Column<string>(type: "text", nullable: true),
                    ColcFlgEdition1 = table.Column<bool>(type: "boolean", nullable: false),
                    ColcFlgHolo = table.Column<bool>(type: "boolean", nullable: false),
                    ColcFlgReverse = table.Column<bool>(type: "boolean", nullable: false),
                    ColcFlgStamp = table.Column<bool>(type: "boolean", nullable: false),
                    ColcFlgPokeball = table.Column<bool>(type: "boolean", nullable: false),
                    ColcFlgMisscut = table.Column<bool>(type: "boolean", nullable: false),
                    ColcFlgMissprint = table.Column<bool>(type: "boolean", nullable: false),
                    ColcFlgGrade = table.Column<bool>(type: "boolean", nullable: false),
                    IdSocieteGradation = table.Column<int>(type: "integer", nullable: true),
                    ColcNoteGradation = table.Column<decimal>(type: "numeric(4,2)", precision: 4, scale: 2, nullable: true),
                    ColcDateAjout = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ColcDateModification = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datCollectionCarte", x => x.IdCollectionCarte);
                    table.ForeignKey(
                        name: "FK_datCollectionCarte_datCarte_IdCarte",
                        column: x => x.IdCarte,
                        principalTable: "datCarte",
                        principalColumn: "IdCarte",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datCollectionCarte_datCollection_IdCollection",
                        column: x => x.IdCollection,
                        principalTable: "datCollection",
                        principalColumn: "IdCollection",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_datCollectionCarte_datLangue_IdLangue",
                        column: x => x.IdLangue,
                        principalTable: "datLangue",
                        principalColumn: "IdLangue",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datCollectionCarte_datSocieteGradation_IdSocieteGradation",
                        column: x => x.IdSocieteGradation,
                        principalTable: "datSocieteGradation",
                        principalColumn: "IdSocieteGradation",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datAnnonce",
                columns: table => new
                {
                    IdAnnonce = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdPersonne = table.Column<int>(type: "integer", nullable: false),
                    IdCarte = table.Column<int>(type: "integer", nullable: true),
                    IdItem = table.Column<int>(type: "integer", nullable: true),
                    IdLangue = table.Column<int>(type: "integer", nullable: true),
                    AnnPrix = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    AnnQuantite = table.Column<int>(type: "integer", nullable: false),
                    AnnDescription = table.Column<string>(type: "text", nullable: true),
                    AnnStatut = table.Column<string>(type: "text", nullable: false),
                    AnnFlgMiseEnAvant = table.Column<bool>(type: "boolean", nullable: false),
                    AnnDateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    AnnDateModification = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    AnnFlgArchive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datAnnonce", x => x.IdAnnonce);
                    table.ForeignKey(
                        name: "FK_datAnnonce_datCarte_IdCarte",
                        column: x => x.IdCarte,
                        principalTable: "datCarte",
                        principalColumn: "IdCarte",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datAnnonce_datItem_IdItem",
                        column: x => x.IdItem,
                        principalTable: "datItem",
                        principalColumn: "IdItem",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datAnnonce_datLangue_IdLangue",
                        column: x => x.IdLangue,
                        principalTable: "datLangue",
                        principalColumn: "IdLangue",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datAnnonce_datPersonne_IdPersonne",
                        column: x => x.IdPersonne,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datCollectionItem",
                columns: table => new
                {
                    IdCollectionItem = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdCollection = table.Column<int>(type: "integer", nullable: false),
                    IdItem = table.Column<int>(type: "integer", nullable: false),
                    IdLangue = table.Column<int>(type: "integer", nullable: true),
                    CliQuantite = table.Column<int>(type: "integer", nullable: false),
                    CliEtat = table.Column<string>(type: "text", nullable: true),
                    CliDateAjout = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CliDateModification = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datCollectionItem", x => x.IdCollectionItem);
                    table.ForeignKey(
                        name: "FK_datCollectionItem_datCollection_IdCollection",
                        column: x => x.IdCollection,
                        principalTable: "datCollection",
                        principalColumn: "IdCollection",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_datCollectionItem_datItem_IdItem",
                        column: x => x.IdItem,
                        principalTable: "datItem",
                        principalColumn: "IdItem",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datCollectionItem_datLangue_IdLangue",
                        column: x => x.IdLangue,
                        principalTable: "datLangue",
                        principalColumn: "IdLangue",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datEnchere",
                columns: table => new
                {
                    IdEnchere = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdPersonne = table.Column<int>(type: "integer", nullable: false),
                    IdCarte = table.Column<int>(type: "integer", nullable: true),
                    IdItem = table.Column<int>(type: "integer", nullable: true),
                    IdLangue = table.Column<int>(type: "integer", nullable: true),
                    IdPersonneGagnant = table.Column<int>(type: "integer", nullable: true),
                    EncDescription = table.Column<string>(type: "text", nullable: true),
                    EncPrixDepart = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    EncPrixReserve = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: true),
                    EncPrixFinal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: true),
                    EncDateDebut = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EncDateFin = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EncDateCloture = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EncStatut = table.Column<string>(type: "text", nullable: false),
                    EncFlgArchive = table.Column<bool>(type: "boolean", nullable: false),
                    EncDateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datEnchere", x => x.IdEnchere);
                    table.ForeignKey(
                        name: "FK_datEnchere_datCarte_IdCarte",
                        column: x => x.IdCarte,
                        principalTable: "datCarte",
                        principalColumn: "IdCarte",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datEnchere_datItem_IdItem",
                        column: x => x.IdItem,
                        principalTable: "datItem",
                        principalColumn: "IdItem",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datEnchere_datLangue_IdLangue",
                        column: x => x.IdLangue,
                        principalTable: "datLangue",
                        principalColumn: "IdLangue",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datEnchere_datPersonne_IdPersonne",
                        column: x => x.IdPersonne,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datEnchere_datPersonne_IdPersonneGagnant",
                        column: x => x.IdPersonneGagnant,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datVueRecente",
                columns: table => new
                {
                    IdVueRecente = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdPersonne = table.Column<int>(type: "integer", nullable: false),
                    IdCarte = table.Column<int>(type: "integer", nullable: true),
                    IdItem = table.Column<int>(type: "integer", nullable: true),
                    VrcDateVue = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datVueRecente", x => x.IdVueRecente);
                    table.ForeignKey(
                        name: "FK_datVueRecente_datCarte_IdCarte",
                        column: x => x.IdCarte,
                        principalTable: "datCarte",
                        principalColumn: "IdCarte",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datVueRecente_datItem_IdItem",
                        column: x => x.IdItem,
                        principalTable: "datItem",
                        principalColumn: "IdItem",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datVueRecente_datPersonne_IdPersonne",
                        column: x => x.IdPersonne,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datAnnonceCarte",
                columns: table => new
                {
                    IdAnnonceCarte = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdAnnonce = table.Column<int>(type: "integer", nullable: false),
                    AncEtat = table.Column<string>(type: "text", nullable: true),
                    AncFlgEdition1 = table.Column<bool>(type: "boolean", nullable: false),
                    AncFlgHolo = table.Column<bool>(type: "boolean", nullable: false),
                    AncFlgReverse = table.Column<bool>(type: "boolean", nullable: false),
                    AncFlgStamp = table.Column<bool>(type: "boolean", nullable: false),
                    AncFlgPokeball = table.Column<bool>(type: "boolean", nullable: false),
                    AncFlgMisscut = table.Column<bool>(type: "boolean", nullable: false),
                    AncFlgMissprint = table.Column<bool>(type: "boolean", nullable: false),
                    AncFlgGrade = table.Column<bool>(type: "boolean", nullable: false),
                    IdSocieteGradation = table.Column<int>(type: "integer", nullable: true),
                    AncNoteGradation = table.Column<decimal>(type: "numeric(4,2)", precision: 4, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datAnnonceCarte", x => x.IdAnnonceCarte);
                    table.ForeignKey(
                        name: "FK_datAnnonceCarte_datAnnonce_IdAnnonce",
                        column: x => x.IdAnnonce,
                        principalTable: "datAnnonce",
                        principalColumn: "IdAnnonce",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_datAnnonceCarte_datSocieteGradation_IdSocieteGradation",
                        column: x => x.IdSocieteGradation,
                        principalTable: "datSocieteGradation",
                        principalColumn: "IdSocieteGradation",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datCommandeLigne",
                columns: table => new
                {
                    IdCommandeLigne = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdCommande = table.Column<int>(type: "integer", nullable: false),
                    IdAnnonce = table.Column<int>(type: "integer", nullable: false),
                    CmlQuantite = table.Column<int>(type: "integer", nullable: false),
                    CmlPrixUnitaire = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    CmlMontantTotal = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    CmlDateAjout = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datCommandeLigne", x => x.IdCommandeLigne);
                    table.ForeignKey(
                        name: "FK_datCommandeLigne_datAnnonce_IdAnnonce",
                        column: x => x.IdAnnonce,
                        principalTable: "datAnnonce",
                        principalColumn: "IdAnnonce",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datCommandeLigne_datCommande_IdCommande",
                        column: x => x.IdCommande,
                        principalTable: "datCommande",
                        principalColumn: "IdCommande",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "datPanierLigne",
                columns: table => new
                {
                    IdPanierLigne = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdPanier = table.Column<int>(type: "integer", nullable: false),
                    IdAnnonce = table.Column<int>(type: "integer", nullable: false),
                    PnlQuantite = table.Column<int>(type: "integer", nullable: false),
                    PnlPrixUnitaire = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    PnlDateAjout = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datPanierLigne", x => x.IdPanierLigne);
                    table.ForeignKey(
                        name: "FK_datPanierLigne_datAnnonce_IdAnnonce",
                        column: x => x.IdAnnonce,
                        principalTable: "datAnnonce",
                        principalColumn: "IdAnnonce",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datPanierLigne_datPanier_IdPanier",
                        column: x => x.IdPanier,
                        principalTable: "datPanier",
                        principalColumn: "IdPanier",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "datPhotoAnnonce",
                columns: table => new
                {
                    IdPhotoAnnonce = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdAnnonce = table.Column<int>(type: "integer", nullable: false),
                    PhoChemin = table.Column<string>(type: "text", nullable: false),
                    PhoOrdre = table.Column<int>(type: "integer", nullable: true),
                    PhoFlgPrincipale = table.Column<bool>(type: "boolean", nullable: false),
                    PhoDateAjout = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datPhotoAnnonce", x => x.IdPhotoAnnonce);
                    table.ForeignKey(
                        name: "FK_datPhotoAnnonce_datAnnonce_IdAnnonce",
                        column: x => x.IdAnnonce,
                        principalTable: "datAnnonce",
                        principalColumn: "IdAnnonce",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "datConversation",
                columns: table => new
                {
                    IdConversation = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdPersonneAcheteur = table.Column<int>(type: "integer", nullable: false),
                    IdPersonneVendeur = table.Column<int>(type: "integer", nullable: false),
                    IdAnnonce = table.Column<int>(type: "integer", nullable: true),
                    IdEnchere = table.Column<int>(type: "integer", nullable: true),
                    IdCommande = table.Column<int>(type: "integer", nullable: true),
                    ConDateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datConversation", x => x.IdConversation);
                    table.ForeignKey(
                        name: "FK_datConversation_datAnnonce_IdAnnonce",
                        column: x => x.IdAnnonce,
                        principalTable: "datAnnonce",
                        principalColumn: "IdAnnonce",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datConversation_datCommande_IdCommande",
                        column: x => x.IdCommande,
                        principalTable: "datCommande",
                        principalColumn: "IdCommande",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datConversation_datEnchere_IdEnchere",
                        column: x => x.IdEnchere,
                        principalTable: "datEnchere",
                        principalColumn: "IdEnchere",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datConversation_datPersonne_IdPersonneAcheteur",
                        column: x => x.IdPersonneAcheteur,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datConversation_datPersonne_IdPersonneVendeur",
                        column: x => x.IdPersonneVendeur,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datEnchereCarte",
                columns: table => new
                {
                    IdEnchereCarte = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdEnchere = table.Column<int>(type: "integer", nullable: false),
                    EncEtat = table.Column<string>(type: "text", nullable: true),
                    EncFlgEdition1 = table.Column<bool>(type: "boolean", nullable: false),
                    EncFlgHolo = table.Column<bool>(type: "boolean", nullable: false),
                    EncFlgReverse = table.Column<bool>(type: "boolean", nullable: false),
                    EncFlgStamp = table.Column<bool>(type: "boolean", nullable: false),
                    EncFlgPokeball = table.Column<bool>(type: "boolean", nullable: false),
                    EncFlgMisscut = table.Column<bool>(type: "boolean", nullable: false),
                    EncFlgMissprint = table.Column<bool>(type: "boolean", nullable: false),
                    EncFlgGrade = table.Column<bool>(type: "boolean", nullable: false),
                    IdSocieteGradation = table.Column<int>(type: "integer", nullable: true),
                    EncNoteGradation = table.Column<decimal>(type: "numeric(4,2)", precision: 4, scale: 2, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datEnchereCarte", x => x.IdEnchereCarte);
                    table.ForeignKey(
                        name: "FK_datEnchereCarte_datEnchere_IdEnchere",
                        column: x => x.IdEnchere,
                        principalTable: "datEnchere",
                        principalColumn: "IdEnchere",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_datEnchereCarte_datSocieteGradation_IdSocieteGradation",
                        column: x => x.IdSocieteGradation,
                        principalTable: "datSocieteGradation",
                        principalColumn: "IdSocieteGradation",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datMiseEnchere",
                columns: table => new
                {
                    IdMiseEnchere = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdEnchere = table.Column<int>(type: "integer", nullable: false),
                    IdPersonne = table.Column<int>(type: "integer", nullable: false),
                    MisMontant = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    MisDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    MisFlgGagnante = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datMiseEnchere", x => x.IdMiseEnchere);
                    table.ForeignKey(
                        name: "FK_datMiseEnchere_datEnchere_IdEnchere",
                        column: x => x.IdEnchere,
                        principalTable: "datEnchere",
                        principalColumn: "IdEnchere",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_datMiseEnchere_datPersonne_IdPersonne",
                        column: x => x.IdPersonne,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datPhotoEnchere",
                columns: table => new
                {
                    IdPhotoEnchere = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdEnchere = table.Column<int>(type: "integer", nullable: false),
                    PheChemin = table.Column<string>(type: "text", nullable: false),
                    PheOrdre = table.Column<int>(type: "integer", nullable: true),
                    PheFlgPrincipale = table.Column<bool>(type: "boolean", nullable: false),
                    PheDateAjout = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datPhotoEnchere", x => x.IdPhotoEnchere);
                    table.ForeignKey(
                        name: "FK_datPhotoEnchere_datEnchere_IdEnchere",
                        column: x => x.IdEnchere,
                        principalTable: "datEnchere",
                        principalColumn: "IdEnchere",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "datOffrePrix",
                columns: table => new
                {
                    IdOffrePrix = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdAnnonce = table.Column<int>(type: "integer", nullable: false),
                    IdPersonneAcheteur = table.Column<int>(type: "integer", nullable: false),
                    IdPersonneVendeur = table.Column<int>(type: "integer", nullable: false),
                    OfrMontant = table.Column<decimal>(type: "numeric(12,2)", precision: 12, scale: 2, nullable: false),
                    OfrStatut = table.Column<string>(type: "text", nullable: false),
                    IdConversation = table.Column<int>(type: "integer", nullable: true),
                    OfrDateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    OfrDateAcceptation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OfrDateExpiration = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    OfrDateUtilisation = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datOffrePrix", x => x.IdOffrePrix);
                    table.ForeignKey(
                        name: "FK_datOffrePrix_datAnnonce_IdAnnonce",
                        column: x => x.IdAnnonce,
                        principalTable: "datAnnonce",
                        principalColumn: "IdAnnonce",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datOffrePrix_datConversation_IdConversation",
                        column: x => x.IdConversation,
                        principalTable: "datConversation",
                        principalColumn: "IdConversation",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_datOffrePrix_datPersonne_IdPersonneAcheteur",
                        column: x => x.IdPersonneAcheteur,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datOffrePrix_datPersonne_IdPersonneVendeur",
                        column: x => x.IdPersonneVendeur,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "datMessage",
                columns: table => new
                {
                    IdMessage = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    IdConversation = table.Column<int>(type: "integer", nullable: false),
                    IdPersonneExpediteur = table.Column<int>(type: "integer", nullable: false),
                    MsgType = table.Column<string>(type: "text", nullable: false),
                    MsgContenu = table.Column<string>(type: "text", nullable: true),
                    MsgImage = table.Column<string>(type: "text", nullable: true),
                    IdOffrePrix = table.Column<int>(type: "integer", nullable: true),
                    MsgDateCreation = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_datMessage", x => x.IdMessage);
                    table.ForeignKey(
                        name: "FK_datMessage_datConversation_IdConversation",
                        column: x => x.IdConversation,
                        principalTable: "datConversation",
                        principalColumn: "IdConversation",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_datMessage_datOffrePrix_IdOffrePrix",
                        column: x => x.IdOffrePrix,
                        principalTable: "datOffrePrix",
                        principalColumn: "IdOffrePrix",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_datMessage_datPersonne_IdPersonneExpediteur",
                        column: x => x.IdPersonneExpediteur,
                        principalTable: "datPersonne",
                        principalColumn: "IdPersonne",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_datAnnonce_AnnStatut",
                table: "datAnnonce",
                column: "AnnStatut");

            migrationBuilder.CreateIndex(
                name: "IX_datAnnonce_IdCarte",
                table: "datAnnonce",
                column: "IdCarte");

            migrationBuilder.CreateIndex(
                name: "IX_datAnnonce_IdItem",
                table: "datAnnonce",
                column: "IdItem");

            migrationBuilder.CreateIndex(
                name: "IX_datAnnonce_IdLangue",
                table: "datAnnonce",
                column: "IdLangue");

            migrationBuilder.CreateIndex(
                name: "IX_datAnnonce_IdPersonne",
                table: "datAnnonce",
                column: "IdPersonne");

            migrationBuilder.CreateIndex(
                name: "IX_datAnnonceCarte_IdAnnonce",
                table: "datAnnonceCarte",
                column: "IdAnnonce",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_datAnnonceCarte_IdSocieteGradation",
                table: "datAnnonceCarte",
                column: "IdSocieteGradation");

            migrationBuilder.CreateIndex(
                name: "IX_datBloc_IdJeu",
                table: "datBloc",
                column: "IdJeu");

            migrationBuilder.CreateIndex(
                name: "IX_datCarte_CrtNom",
                table: "datCarte",
                column: "CrtNom");

            migrationBuilder.CreateIndex(
                name: "IX_datCarte_IdSerie",
                table: "datCarte",
                column: "IdSerie");

            migrationBuilder.CreateIndex(
                name: "IX_datCollection_IdPersonne",
                table: "datCollection",
                column: "IdPersonne");

            migrationBuilder.CreateIndex(
                name: "IX_datCollectionCarte_IdCarte",
                table: "datCollectionCarte",
                column: "IdCarte");

            migrationBuilder.CreateIndex(
                name: "IX_datCollectionCarte_IdCollection",
                table: "datCollectionCarte",
                column: "IdCollection");

            migrationBuilder.CreateIndex(
                name: "IX_datCollectionCarte_IdLangue",
                table: "datCollectionCarte",
                column: "IdLangue");

            migrationBuilder.CreateIndex(
                name: "IX_datCollectionCarte_IdSocieteGradation",
                table: "datCollectionCarte",
                column: "IdSocieteGradation");

            migrationBuilder.CreateIndex(
                name: "IX_datCollectionItem_IdCollection",
                table: "datCollectionItem",
                column: "IdCollection");

            migrationBuilder.CreateIndex(
                name: "IX_datCollectionItem_IdItem",
                table: "datCollectionItem",
                column: "IdItem");

            migrationBuilder.CreateIndex(
                name: "IX_datCollectionItem_IdLangue",
                table: "datCollectionItem",
                column: "IdLangue");

            migrationBuilder.CreateIndex(
                name: "IX_datCommande_IdAcheteur",
                table: "datCommande",
                column: "IdAcheteur");

            migrationBuilder.CreateIndex(
                name: "IX_datCommande_IdStatutCommande",
                table: "datCommande",
                column: "IdStatutCommande");

            migrationBuilder.CreateIndex(
                name: "IX_datCommande_IdVendeur",
                table: "datCommande",
                column: "IdVendeur");

            migrationBuilder.CreateIndex(
                name: "IX_datCommandeLigne_IdAnnonce",
                table: "datCommandeLigne",
                column: "IdAnnonce");

            migrationBuilder.CreateIndex(
                name: "IX_datCommandeLigne_IdCommande",
                table: "datCommandeLigne",
                column: "IdCommande");

            migrationBuilder.CreateIndex(
                name: "IX_datConversation_IdAnnonce",
                table: "datConversation",
                column: "IdAnnonce");

            migrationBuilder.CreateIndex(
                name: "IX_datConversation_IdCommande",
                table: "datConversation",
                column: "IdCommande");

            migrationBuilder.CreateIndex(
                name: "IX_datConversation_IdEnchere",
                table: "datConversation",
                column: "IdEnchere");

            migrationBuilder.CreateIndex(
                name: "IX_datConversation_IdPersonneAcheteur",
                table: "datConversation",
                column: "IdPersonneAcheteur");

            migrationBuilder.CreateIndex(
                name: "IX_datConversation_IdPersonneVendeur",
                table: "datConversation",
                column: "IdPersonneVendeur");

            migrationBuilder.CreateIndex(
                name: "IX_datEnchere_EncDateFin",
                table: "datEnchere",
                column: "EncDateFin");

            migrationBuilder.CreateIndex(
                name: "IX_datEnchere_EncStatut",
                table: "datEnchere",
                column: "EncStatut");

            migrationBuilder.CreateIndex(
                name: "IX_datEnchere_IdCarte",
                table: "datEnchere",
                column: "IdCarte");

            migrationBuilder.CreateIndex(
                name: "IX_datEnchere_IdItem",
                table: "datEnchere",
                column: "IdItem");

            migrationBuilder.CreateIndex(
                name: "IX_datEnchere_IdLangue",
                table: "datEnchere",
                column: "IdLangue");

            migrationBuilder.CreateIndex(
                name: "IX_datEnchere_IdPersonne",
                table: "datEnchere",
                column: "IdPersonne");

            migrationBuilder.CreateIndex(
                name: "IX_datEnchere_IdPersonneGagnant",
                table: "datEnchere",
                column: "IdPersonneGagnant");

            migrationBuilder.CreateIndex(
                name: "IX_datEnchereCarte_IdEnchere",
                table: "datEnchereCarte",
                column: "IdEnchere",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_datEnchereCarte_IdSocieteGradation",
                table: "datEnchereCarte",
                column: "IdSocieteGradation");

            migrationBuilder.CreateIndex(
                name: "IX_datEvaluation_IdCommande_IdPersonneAuteur",
                table: "datEvaluation",
                columns: new[] { "IdCommande", "IdPersonneAuteur" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_datEvaluation_IdPersonneAuteur",
                table: "datEvaluation",
                column: "IdPersonneAuteur");

            migrationBuilder.CreateIndex(
                name: "IX_datEvaluation_IdPersonneEvaluee",
                table: "datEvaluation",
                column: "IdPersonneEvaluee");

            migrationBuilder.CreateIndex(
                name: "IX_datExpedition_IdCommande",
                table: "datExpedition",
                column: "IdCommande",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_datItem_IdSerie",
                table: "datItem",
                column: "IdSerie");

            migrationBuilder.CreateIndex(
                name: "IX_datItem_IdTypeItem",
                table: "datItem",
                column: "IdTypeItem");

            migrationBuilder.CreateIndex(
                name: "IX_datMessage_IdConversation",
                table: "datMessage",
                column: "IdConversation");

            migrationBuilder.CreateIndex(
                name: "IX_datMessage_IdOffrePrix",
                table: "datMessage",
                column: "IdOffrePrix");

            migrationBuilder.CreateIndex(
                name: "IX_datMessage_IdPersonneExpediteur",
                table: "datMessage",
                column: "IdPersonneExpediteur");

            migrationBuilder.CreateIndex(
                name: "IX_datMiseEnchere_IdEnchere",
                table: "datMiseEnchere",
                column: "IdEnchere");

            migrationBuilder.CreateIndex(
                name: "IX_datMiseEnchere_IdPersonne",
                table: "datMiseEnchere",
                column: "IdPersonne");

            migrationBuilder.CreateIndex(
                name: "IX_datOffrePrix_IdAnnonce",
                table: "datOffrePrix",
                column: "IdAnnonce");

            migrationBuilder.CreateIndex(
                name: "IX_datOffrePrix_IdConversation",
                table: "datOffrePrix",
                column: "IdConversation");

            migrationBuilder.CreateIndex(
                name: "IX_datOffrePrix_IdPersonneAcheteur",
                table: "datOffrePrix",
                column: "IdPersonneAcheteur");

            migrationBuilder.CreateIndex(
                name: "IX_datOffrePrix_IdPersonneVendeur",
                table: "datOffrePrix",
                column: "IdPersonneVendeur");

            migrationBuilder.CreateIndex(
                name: "IX_datOffrePrix_OfrStatut",
                table: "datOffrePrix",
                column: "OfrStatut");

            migrationBuilder.CreateIndex(
                name: "IX_datPanier_IdPersonne",
                table: "datPanier",
                column: "IdPersonne");

            migrationBuilder.CreateIndex(
                name: "IX_datPanierLigne_IdAnnonce",
                table: "datPanierLigne",
                column: "IdAnnonce");

            migrationBuilder.CreateIndex(
                name: "IX_datPanierLigne_IdPanier",
                table: "datPanierLigne",
                column: "IdPanier");

            migrationBuilder.CreateIndex(
                name: "IX_datPersonne_PrsEmail",
                table: "datPersonne",
                column: "PrsEmail",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_datPersonne_PrsPseudo",
                table: "datPersonne",
                column: "PrsPseudo",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_datPhotoAnnonce_IdAnnonce",
                table: "datPhotoAnnonce",
                column: "IdAnnonce");

            migrationBuilder.CreateIndex(
                name: "IX_datPhotoEnchere_IdEnchere",
                table: "datPhotoEnchere",
                column: "IdEnchere");

            migrationBuilder.CreateIndex(
                name: "IX_datSerie_IdBloc",
                table: "datSerie",
                column: "IdBloc");

            migrationBuilder.CreateIndex(
                name: "IX_datStatutCommande_StcCode",
                table: "datStatutCommande",
                column: "StcCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_datVueRecente_IdCarte",
                table: "datVueRecente",
                column: "IdCarte");

            migrationBuilder.CreateIndex(
                name: "IX_datVueRecente_IdItem",
                table: "datVueRecente",
                column: "IdItem");

            migrationBuilder.CreateIndex(
                name: "IX_datVueRecente_IdPersonne",
                table: "datVueRecente",
                column: "IdPersonne");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "datAnnonceCarte");

            migrationBuilder.DropTable(
                name: "datCollectionCarte");

            migrationBuilder.DropTable(
                name: "datCollectionItem");

            migrationBuilder.DropTable(
                name: "datCommandeLigne");

            migrationBuilder.DropTable(
                name: "datEnchereCarte");

            migrationBuilder.DropTable(
                name: "datEvaluation");

            migrationBuilder.DropTable(
                name: "datExpedition");

            migrationBuilder.DropTable(
                name: "datMessage");

            migrationBuilder.DropTable(
                name: "datMiseEnchere");

            migrationBuilder.DropTable(
                name: "datPanierLigne");

            migrationBuilder.DropTable(
                name: "datPhotoAnnonce");

            migrationBuilder.DropTable(
                name: "datPhotoEnchere");

            migrationBuilder.DropTable(
                name: "datVueRecente");

            migrationBuilder.DropTable(
                name: "datCollection");

            migrationBuilder.DropTable(
                name: "datSocieteGradation");

            migrationBuilder.DropTable(
                name: "datOffrePrix");

            migrationBuilder.DropTable(
                name: "datPanier");

            migrationBuilder.DropTable(
                name: "datConversation");

            migrationBuilder.DropTable(
                name: "datAnnonce");

            migrationBuilder.DropTable(
                name: "datCommande");

            migrationBuilder.DropTable(
                name: "datEnchere");

            migrationBuilder.DropTable(
                name: "datStatutCommande");

            migrationBuilder.DropTable(
                name: "datCarte");

            migrationBuilder.DropTable(
                name: "datItem");

            migrationBuilder.DropTable(
                name: "datLangue");

            migrationBuilder.DropTable(
                name: "datPersonne");

            migrationBuilder.DropTable(
                name: "datSerie");

            migrationBuilder.DropTable(
                name: "datTypeItem");

            migrationBuilder.DropTable(
                name: "datBloc");

            migrationBuilder.DropTable(
                name: "datJeu");
        }
    }
}
