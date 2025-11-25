import { SITE_DOMAIN } from "./constants";

export function resolveUrl(
  path: string,
  searchParams?: Record<string, string>,
) {
  let url = `${SITE_DOMAIN}${path}`;
  const params = [];
  if (searchParams) {
    for (const key of Object.keys(searchParams)) {
      params.push(`${key}=${searchParams[key]}`);
    }
    url += `?${params.join("&")}`;
  }
  return url;
}
