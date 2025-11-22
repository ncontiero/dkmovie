import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useSession } from "@/hooks/use-session";
import { regenerateRecoveryCodes } from "@/http/account/2fa";
import { HTTPError } from "@/http/client";
import { RecoveryCodesDialog } from "./recovery-codes-dialog";

export function GenerateCodes({
  alreadyExists,
}: {
  readonly alreadyExists: boolean;
}) {
  const queryClient = useQueryClient();
  const { session, initializeReAuthentication, isReAuthenticating } =
    useSession();

  const userId = session?.user.id;
  const title = alreadyExists ? "regenerate" : "generate";

  const {
    mutate: regenerateRecoveryCodesMutation,
    isPending: isRegeneratingRecoveryCodes,
    isSuccess: isRegeneratedRecoveryCodes,
  } = useMutation({
    mutationFn: async () => await regenerateRecoveryCodes(),
    onSuccess: (data) => {
      toast.success(`Recovery codes ${title}d successfully`);
      queryClient.setQueryData(["recovery-codes", userId], data);
    },
    onError: (error) => {
      if (error instanceof HTTPError) {
        console.error(error.data);
        if (error.status === 400) {
          toast.error(error.data?.errors.map((e: any) => e.message).join(", "));
          return;
        }

        if (error.status === 401) {
          toast.error("You need to re-authenticate to continue");
          initializeReAuthentication();
          return;
        }
      }

      console.error(error);
      toast.error(`Failed to ${title} recovery codes`);
    },
  });

  return isReAuthenticating ? null : isRegeneratedRecoveryCodes && userId ? (
    <RecoveryCodesDialog userId={userId} />
  ) : (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" className="capitalize">
          {title}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title} Recovery Codes</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to generate a new set of recovery codes for your
            account.
            {alreadyExists
              ? " This action will invalidate your existing codes. "
              : ""}
            Are you sure you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild onClick={(e) => e.preventDefault()}>
            <Button
              type="button"
              variant="destructive"
              disabled={isRegeneratingRecoveryCodes}
              onClick={() => regenerateRecoveryCodesMutation()}
              className="capitalize"
            >
              {isRegeneratingRecoveryCodes ? (
                <Loader className="animate-spin" />
              ) : (
                title
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
