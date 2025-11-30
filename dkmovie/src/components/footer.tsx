import { useTranslations } from "use-intl";
import { Link } from "./ui/link";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-muted border-border mt-16 border-t">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              Links
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="muted">
                  {t("faq")}
                </Link>
              </li>
              <li>
                <Link to="/" variant="muted">
                  {t("privacy")}
                </Link>
              </li>
              <li>
                <Link to="/" variant="muted">
                  {t("speedTest")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              {t("help")}
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="muted">
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link to="/" variant="muted">
                  {t("termsOfUse")}
                </Link>
              </li>
              <li>
                <Link to="/" variant="muted">
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              {t("account")}
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="muted">
                  {t("myAccount")}
                </Link>
              </li>
              <li>
                <Link to="/" variant="muted">
                  {t("preferences")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
              {t("media")}
            </h4>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" variant="muted">
                  {t("legalNotices")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="text-muted-foreground/60 mt-10 text-center text-sm">
          &copy; {new Date().getFullYear()} DKMovie, Inc.{" "}
          {t("allRightsReserved")}.
        </p>
      </div>
    </footer>
  );
}
