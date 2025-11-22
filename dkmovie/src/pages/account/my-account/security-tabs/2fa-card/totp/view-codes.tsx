import { Activity, useState } from "react";
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
import { useSession } from "@/hooks/use-session";
import { regenerateRecoveryCodes } from "@/http/account/2fa";
import { HTTPError } from "@/http/client";
import { needReAuthentication } from "@/utils/erros";

export function ViewRecoveryCodes() {
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const { session, initializeReAuthentication, isReAuthenticating } =
    useSession();

  const userId = session?.user.id;

  const {
    mutate: regenerateRecoveryCodesMutation,
    isPending: isRegeneratingRecoveryCodes,
  } = useMutation({
    mutationFn: async () => await regenerateRecoveryCodes(),
    onSuccess: (data) => {
      toast.success(`Recovery codes regenerated successfully`);
      queryClient.setQueryData(["recovery-codes", userId], data);
    },
    onError: (error) => {
      if (error instanceof HTTPError) {
        console.error(error.data);
        if (error.status === 400) {
          toast.error(error.data?.errors.map((e: any) => e.message).join(", "));
          return;
        }

        if (needReAuthentication(error)) {
          initializeReAuthentication(regenerateRecoveryCodesMutation);
          return;
        }
      }

      console.error(error);
      toast.error(`Failed to regenerate recovery codes`);
    },
  });

  return (
    <Activity mode={isReAuthenticating ? "hidden" : "visible"}>
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
          <RecoveryCodesContent />
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
    </Activity>
  );
}
