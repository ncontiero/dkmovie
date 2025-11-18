import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Bell, Search, User } from "lucide-react";
import faviconSvg from "@/assets/favicon.svg";
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
const pathsToNotAddNext = ["/auth"];

export function Header() {
  const { isAuthenticated, logout, isLogoutPending } = useSession();
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  const addScrollEffect = pagesToAddScrollEffect.some((page) =>
    page === "/" ? pathname === "/" : pathname.startsWith(page),
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
    pathname.startsWith(path),
  );
  const nextPath = addNextPathToSignInUp ? `?next=${pathname}` : "";

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
              className={cn(
                `
                  focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-hidden ring-offset-background
                  rounded-md font-bold ring-offset-2 duration-200 hover:scale-105
                `,
                !isScrolled &&
                  addScrollEffect &&
                  `
                    bg-background/80 rounded-md backdrop-blur-md dark:bg-background/60 hover:bg-primary
                    dark:hover:bg-primary focus-visible:bg-primary dark:focus-visible:bg-primary
                  `,
              )}
            >
              <img src={faviconSvg} alt="DkMovie" className="size-10" />
            </Link>
            <nav
              className={cn(
                "hidden items-center gap-0.5 md:flex",
                !isScrolled &&
                  addScrollEffect &&
                  "bg-background/80 rounded-md backdrop-blur-md dark:bg-background/60",
              )}
            >
              {links.map(({ title, href }) => (
                <Link
                  key={href}
                  to={href}
                  className={`
                    hover:bg-foreground/20 focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-hidden
                    ring-offset-background rounded-md px-3 py-2 text-sm font-medium ring-offset-2 duration-200
                  `}
                >
                  {title}
                </Link>
              ))}
            </nav>
          </div>

          <div
            className={cn(
              "text-muted-foreground flex items-center gap-0.5",
              !isScrolled &&
                addScrollEffect &&
                "bg-background/80 rounded-full backdrop-blur-md dark:bg-background/60",
            )}
          >
            <Button
              type="button"
              variant="invert"
              size="icon"
              className="hover:bg-foreground/20 rounded-full"
            >
              <Search />
            </Button>
            <Button
              type="button"
              variant="invert"
              size="icon"
              className="hover:bg-foreground/20 rounded-full"
            >
              <Bell />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="invert"
                  size="icon"
                  className="hover:bg-foreground/20 rounded-full"
                >
                  <User />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background/80 backdrop-blur-md">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem
                      className="focus:bg-foreground/20 cursor-pointer py-2"
                      asChild
                    >
                      <Link to={`/account`}>My Account</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="focus:bg-foreground/20 cursor-pointer py-2"
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
                      className="focus:bg-foreground/20 cursor-pointer py-2"
                      asChild
                    >
                      <Link to={`/auth/sign-in${nextPath}`}>Sign In</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      asChild
                      className="focus:bg-foreground/20 cursor-pointer py-2"
                    >
                      <Link to="/auth/sign-up">Sign Up</Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
