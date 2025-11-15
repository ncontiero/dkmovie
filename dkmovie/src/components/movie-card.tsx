import type { Movie } from "@/utils/types";
import { Link } from "react-router";

interface MovieCardProps {
  readonly movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      to={`/${movie.type}/${movie.id}`}
      className="group relative shrink-0 transform rounded-lg focus-visible:outline-hidden"
    >
      <div
        className={`
          ring-ring ring-offset-background rounded-lg ring-offset-2 duration-300 group-focus-visible:scale-105
          group-focus-visible:ring-2 hover:scale-105
        `}
      >
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className={`
            group-hover:border-border group-hover:shadow-xl relative h-[350px] w-full rounded-lg border-2
            border-transparent object-cover shadow-md duration-200
          `}
        />
        <p className="text-muted-foreground mt-1 truncate font-medium duration-200 group-hover:text-foreground">
          {movie.title}
        </p>
      </div>
    </Link>
  );
}
