import { Link } from "react-router";

export function Header() {
  return (
    <header className="bg-secondary/80 sticky inset-x-0 top-0 z-9999 h-16 w-full border-b-2 backdrop-blur-sm">
      <div className="flex size-full items-center justify-between px-4 sm:container">
        <Link
          to="/"
          className={`
            focus:ring-ring focus:ring-3 focus:outline-hidden rounded-md p-2 text-2xl font-bold duration-200
            hover:opacity-70
          `}
        >
          DKMovie
        </Link>
        <div className="flex items-center gap-3" />
      </div>
    </header>
  );
}
