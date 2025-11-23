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
  readonly onOpenChange?: (open: boolean) => void;
}

export function RecoveryCodesDialog({ onOpenChange }: RecoveryCodeDialogProps) {
  return (
    <Dialog defaultOpen onOpenChange={onOpenChange}>
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
