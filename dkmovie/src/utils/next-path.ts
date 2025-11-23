const especialNextPaths = [
  `/${process.env.DJANGO_ADMIN_URL || "admin/"}`,
  "/api/docs",
];

export function handleNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) return "/";

  if (especialNextPaths.includes(nextPath)) {
    location.assign(nextPath);
    return null;
  }

  return nextPath;
}
