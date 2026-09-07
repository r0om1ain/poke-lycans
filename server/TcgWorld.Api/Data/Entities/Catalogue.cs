namespace TcgWorld.Api.Data.Entities;

// datJeu > datBloc > datSerie > (datCarte | datItem via datTypeItem)

public class Jeu
{
    public int IdJeu { get; set; }
    public string JeuNom { get; set; } = "";

    public List<Bloc> Blocs { get; set; } = [];
}

public class Bloc
{
    public int IdBloc { get; set; }
    public int IdJeu { get; set; }
    public Jeu Jeu { get; set; } = null!;
    public string BlcNom { get; set; } = "";
    public DateOnly? BlcDateSortie { get; set; }

    public List<Serie> Series { get; set; } = [];
}

public class Serie
{
    public int IdSerie { get; set; }
    public int IdBloc { get; set; }
    public Bloc Bloc { get; set; } = null!;
    public string SerNom { get; set; } = "";
    public string? SerCode { get; set; }
    public DateOnly? SerDateSortie { get; set; }

    public List<Carte> Cartes { get; set; } = [];
    public List<Item> Items { get; set; } = [];
}

// Ne s'applique qu'aux datItem — les cartes n'ont pas de "catégorie", elles sont
// toujours des cartes (rareté directement sur CrtRarete).
public class TypeItem
{
    public int IdTypeItem { get; set; }
    public string TypNom { get; set; } = "";
    public string? TypCode { get; set; }
    public bool TypFlgArchive { get; set; }

    public List<Item> Items { get; set; } = [];
}

// Produit scellé (ETB, Display, Booster...)
public class Item
{
    public int IdItem { get; set; }
    public int IdSerie { get; set; }
    public Serie Serie { get; set; } = null!;
    public int IdTypeItem { get; set; }
    public TypeItem TypeItem { get; set; } = null!;
    public string ItmNom { get; set; } = "";
    public string? ItmNumero { get; set; }
    public DateOnly? ItmDateSortie { get; set; }
    public string? ItmImage { get; set; }
    public bool ItmFlgArchive { get; set; }
}

public class Carte
{
    public int IdCarte { get; set; }
    public int IdSerie { get; set; }
    public Serie Serie { get; set; } = null!;
    public string CrtNom { get; set; } = "";
    public string? CrtNumero { get; set; }
    public string? CrtCode { get; set; }
    public string? CrtNumeroSerie { get; set; }
    public string? CrtRarete { get; set; }
    public string? CrtImage { get; set; }
    public DateOnly? CrtDateSortie { get; set; }
    public bool CrtFlgArchive { get; set; }
}
