import { SITE_NAME_VALUE, USERNAME_VALUE } from "./constants";

export function translate(text: string, values?: string) {
  const withValues = values ? `with ${values}` : "";
  return `{% blocktrans ${withValues} %}${text}{% endblocktrans %}`;
}

export function translateWithSiteName(text: string) {
  return translate(text, `site_name=${SITE_NAME_VALUE}`);
}

export function translateWithUsername(text: string) {
  return translate(text, `name=${USERNAME_VALUE}`);
}
