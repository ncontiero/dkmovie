import type { Title } from "@/utils/types";
import { Link } from "react-router";

interface MovieCardProps {
  readonly movie: Title;
}

export function MovieCard({ movie }: MovieCardProps) {
  const pathTo = movie.content_type === "MOVIE" ? "movies" : "series";

  return (
    <Link
      to={`/${pathTo}/${movie.id}`}
      className="group relative shrink-0 transform rounded-lg focus-visible:outline-hidden"
    >
      <div
        className={`
          ring-ring ring-offset-background rounded-lg ring-offset-2 duration-300 group-focus-visible:scale-105
          group-focus-visible:ring-2 hover:scale-105
        `}
      >
        {movie.poster ? (
          <img
            src={movie.poster}
            alt={movie.title}
            className={`
              group-hover:border-border group-hover:shadow-xl relative h-[350px] w-full rounded-lg border-2
              border-transparent object-cover shadow-md duration-200
            `}
          />
        ) : null}
        <p className="text-muted-foreground mt-1 truncate font-medium duration-200 group-hover:text-foreground">
          {movie.title}
        </p>
      </div>
    </Link>
  );
}
