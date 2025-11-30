import type { Locale } from "use-intl";
import { createContext } from "react";

export interface IntlContextProps {
  lang: Locale;
  setLang: (lang: Locale) => void;
}

export const IntlContext = createContext<IntlContextProps>({
  lang: "en",
  setLang: () => {
    throw new Error("setLang function not implemented");
  },
});
