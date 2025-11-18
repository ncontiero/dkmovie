import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { Meta } from "@/components/meta";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { verifyEmail } from "@/http/auth/verify-email";
import { HTTPError } from "@/http/client";

export default function VerifyEmail() {
  const { key } = useParams();
  const queryClient = useQueryClient();
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const { refetchSession } = useSession();
  const navigate = useNavigate();

  const { mutate: verifyEmailMutation, isPending } = useMutation({
    mutationFn: async () => {
      if (!key) {
        toast.error("Invalid verification link.", {
          description: "Please request a new verification email.",
        });
        throw new Error("Verification key is missing");
      }
      return await verifyEmail(key);
    },
    onSuccess: (res) => {
      refetchSession(res);
      queryClient.invalidateQueries({ queryKey: ["user-emails"] });
      toast.success("Email verified successfully.");
      navigate("/account");
    },
    onError: (error) => {
      if (error instanceof HTTPError) {
        console.error(error.data);
        setApiErrors(error.data?.errors?.map((e: any) => e.message) || []);
        return;
      }

      console.error(error);
      toast.error("An unexpected error occurred. Please try again.");
    },
  });

  if (!key) {
    toast.error("Invalid verification link.", {
      description: "Please request a new verification email.",
    });
    navigate("/auth/sign-in");
    return;
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Meta title="Verify your email" />
      <div className="w-full max-w-md space-y-8 rounded-lg border p-6 shadow-lg sm:p-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold">Verify your email</h1>
          <p className="text-muted-foreground">
            Please click the button below to verify your email address.
          </p>
        </div>
        {apiErrors.length > 0 ? (
          <ul className="text-destructive text-sm">
            {apiErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        ) : null}
        <Button
          type="button"
          className="w-full"
          size="sm"
          disabled={isPending}
          onClick={() => verifyEmailMutation()}
        >
          {isPending ? <Loader className="animate-spin" /> : "Verify Email"}
        </Button>
      </div>
    </main>
  );
}
