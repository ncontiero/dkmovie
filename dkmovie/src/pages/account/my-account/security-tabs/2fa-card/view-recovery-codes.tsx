import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { RecoveryCodesContent } from "@/components/recovery-codes/content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useReAuthenticate } from "@/hooks/use-reauthenticate";
import { regenerateRecoveryCodes } from "@/http/account/2fa";
import { needReAuthentication } from "@/utils/auth-flows";
import { getErrorMessage } from "@/utils/errors";

export function ViewRecoveryCodes() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const { initializeReAuthentication, isReAuthenticating } =
    useReAuthenticate();

  const {
    mutate: regenerateRecoveryCodesMutation,
    isPending: isRegeneratingRecoveryCodes,
  } = useMutation({
    mutationFn: async () => await regenerateRecoveryCodes(),
    onSuccess: (data) => {
      toast.success(`Recovery codes regenerated successfully`);
      queryClient.setQueryData(["recovery-codes"], data);
    },
    onError: (error) => {
      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      if (needReAuthentication(error)) {
        initializeReAuthentication({
          onReAuthenticated: () => {
            setShowDialog(true);
            regenerateRecoveryCodesMutation();
          },
          onCancel: () => setShowDialog(false),
        });
        return;
      }

      console.error(error);
      toast.error(`Failed to regenerate recovery codes`);
    },
  });

  if (isReAuthenticating) return null;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          View
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recovery Codes</DialogTitle>
          <DialogDescription>
            Recovery codes can be used to access your account in the event you
            lose access to your device and cannot receive two-factor
            authentication codes.
          </DialogDescription>
        </DialogHeader>
        <RecoveryCodesContent
          onReAuthenticationCancel={() => setShowDialog(false)}
        />
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            disabled={isRegeneratingRecoveryCodes}
            onClick={() => regenerateRecoveryCodesMutation()}
          >
            {isRegeneratingRecoveryCodes ? (
              <Loader className="animate-spin" />
            ) : (
              "Regenerate"
            )}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
