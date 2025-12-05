import { useMutation } from "@tanstack/react-query";
import { useNavigate, useRouter } from "@tanstack/react-router";
import { KeySquare } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
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
  const t = useTranslations("auth");
  const emailVerificationT = useTranslations("common.emailVerification");
  const { setSession } = useSession();
  const router = useRouter();
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
    onSuccess: async (res) => {
      setSession(res);
      if (flow !== "reauthenticate") {
        await router.invalidate({ forcePending: true });
      }

      toast.success(t("passkey.authenticated"));
      if (isToNavigateToNextPath) await navigateToNextPath();
      if (onAuthenticated) onAuthenticated();
    },
    onError: (error) => {
      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      if (needEmailVerification(error)) {
        toast.success(emailVerificationT("title"), {
          description: emailVerificationT("description"),
        });
        navigate({ to: "/account/verify-email", search: { next: nextPath } });
        return;
      }

      toast.error(t("passkey.failed"));
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
      loading={isAuthenticatingWithWebAuthn}
      loadingText={text || t("continueWith.passkey")}
    >
      <KeySquare />
      {text || t("continueWith.passkey")}
    </Button>
  );
}
