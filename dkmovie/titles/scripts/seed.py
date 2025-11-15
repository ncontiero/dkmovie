# ruff: noqa: E501

from datetime import date

from dkmovie.titles.models import Genre
from dkmovie.titles.models import Title

genres_to_create = [
    "Action",
    "Adventure",
    "Animation",
    "Biography",
    "Comedy",
    "Crime",
    "Documentary",
    "Drama",
    "Family",
    "Fantasy",
    "Film-Noir",
    "Game-Show",
    "History",
    "Horror",
    "Music",
    "Musical",
    "Mystery",
    "News",
    "Reality-TV",
    "Romance",
    "Sci-Fi",
    "Short",
    "Sport",
    "Talk-Show",
    "Thriller",
    "War",
    "Western",
]

titles_to_create = [
    {
        "title": "Polar",
        "description": "A retiring assassin suddenly finds himself on the receiving end of a hit, contracted by none other than his own employer seeking to cash in on the pensions of aging employees.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2019, 1, 24),
        "genres": [],
        "poster": "./posters/polar.jpg",
        "cover": "./covers/polar.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=oMHwRal-AR8",
    },
    {
        "title": "The Accountant 2",
        "description": "Christian Wolff applies his brilliant mind and illegal methods to reconstruct the unsolved puzzle of a Treasury chief's murder.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 3, 8),
        "genres": [],
        "poster": "./posters/the_accountant_2.jpg",
        "cover": "./covers/the_accountant_2.webp",
        "trailer_url": "https://www.youtube.com/watch?v=3wRCOqyDI6E",
    },
    {
        "title": "The Accountant 2",
        "description": "Christian Wolff applies his brilliant mind and illegal methods to reconstruct the unsolved puzzle of a Treasury chief's murder.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 3, 8),
        "genres": [],
        "poster": "./posters/the_accountant_2.jpg",
        "cover": "./covers/the_accountant_2.webp",
        "trailer_url": "https://www.youtube.com/watch?v=3wRCOqyDI6E",
    },
    {
        "title": "The Amateur",
        "description": "When his supervisors at the CIA refuse to take action after his wife is killed in a London terrorist attack, a decoder takes matters into his own hands.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 4, 5),
        "genres": [],
        "poster": "./posters/the_amateur.jpg",
        "cover": "./covers/the_amateur.webp",
        "trailer_url": "https://www.youtube.com/watch?v=DCWcK4c-F8Q",
    },
    {
        "title": "Frankenstein",
        "description": "Dr. Victor Frankenstein, a brilliant but egotistical scientist, brings a creature to life in a monstrous experiment that ultimately leads to the undoing of both the creator and his tragic creation.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 10, 13),
        "genres": [],
        "poster": "./posters/frankenstein.jpg",
        "cover": "./covers/frankenstein.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=8aulMPhE12g",
    },
    {
        "title": "Predator: Badlands",
        "description": "A young Predator outcast from his clan finds an unlikely ally on his journey in search of the ultimate adversary.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 11, 5),
        "genres": [],
        "poster": "./posters/predator_badlands.jpg",
        "cover": "./covers/predator_badlands.webp",
        "trailer_url": "https://www.youtube.com/watch?v=43R9l7EkJwE",
    },
    {
        "title": "A House of Dynamite",
        "description": "When a single, unattributed missile is launched at the United States, a race begins to determine who is responsible and how to respond.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 9, 2),
        "genres": [],
        "poster": "./posters/a_house_of_dynamite.jpg",
        "cover": "./covers/a_house_of_dynamite.webp",
        "trailer_url": "https://www.youtube.com/watch?v=_wpw2QHJNco",
    },
    {
        "title": "The Fantastic Four: First Steps",
        "description": "Forced to balance their roles as heroes with the strength of their family bond, the Fantastic Four must defend Earth from a ravenous space god called Galactus and his enigmatic herald, the Silver Surfer.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 7, 22),
        "genres": [],
        "poster": "./posters/the_fantastic_four_first_steps.jpg",
        "cover": "./covers/the_fantastic_four_first_steps.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=pAsmrKyMqaA",
    },
    {
        "title": "Black Phone 2",
        "description": "As Finn, now 17, struggles with life after his captivity, his sister begins receiving calls in her dreams from the black phone and seeing disturbing visions of three boys being stalked at a winter camp known as Alpine Lake.",
        "content_type": Title.ContentType.MOVIE,
        "release_date": date(2025, 9, 20),
        "genres": [],
        "poster": "./posters/black_phone_2.jpg",
        "cover": "./covers/black_phone_2.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=v0kqkRZHqk4",
    },
    {
        "title": "The Witcher",
        "description": "Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.",
        "content_type": Title.ContentType.SERIES,
        "release_date": date(2019, 12, 20),
        "genres": [],
        "poster": "./posters/the_witcher.jpg",
        "cover": "./covers/the_witcher.webp",
        "trailer_url": "https://www.youtube.com/watch?v=ndl1W4ltcmg",
    },
    {
        "title": "Breaking Bad",
        "description": "A chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student to secure his family's future.",
        "content_type": Title.ContentType.SERIES,
        "release_date": date(2008, 1, 20),
        "genres": [],
        "poster": "./posters/breaking_bad.jpg",
        "cover": "./covers/breaking_bad.webp",
        "trailer_url": "https://www.youtube.com/watch?v=HhesaQXLuRY",
    },
    {
        "title": "Game of Thrones",
        "description": "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.",
        "content_type": Title.ContentType.SERIES,
        "release_date": date(2011, 4, 16),
        "genres": [],
        "poster": "./posters/game_of_thrones.jpg",
        "cover": "./covers/game_of_thrones.webp",
        "trailer_url": "https://www.youtube.com/watch?v=KPLWWIOCOOQ",
    },
    {
        "title": "Better Call Saul",
        "description": "The trials and tribulations of criminal lawyer Jimmy McGill in the years leading up to his fateful run-in with Walter White and Jesse Pinkman.",
        "content_type": Title.ContentType.SERIES,
        "release_date": date(2015, 2, 8),
        "genres": [],
        "poster": "./posters/better_call_saul.jpg",
        "cover": "./covers/better_call_saul.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=HN4oydykJFc",
    },
    {
        "title": "Dexter: Resurrection",
        "description": "Dexter Morgan awakens from a coma and sets out for New York City, determined to find Harrison and make things right. But when Miami Metro's Angel Batista arrives with questions, Dexter realizes his past is catching up to him fast.",
        "content_type": Title.ContentType.SERIES,
        "release_date": date(2015, 7, 11),
        "genres": [],
        "poster": "./posters/dexter_resurrection.jpg",
        "cover": "./covers/dexter_resurrection.jpg",
        "trailer_url": "https://www.youtube.com/watch?v=84o1Q6fB20k",
    },
]


def run():
    for genre in genres_to_create:
        Genre.objects.get_or_create(name=genre)

    for title_data in titles_to_create:
        title, _ = Title.objects.get_or_create(
            title=title_data["title"],
            defaults={
                "title": title_data["title"],
                "description": title_data["description"],
                "content_type": title_data["content_type"],
                "release_date": title_data["release_date"],
                "trailer_url": title_data["trailer_url"],
                "poster": title_data["poster"],
                "cover": title_data["cover"],
            },
        )

        if title_data["genres"]:
            title.genres.set(title_data["genres"])
            title.save()
