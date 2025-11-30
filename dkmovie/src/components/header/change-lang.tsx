import { type Locale, useTranslations } from "use-intl";
import { useIntl } from "@/hooks/use-intl";
import { locales } from "@/i18n/config";
import {
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "../ui/dropdown-menu";

export function ChangeLang() {
  const { lang, setLang } = useIntl();
  const t = useTranslations();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="focus:bg-foreground/20 data-[state=open]:bg-foreground/30 cursor-pointer py-2">
        {t("header.changeLang")}
      </DropdownMenuSubTrigger>
      <DropdownMenuPortal>
        <DropdownMenuSubContent className="bg-background/80 backdrop-blur-md">
          <DropdownMenuRadioGroup
            value={lang}
            onValueChange={(value) => {
              if (value === lang) return;
              setLang(value as Locale);
            }}
          >
            {locales.map((loc) => (
              <DropdownMenuRadioItem
                key={loc}
                value={loc}
                className="focus:bg-foreground/20 cursor-pointer py-2"
              >
                {t(`langs.${loc}`)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuPortal>
    </DropdownMenuSub>
  );
}
