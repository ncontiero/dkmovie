import { useEffect, useEffectEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";

export default function ProviderCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const error = searchParams.get("error");
  const onMount = useEffectEvent(() => {
    if (!error) {
      navigate("/account");
    }
  });

  useEffect(() => {
    onMount();
  }, []);

  if (!error) return null;

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-4">
      <h1 className="mb-4 text-2xl font-bold">Authentication Error</h1>
      <p className="text-center">
        There was an error during authentication. Please try again.
      </p>
    </div>
  );
}
