import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RecoveryCodesContent } from "./content";

interface RecoveryCodeDialogProps {
  readonly userId: number;
}

export function RecoveryCodesDialog({ userId }: RecoveryCodeDialogProps) {
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recovery Codes</DialogTitle>
          <DialogDescription>
            Copy and store these recovery code in case you lose your device.
          </DialogDescription>
        </DialogHeader>
        <RecoveryCodesContent />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">Done</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
