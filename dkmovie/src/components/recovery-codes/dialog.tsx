import { useTranslations } from "use-intl";
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
  const t = useTranslations("securityPage.2fa.recoveryCodes");

  return (
    <Dialog defaultOpen onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("saveCodesDescription")}</DialogDescription>
        </DialogHeader>
        <RecoveryCodesContent />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button">{t("done")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
