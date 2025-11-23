import { useNavigate, useSearchParams } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { KeySquare, Loader } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/hooks/use-session";
import {
  type GetWebAuthnRequestType,
  authenticateWithWebAuthn,
  getWebAuthnCredentials,
} from "@/http/auth/passkey";
import { HTTPError } from "@/http/client";
import { needEmailVerification } from "@/utils/auth-flows";
import { type ButtonProps, Button } from "./ui/button";

interface PasskeyAuthButtonProps extends ButtonProps {
  readonly text?: string;
  readonly flow?: GetWebAuthnRequestType;
}

export function PasskeyAuthButton({
  text,
  flow = "login",
  ...props
}: PasskeyAuthButtonProps) {
  const { setSession } = useSession();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const nextPathParam = searchParams.get("next") ?? "/";
  const nextPath = nextPathParam.startsWith("/") ? nextPathParam : "/";

  const {
    mutate: authenticateWithWebAuthnMutation,
    isPending: isAuthenticatingWithWebAuthn,
  } = useMutation({
    mutationFn: async () => {
      const credentials = await getWebAuthnCredentials(flow);
      const publicKey = PublicKeyCredential.parseRequestOptionsFromJSON(
        credentials.data.request_options.publicKey,
      );
      const credential = (await navigator.credentials.get({
        publicKey,
      })) as PublicKeyCredential;
      return await authenticateWithWebAuthn(flow, credential.toJSON());
    },
    onSuccess: (res) => {
      setSession(res);
      navigate(nextPath);
      toast.success("You have been authenticated with passkey");
    },
    onError: (error) => {
      if (error instanceof HTTPError) {
        if (needEmailVerification(error)) {
          toast.success("You need to verify your email address.", {
            description: "Please check your email to verify your account.",
          });
          navigate(`/account/verify-email`);
          return;
        }

        if (error.status === 400) {
          toast.error(error.data?.errors.map((e: any) => e.message).join("\n"));
          return;
        }
      }

      toast.error("Failed to authenticate with passkey");
      console.error(error);
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      {...props}
      onClick={() => authenticateWithWebAuthnMutation()}
      disabled={isAuthenticatingWithWebAuthn}
    >
      {isAuthenticatingWithWebAuthn ? (
        <Loader className="animate-spin" />
      ) : (
        <KeySquare />
      )}
      {text || "Continue with Passkey"}
    </Button>
  );
}
