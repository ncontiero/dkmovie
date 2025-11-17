import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Bell, Search, User } from "lucide-react";
import { useSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";

const links: { title: string; href: string }[] = [
  { title: "Home", href: "/" },
  { title: "Movies", href: "/movies" },
  { title: "Series", href: "/series" },
];

const pagesToAddScrollEffect = ["/", "/title/"];
// For Sign In and Sign Up links
const pathsToNotAddNext = ["/sign-in", "/sign-up"];

export function Header() {
  const { isAuthenticated, logout, isLogoutPending } = useSession();

  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const addScrollEffect = pagesToAddScrollEffect.some((page) =>
    page === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(page),
  );

  useEffect(() => {
    if (!addScrollEffect) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [addScrollEffect]);

  const isToAddScrollClasses = isScrolled || !addScrollEffect;
  const addNextPathToSignInUp = !pathsToNotAddNext.some((path) =>
    location.pathname.startsWith(path),
  );
  const nextPath = addNextPathToSignInUp ? `?next=${location.pathname}` : "";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-9999 h-16 w-full duration-300",
        isToAddScrollClasses
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
              DkMovie
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
                    isToAddScrollClasses && `hover:bg-foreground/20`,
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
                isToAddScrollClasses && `hover:bg-foreground/20`,
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
                isToAddScrollClasses && `hover:bg-foreground/20`,
              )}
            >
              <Bell />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="invert"
                  size="icon"
                  className={cn(
                    "rounded-full",
                    isToAddScrollClasses && `hover:bg-foreground/20`,
                  )}
                >
                  <User />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/80 backdrop-blur-md">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem
                      className="focus:bg-foreground/40 cursor-pointer py-2"
                      asChild
                    >
                      <Link to={`/account`}>My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-foreground/40 cursor-pointer py-2"
                      onClick={(e) => {
                        e.preventDefault();
                        logout();
                      }}
                    >
                      {isLogoutPending ? "Logging out..." : "Log out"}
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      className="focus:bg-foreground/40 cursor-pointer py-2"
                      asChild
                    >
                      <Link to={`/sign-in${nextPath}`}>Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="focus:bg-foreground/40 cursor-pointer py-2"
                    >
                      <Link to={`/sign-up${nextPath}`}>Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle
              className={isToAddScrollClasses ? "hover:bg-foreground/20" : ""}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
