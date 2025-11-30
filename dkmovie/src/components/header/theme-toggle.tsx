import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslations } from "use-intl";
import { Button } from "../ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const t = useTranslations("header");

  return (
    <Button
      type="button"
      variant="invert"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="hover:bg-foreground/20 rounded-full"
    >
      <Sun className="size-6 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-6 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">{t("toggleTheme")}</span>
    </Button>
  );
}
