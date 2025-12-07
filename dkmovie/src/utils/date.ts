export function getReleaseYear() {
  const date = new Date();
  const currentYear = date.getFullYear();
  return date.getMonth() <= 2 ? currentYear - 1 : currentYear;
}
