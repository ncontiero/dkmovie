import { useNavigate } from "react-router";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { resentEmailVerification } from "@/http/auth/verify-email";
import { HTTPError } from "@/http/client";
import { getErrorMessage } from "@/utils/errors";
import { type ButtonProps, Button } from "./ui/button";

export function ResendEmailCodeButton({
  text,
  ...props
}: ButtonProps & { readonly text?: string }) {
  const navigate = useNavigate();

  const {
    mutate: resendEmailVerificationMutation,
    isPending: isResendEmailVerificationPending,
  } = useMutation({
    mutationFn: async () => {
      return await resentEmailVerification();
    },
    onSuccess: () => {
      toast.success("Email verification resent successfully");
      navigate("/account/verify-email");
    },
    onError: (error) => {
      if (error instanceof HTTPError) {
        if (error.status === 403 || error.status === 429) {
          toast.error("Too many requests. Please try again later.");
        }
        return;
      }

      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      toast.error(error.message);
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        resendEmailVerificationMutation();
      }}
      disabled={isResendEmailVerificationPending}
      {...props}
    >
      {isResendEmailVerificationPending ? (
        <Loader className="animate-spin" />
      ) : (
        text || "Resend verification email"
      )}
    </Button>
  );
}
