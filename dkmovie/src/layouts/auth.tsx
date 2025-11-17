import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { useSession } from "@/hooks/use-session";

export default function AuthLayout() {
  const { isAuthenticated, isLoadingSession } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoadingSession) {
      navigate("/");
    }
  }, [isAuthenticated, isLoadingSession, navigate]);

  if (isLoadingSession) {
    return null;
  }

  return <Outlet />;
}
