import "use-intl";
import type { locales } from "./i18n/config";
import type messages from "./i18n/messages/en.json";

declare module "use-intl" {
  interface AppConfig {
    Locale: (typeof locales)[number];
    Messages: typeof messages;
  }
}

declare module "*.svg" {
  const content: string;
  export default content;
}
