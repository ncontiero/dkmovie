# ruff: noqa: E501

from datetime import date

from dkmovie.titles.models import Genre
from dkmovie.titles.models import Title

genres_to_create = [
    {"name": "Action", "name_pt_br": "Ação"},
    {"name": "Adventure", "name_pt_br": "Aventura"},
    {"name": "Animation", "name_pt_br": "Animação"},
    {"name": "Comedy", "name_pt_br": "Comédia"},
    {"name": "Crime"},
    {"name": "Drama"},
    {"name": "Fantasy", "name_pt_br": "Fantasia"},
    {"name": "Horror"},
    {"name": "Mystery", "name_pt_br": "Mistério"},
    {"name": "Romance", "name_pt_br": "Romance"},
    {"name": "Sci-Fi", "name_pt_br": "Ficção Científica"},
    {"name": "Thriller", "name_pt_br": "Suspense"},
    {"name": "War", "name_pt_br": "Guerra"},
]

titles_to_create = [
    {
        "title": "Predator: Badlands",
        "title_pt_br": "Predador: Terras Selvagens",
        "description": "A young Predator outcast from his clan finds an unlikely ally on his journey in search of the ultimate adversary.",
        "description_pt_br": "Um jovem predador marginalizado de seu clã encontra um aliado improvável em sua jornada em busca do melhor adversário.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 11, 5),
        "duration": 207,
        "poster": "./posters/predator_badlands.jpg",
        "cover": "./covers/predator_badlands.webp",
        "trailer_url": "https://www.youtube.com/watch?v=43R9l7EkJwE",
        "genres": ["Action", "Adventure", "Sci-Fi", "Thriller"],
        "rating": 7.6,
        "cast": "Elle Fanning, Dimitrius Schuster-Koloamatangi, Ravi Narayan",
    },
    {
        "title": "Frankenstein",
        "description": "Dr. Victor Frankenstein, a brilliant but egotistical scientist, brings a creature to life in a monstrous experiment that ultimately leads to the undoing of both the creator and his tragic creation.",
        "description_pt_br": "Um cientista brilhante, mas egocêntrico, dá vida a uma criatura em um experimento monstruoso que acaba levando à destruição do criador e de sua trágica criação.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 10, 13),
        "duration": 149,
        "poster": "./posters/frankenstein.jpg",
        "cover": "./covers/frankenstein.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=8aulMPhE12g",
        "genres": ["Drama", "Fantasy", "Horror"],
        "rating": 7.6,
        "cast": "Oscar Isaac, Jacob Elordi, Christoph Waltz",
    },
    {
        "title": "Black Phone 2",
        "title_pt_br": "Telefone Preto 2",
        "description": "As Finn, now 17, struggles with life after his captivity, his sister begins receiving calls in her dreams from the black phone and seeing disturbing visions of three boys being stalked at a winter camp known as Alpine Lake.",
        "description_pt_br": "Enquanto Finn, de 17 anos, lida com a vida após seu cativeiro, sua irmã recebe ligações em seus sonhos do telefone preto e tem visões perturbadoras de três meninos perseguidos no acampamento de Alpine Lake.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 9, 20),
        "duration": 114,
        "poster": "./posters/black_phone_2.jpg",
        "cover": "./covers/black_phone_2.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=v0kqkRZHqk4",
        "genres": ["Horror", "Mystery", "Thriller"],
        "rating": 6.2,
        "cast": "Ethan Hawke, Mason Thames, Madeleine McGraw",
    },
    {
        "title": "A House of Dynamite",
        "title_pt_br": "Casa de Dinamite",
        "description": "When a single, unattributed missile is launched at the United States, a race begins to determine who is responsible and how to respond.",
        "description_pt_br": "Centrado nos funcionários da Casa Branca que lidam com um ataque iminente de mísseis contra os Estados Unidos, esse drama emocionante se desenrola em tempo real à medida que as tensões aumentam.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 9, 2),
        "duration": 112,
        "poster": "./posters/a_house_of_dynamite.jpg",
        "cover": "./covers/a_house_of_dynamite.webp",
        "trailer_url": "https://www.youtube.com/watch?v=_wpw2QHJNco",
        "genres": ["Drama", "Thriller"],
        "rating": 6.4,
        "cast": "Idris Elba, Rebecca Ferguson, Gabriel Basso",
    },
    {
        "title": "The Fantastic Four: First Steps",
        "title_pt_br": "Quarteto Fantástico: Primeiros Passos",
        "description": "Forced to balance their roles as heroes with the strength of their family bond, the Fantastic Four must defend Earth from a ravenous space god called Galactus and his enigmatic herald, the Silver Surfer.",
        "description_pt_br": "Forçados a equilibrar seus papéis como heróis e a força dos laços familiares, o Quarteto Fantástico deve defender a Terra de um deus espacial voraz chamado Galactus e sua enigmática arauta, a Surfista Prateada.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 7, 22),
        "duration": 115,
        "poster": "./posters/the_fantastic_four_first_steps.jpg",
        "cover": "./covers/the_fantastic_four_first_steps.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=pAsmrKyMqaA",
        "genres": ["Action", "Adventure", "Sci-Fi"],
        "rating": 6.9,
        "cast": "Pedro Pascal, Vanessa Kirby, Ebon Moss-Bachrach",
    },
    {
        "title": "The Amateur",
        "title_pt_br": "Operação Vingança",
        "description": "When his supervisors at the CIA refuse to take action after his wife is killed in a London terrorist attack, a decoder takes matters into his own hands.",
        "description_pt_br": "Quando seus supervisores na CIA se recusam a tomar providências depois que sua esposa é assassinada em um ataque terrorista em Londres, um decodificador decide resolver o problema com as próprias mãos.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 4, 5),
        "duration": 122,
        "poster": "./posters/the_amateur.jpg",
        "cover": "./covers/the_amateur.webp",
        "trailer_url": "https://www.youtube.com/watch?v=DCWcK4c-F8Q",
        "genres": ["Action", "Thriller"],
        "rating": 6.5,
        "cast": "Rami Malek, Rachel Brosnahan, Jon Bernthal",
    },
    {
        "title": "The Accountant 2",
        "title_pt_br": "O Contador 2",
        "description": "Christian Wolff applies his brilliant mind and illegal methods to reconstruct the unsolved puzzle of a Treasury chief's murder.",
        "description_pt_br": "Christian Wolff aplica sua mente brilhante e métodos não tão legais para montar o quebra-cabeça não resolvido do assassinato de um chefe do tesouro.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 3, 8),
        "duration": 132,
        "poster": "./posters/the_accountant_2.jpg",
        "cover": "./covers/the_accountant_2.webp",
        "trailer_url": "https://www.youtube.com/watch?v=3wRCOqyDI6E",
        "genres": ["Action", "Crime", "Drama", "Mystery", "Thriller"],
        "rating": 6.6,
        "cast": "Ben Affleck, Jon Bernthal, Cynthia Addai-Robinson",
    },
    {
        "title": "The Witcher",
        "description": "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
        "description_pt_br": "Geralt de Rivia, um caçador de monstros, luta contra um mundo onde as vezes as pessoas são mais temidas do que as bestas.",
        "content_type": Title.ContentType.SERIES,
        "release_date": date(2019, 12, 20),
        "duration": None,
        "poster": "./posters/the_witcher.jpg",
        "cover": "./covers/the_witcher.webp",
        "trailer_url": "https://www.youtube.com/watch?v=ndl1W4ltcmg",
        "genres": ["Action", "Adventure", "Fantasy", "Drama"],
        "rating": 7.9,
        "cast": "Henry Cavill, Freya Allan, Anya Chalotra, Eamon Farren",
    },
    {
        "title": "Polar",
        "description": "A retiring assassin suddenly finds himself on the receiving end of a hit, contracted by none other than his own employer seeking to cash in on the pensions of aging employees.",
        "description_pt_br": "O principal assassino do mundo, Duncan Vizla, está se aposentando quando seu ex-empregador o classifica como um passivo para a empresa. Contra sua vontade, ele se encontra novamente no jogo enfrentando um exército de assassinos mais jovens.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2019, 1, 24),
        "duration": 118,
        "poster": "./posters/polar.jpg",
        "cover": "./covers/polar.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=oMHwRal-AR8",
        "genres": ["Action", "Crime", "Thriller"],
        "rating": 6.3,
        "cast": "Mads Mikkelsen, Vanessa Hudgens, Katheryn Winnick",
    },
    {
        "title": "Dexter: Resurrection",
        "title_pt_br": "Dexter: Ressurreição",
        "description": "Dexter Morgan awakens from a coma and sets out for New York City, determined to find Harrison and make things right. But when Miami Metro's Angel Batista arrives with questions, Dexter realizes his past is catching up to him fast.",
        "description_pt_br": "Depois de ser baleado por seu filho Harrison, Dexter acorda do coma e descobre que ele está desaparecido. Ele o procura em Nova York para se reconciliar, mas Batista chega com perguntas do passado.",
        "content_type": Title.ContentType.SERIES,
        "release_date": date(2025, 7, 11),
        "duration": None,
        "poster": "./posters/dexter_resurrection.jpg",
        "cover": "./covers/dexter_resurrection.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=84o1Q6fB20k",
        "genres": ["Crime", "Drama", "Thriller"],
        "rating": 9.1,
        "cast": "Michael C. Hall, Uma Thurman, Jack Alcott",
    },
    {
        "title": "Better Call Saul",
        "description": "The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White and Jesse Pinkman.",
        "description_pt_br": "Os julgamentos e atribulações do advogado criminal, Jimmy McGill, e o estabelecimento de seu escritório de advocacia em Albuquerque, Novo México.",
        "content_type": Title.ContentType.SERIES,
        "release_date": date(2015, 2, 8),
        "duration": None,
        "poster": "./posters/better_call_saul.jpg",
        "cover": "./covers/better_call_saul.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=HN4oydykJFc",
        "genres": ["Crime", "Drama"],
        "rating": 9.0,
        "cast": "Bob Odenkirk, Jonathan Banks, Rhea Seehorn",
    },
    {
        "title": "Game of Thrones",
        "description": "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
        "description_pt_br": "Nove famílias nobres lutam pelo controle sobre as terras míticas de Westeros, enquanto um antigo inimigo retorna depois de estar adormecido por milhares de anos.",
        "content_type": Title.ContentType.SERIES,
        "release_date": date(2011, 4, 16),
        "duration": None,
        "poster": "./posters/game_of_thrones.jpg",
        "cover": "./covers/game_of_thrones.webp",
        "trailer_url": "https://www.youtube.com/watch?v=KPLWWIOCOOQ",
        "genres": ["Action", "Adventure", "Fantasy"],
        "rating": 9.2,
        "cast": "Peter Dinklage, Lena Headey, Kit Harington",
    },
    {
        "title": "Breaking Bad",
        "description": "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student to secure his family's future.",
        "description_pt_br": "Um professor de química diagnosticado com câncer de pulmão se transforma em fabricante e vendedor de metanfetamina, a fim de garantir o futuro da sua família.",
        "content_type": Title.ContentType.SERIES,
        "release_date": date(2008, 1, 20),
        "duration": None,
        "poster": "./posters/breaking_bad.jpg",
        "cover": "./covers/breaking_bad.webp",
        "trailer_url": "https://www.youtube.com/watch?v=HhesaQXLuRY",
        "genres": ["Crime", "Drama", "Thriller"],
        "rating": 9.5,
        "cast": "Bryan Cranston, Anna Gunn, Aaron Paul",
    },
]


def run():
    for genre_data in genres_to_create:
        genre, _ = Genre.objects.populate(True).get_or_create(  # noqa: FBT003
            name=genre_data["name"],
            defaults={"name": genre_data["name"]},
        )

        if name_pt_br := genre_data.get("name_pt_br"):
            genre.name_pt_br = name_pt_br
            genre.save()

    for title_data in titles_to_create:
        title, _ = Title.objects.populate(True).get_or_create(  # noqa: FBT003
            title=title_data["title"],
            defaults={
                "title": title_data["title"],
                "description": title_data["description"],
                "description_pt_br": title_data["description_pt_br"],
                "content_type": title_data["content_type"],
                "release_date": title_data["release_date"],
                "duration": title_data["duration"],
                "poster": title_data["poster"],
                "cover": title_data["cover"],
                "trailer_url": title_data["trailer_url"],
                "rating": title_data["rating"],
                "cast": title_data["cast"],
            },
        )

        if title_pt_br := title_data.get("title_pt_br"):
            title.title_pt_br = title_pt_br
            title.save()

        if title_data["genres"]:
            for genre_name in title_data["genres"]:
                genre = Genre.objects.get(name=genre_name)
                title.genres.add(genre)
            title.save()
