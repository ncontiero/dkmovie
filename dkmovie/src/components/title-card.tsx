import type { Title } from "@/utils/types";
import { Link } from "react-router";

interface TitleCardProps {
  readonly title: Title;
}

export function TitleCard({ title }: TitleCardProps) {
  return (
    <Link
      to={`/title/${title.id}`}
      className="group relative shrink-0 transform rounded-lg focus-visible:outline-hidden"
    >
      <div
        className={`
          ring-ring ring-offset-background rounded-lg ring-offset-2 duration-300 group-focus-visible:scale-105
          group-focus-visible:ring-2 hover:scale-105
        `}
      >
        {title.poster ? (
          <img
            src={title.poster}
            alt={title.title}
            className={`
              group-hover:border-border group-hover:shadow-xl relative h-[350px] w-full rounded-lg border-2
              border-transparent object-cover shadow-md duration-200
            `}
          />
        ) : null}
        <p className="text-muted-foreground mt-1 truncate font-medium duration-200 group-hover:text-foreground">
          {title.title}
        </p>
      </div>
    </Link>
  );
}
