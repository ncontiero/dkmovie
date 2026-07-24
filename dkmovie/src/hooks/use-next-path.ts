import { useCallback, useMemo, useState } from "react";
import {
  useNavigate,
  useRouteContext,
  useSearch,
} from "@tanstack/react-router";

export function useNextPath() {
  const adminUrl = useRouteContext({
    from: "__root__",
    select: (search) => search.djangoAdminUrl,
  });
  const navigate = useNavigate();
  const searchParams = useSearch({ from: "__root__" });
  const [nextPath, setNextPath] = useState(searchParams.next || "/");

  const especialNextPaths = useMemo(() => [adminUrl, "/api/docs"], [adminUrl]);

  if (!nextPath.startsWith("/")) {
    setNextPath("/");
  }

  const navigateToNextPath = useCallback(async () => {
    if (especialNextPaths.includes(nextPath)) {
      location.assign(nextPath);
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await navigate({ to: nextPath });
  }, [especialNextPaths, navigate, nextPath]);

  return {
    nextPath,
    navigateToNextPath,
  };
}
