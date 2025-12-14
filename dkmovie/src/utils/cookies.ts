export function getCookie(key: string) {
  const b = document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`);
  return b ? b.pop() : "";
}

export function setCookie(key: string, value: string) {
  document.cookie = `${key}=${value}; path=/`;
}

export function getLangCookie() {
  return getCookie("django_language") || "en-us";
}
