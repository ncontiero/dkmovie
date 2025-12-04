import { useCallback, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

const especialNextPaths = [
  `/${process.env.DJANGO_ADMIN_URL || "admin/"}`,
  "/api/docs",
];

export function useNextPath() {
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "__root__" });
  const [nextPath, setNextPath] = useState(searchParams.next || "/");

  if (!nextPath.startsWith("/")) {
    setNextPath("/");
  }

  const navigateToNextPath = useCallback(async () => {
    if (especialNextPaths.includes(nextPath)) {
      location.assign(nextPath);
      return;
    }

    await navigate({ to: nextPath });
  }, []);

  return {
    nextPath,
    navigateToNextPath,
  };
}
