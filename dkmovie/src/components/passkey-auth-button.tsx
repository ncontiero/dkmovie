import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { KeySquare, Loader } from "lucide-react";
import { toast } from "sonner";
import { useNextPath } from "@/hooks/use-next-path";
import { useSession } from "@/hooks/use-session";
import {
  type GetWebAuthnRequestType,
  authenticateWithWebAuthn,
  getWebAuthnCredentials,
} from "@/http/auth/passkey";
import { needEmailVerification } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";
import { type ButtonProps, Button } from "./ui/button";

interface PasskeyAuthButtonProps extends ButtonProps {
  readonly text?: string;
  readonly flow?: GetWebAuthnRequestType;
  readonly isToNavigateToNextPath?: boolean;
  readonly onAuthenticated?: () => void;
}

export function PasskeyAuthButton({
  text,
  flow = "login",
  isToNavigateToNextPath = true,
  onAuthenticated,
  ...props
}: PasskeyAuthButtonProps) {
  const { setSession } = useSession();
  const navigate = useNavigate();
  const { nextPath, navigateToNextPath } = useNextPath();

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
      toast.success("Successfully authenticated with passkey");
      if (isToNavigateToNextPath) navigateToNextPath();
      if (onAuthenticated) onAuthenticated();
    },
    onError: (error) => {
      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      if (needEmailVerification(error)) {
        toast.success("You need to verify your email address.", {
          description: "Please check your email to verify your account.",
        });
        navigate(`/account/verify-email?next=${nextPath}`);
        return;
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
