export function getCSRFToken() {
  const csrftoken = document.querySelector("[name=csrfmiddlewaretoken]");
  if (!csrftoken) return;
  return (csrftoken as HTMLInputElement).value;
}
