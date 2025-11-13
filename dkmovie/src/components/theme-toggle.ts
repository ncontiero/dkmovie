export function getTheme() {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const storedTheme = localStorage.getItem("theme");
  return storedTheme ?? (prefersDark ? "dark" : "light");
}

export function initThemeToggle() {
  const themeToggle = document.querySelector("[data-theme-toggle]");
  if (!themeToggle) return;
  const themeText = themeToggle.querySelector("#theme-text");

  const theme = getTheme();

  const enableDark = () => {
    document.documentElement.classList.add("dark");
    document.documentElement.style.colorScheme = "dark";
    localStorage.setItem("theme", "dark");
    if (themeText) themeText.textContent = "Dark Theme";
  };
  const enableLight = () => {
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
    localStorage.setItem("theme", "light");
    if (themeText) themeText.textContent = "Light Theme";
  };

  if (theme === "dark") enableDark();
  else enableLight();

  themeToggle.addEventListener("click", () => {
    if (document.documentElement.classList.contains("dark")) enableLight();
    else enableDark();
  });
}
