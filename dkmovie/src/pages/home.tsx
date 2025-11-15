import type { Movie } from "@/utils/types";
import { ContentCarousel } from "@/components/content-carousel";
import { type HeroContent, HeroSection } from "@/components/hero-section";
import { Meta } from "@/components/meta";

const mockHeroContent: HeroContent[] = [
  {
    id: 25,
    title: "Polar",
    description: `The world's top assassin, Duncan Vizla, also known as "The Black Kaiser" (Mads Mikkelsen), is on the verge of retirement. He is just a couple of weeks away from his 50th birthday, which means he is entitled to a lucrative $8 million pension from his employer, an elite assassination organization.`,
    imageUrl: "https://i3.ytimg.com/vi/MBOmPEWxOE4/maxresdefault.jpg",
    type: "movie",
  },
  {
    id: 30,
    title: "The Accountant 2",
    description: `Christian Wolff applies his brilliant mind and illegal methods to reconstruct the unsolved puzzle of a Treasury chief's murder.`,
    imageUrl:
      "https://images-na.ssl-images-amazon.com/images/S/pv-target-images/6f9297a0e0325abbab2384f140597954e79acdcd1dcc3965ed51491457f0235e._SX1920_FMwebp_.jpg",
    type: "movie",
  },
  {
    id: 35,
    title: "The Amateur",
    description: `When his supervisors at the CIA refuse to take action after his wife is killed in a London terrorist attack, a decoder takes matters into his own hands.`,
    imageUrl:
      "https://img1.hulu.com/user/v3/artwork/dc47b8db-272f-42cb-81ec-8d43da4de010?base_image_bucket_name=image_manager&base_image=d202bf5f-debd-4f10-8da1-2c36a0cfb4e7&size=1200x630&format=webp",
    type: "movie",
  },
];

const mockTrending: Movie[] = [
  {
    id: 1,
    title: "Frankenstein",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BMTE0NGY2YWMtYzJkYS00MzEwLTllYWQtM2Q3NTNiOWFlZWEyXkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg",
    type: "movie",
  },
  {
    id: 2,
    title: "Predator: Badlands",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNTdjZGUxMTItNjRkNS00N2VhLWE4MjMtMjVhODMwMGIxNjUwXkEyXkFqcGc@._V1_QL75_UX280_CR0,0,280,414_.jpg",
    type: "movie",
  },
  {
    id: 3,
    title: "Michael",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BMDNkNzg3YzMtYWU2ZC00MTdjLTgzOTAtYzI1ZDYzZmQzY2E2XkEyXkFqcGc@._V1_FMjpg_UX1079_.jpg",
    type: "movie",
  },
  {
    id: 4,
    title: "A House of Dynamite",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNjAzMjQ4YTUtOGI1Yy00YTFkLTlkMDQtMDEwOWNjYmE3MTU1XkEyXkFqcGc@._V1_FMjpg_UX1050_.jpg",
    type: "movie",
  },
  {
    id: 5,
    title: "The Fantastic Four: First Steps",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BOGM5MzA3MDAtYmEwMi00ZDNiLTg4MDgtMTZjOTc0ZGMyNTIwXkEyXkFqcGc@._V1_FMjpg_UX1086_.jpg",
    type: "movie",
  },
  {
    id: 6,
    title: "Bugonia",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BZjVkM2JkYTItMzc2My00ZDA3LWI4ZDEtOGNiM2M2YmNlNDA2XkEyXkFqcGc@._V1_FMjpg_UY2560_.jpg",
    type: "movie",
  },
];

const mockPopularSeries: Movie[] = [
  {
    id: 100,
    title: "The Witcher",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BOTQzMzNmMzUtODgwNS00YTdhLTg5N2MtOWU1YTc4YWY3NjRlXkEyXkFqcGc@._V1_FMjpg_UX1200_.jpg",
    type: "serie",
  },
  {
    id: 200,
    title: "IT: Welcome to Derry",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BZWE0ZWM1MjUtNmYzYS00NzU3LTkxYmQtNmI3NTc0ZTY1NmVlXkEyXkFqcGc@._V1_FMjpg_UY2048_.jpg",
    type: "serie",
  },
  {
    id: 300,
    title: "Stranger Things",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BNjRiMTA4NWUtNmE0ZC00NGM0LWJhMDUtZWIzMDM5ZDIzNTg3XkEyXkFqcGc@._V1_FMjpg_UX1080_.jpg",
    type: "serie",
  },
  {
    id: 400,
    title: "Death by Lightning",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BZGM3ZGYzMTUtNGJjMS00Y2FkLWEwOTktNThlZDVhNTgyMDVkXkEyXkFqcGc@._V1_FMjpg_UY2400_.jpg",
    type: "serie",
  },
  {
    id: 500,
    title: "Game of Thrones",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BMTNhMDJmNmYtNDQ5OS00ODdlLWE0ZDAtZTgyYTIwNDY3OTU3XkEyXkFqcGc@._V1_FMjpg_UX550_.jpg",
    type: "serie",
  },
  {
    id: 600,
    title: "Breaking Bad",
    posterUrl:
      "https://m.media-amazon.com/images/M/MV5BMzU5ZGYzNmQtMTdhYy00OGRiLTg0NmQtYjVjNzliZTg1ZGE4XkEyXkFqcGc@._V1_FMjpg_UY3000_.jpg",
    type: "serie",
  },
];

export default function HomePage() {
  return (
    <main>
      <Meta overrideTitle />

      <HeroSection content={mockHeroContent} />
      <div className="relative z-20">
        <ContentCarousel title="Trending" items={mockTrending} />
        <ContentCarousel title="Popular Series" items={mockPopularSeries} />
      </div>
    </main>
  );
}
