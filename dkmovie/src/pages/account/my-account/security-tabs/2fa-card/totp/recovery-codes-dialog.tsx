import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getRecoveryCodes } from "@/http/account/2fa";

interface RecoveryCodeDialogContentProps {
  readonly userId: number;
}

export function RecoveryCodeDialogContent({
  userId,
}: RecoveryCodeDialogContentProps) {
  const { data: recoveryCodes, isLoading: isGettingRecoveryCodes } = useQuery({
    queryKey: ["recovery-codes", userId],
    queryFn: async () => await getRecoveryCodes(),
    staleTime: 1000 * 60 * 10,
    select: (data) => data.data,
  });

  const codes = recoveryCodes?.unused_codes || [];

  if (isGettingRecoveryCodes) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recovery Codes</DialogTitle>
          <DialogDescription>Generating recovery codes...</DialogDescription>
        </DialogHeader>
        <div className="flex h-72 w-full flex-col items-center justify-center gap-4 rounded-lg border p-4 pb-6">
          <Loader className="animate-spin" />
        </div>
      </DialogContent>
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Recovery Codes</DialogTitle>
        <DialogDescription>
          Copy and store these recovery code in case you lose your device.
        </DialogDescription>
      </DialogHeader>
      <div className="w-full rounded-lg border">
        <div className="flex flex-col items-center justify-center gap-4 p-4 pb-6">
          <div className="grid grid-cols-5 grid-rows-2 gap-5 font-mono">
            {codes.map((code) => (
              <div key={code} className="text-center">
                {code}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-secondary/80 lg flex items-center justify-end rounded-b border-t p-2">
          <CopyButton value={codes.join("\n")} variant="outline" size="sm">
            Copy
          </CopyButton>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button">Done</Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

export function RecoveryCodesDialog({
  userId,
}: RecoveryCodeDialogContentProps) {
  const queryClient = useQueryClient();

  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => {
        if (!open) {
          queryClient.invalidateQueries({ queryKey: ["2fa", userId] });
        }
      }}
    >
      <RecoveryCodeDialogContent userId={userId} />
    </Dialog>
  );
}
