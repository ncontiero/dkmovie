import { useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

const especialNextPaths = [
  `/${process.env.DJANGO_ADMIN_URL || "admin/"}`,
  "/api/docs",
];

export function useNextPath() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPathParam = searchParams.get("next");
  const [nextPath, setNextPath] = useState(nextPathParam || "/");

  if (!nextPath.startsWith("/")) {
    setNextPath("/");
  }

  const navigateToNextPath = useCallback(() => {
    if (especialNextPaths.includes(nextPath)) {
      location.assign(nextPath);
      return;
    }

    navigate(nextPath);
  }, []);

  return {
    nextPath,
    navigateToNextPath,
  };
}
