import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Bell, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { ThemeToggle } from "./theme-toggle";

const links: { title: string; href: string }[] = [
  { title: "Home", href: "/" },
  { title: "Movies", href: "/movies" },
  { title: "Series", href: "/series" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-9999 h-16 w-full duration-300",
        isScrolled
          ? "bg-background/60 border-border border-b backdrop-blur-md"
          : `bg-transparent`,
      )}
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className={`
                focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-hidden rounded-md pb-1.5 text-3xl
                font-bold duration-200 hover:underline
              `}
            >
              DKMovie
            </Link>
            <nav className="hidden gap-1 md:flex">
              {links.map(({ title, href }) => (
                <Link
                  key={href}
                  to={href}
                  className={cn(
                    `
                      hover:bg-background focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-hidden
                      rounded-md px-3 py-2 text-sm font-medium duration-200
                    `,
                    isScrolled && `hover:bg-foreground/20`,
                  )}
                >
                  {title}
                </Link>
              ))}
            </nav>
          </div>

          <div className="text-muted-foreground flex items-center gap-1">
            <Button
              type="button"
              variant="invert"
              size="icon"
              className={cn(
                "rounded-full",
                isScrolled && `hover:bg-foreground/20`,
              )}
            >
              <Search />
            </Button>
            <Button
              type="button"
              variant="invert"
              size="icon"
              className={cn(
                "rounded-full",
                isScrolled && `hover:bg-foreground/20`,
              )}
            >
              <Bell />
            </Button>
            <ThemeToggle
              className={isScrolled ? "hover:bg-foreground/20" : ""}
            />
            <Button
              type="button"
              variant="invert"
              size="icon"
              className={cn(
                "rounded-full",
                isScrolled && `hover:bg-foreground/20`,
              )}
            >
              <User />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
