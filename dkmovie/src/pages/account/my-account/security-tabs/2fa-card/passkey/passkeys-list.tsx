import type { InitializeReAuthentication } from "@/context/reauthenticate/context";
import type { Get2FAAuthenticatorWebAuthn } from "@/http/account/2fa";
import { type ReactNode, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Edit, Trash } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useIntl } from "@/hooks/use-intl";
import { useReAuthenticate } from "@/hooks/use-reauthenticate";
import {
  deleteWebAuthCredentials,
  renameWebAuthCredentials,
} from "@/http/account/passkey";
import {
  type AddPasskeySchema,
  addPasskeySchema,
} from "@/schemas/account/passkey";
import { needReAuthentication } from "@/utils/auth-flows";

interface PasskeyItemProps {
  readonly passkey: Get2FAAuthenticatorWebAuthn;
  readonly deletePasskey: (ids: number[]) => void;
  readonly isDeleting: boolean;
  readonly initializeReAuthentication: InitializeReAuthentication;
}

function richTextBold(chunks: ReactNode) {
  return <b>{chunks}</b>;
}

function PasskeyItem({
  passkey,
  deletePasskey,
  isDeleting,
  initializeReAuthentication,
}: PasskeyItemProps) {
  const { lang } = useIntl();
  const t = useTranslations("securityPage.2fa.passkey");
  const actionsT = useTranslations("common.actions");
  const queryClient = useQueryClient();
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);

  const createdAt = new Date(passkey.created_at * 1000);
  const lastUsedAt = passkey.last_used_at
    ? new Date(passkey.last_used_at * 1000)
    : null;

  const createdAtFormatted = createdAt.toLocaleDateString(lang, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const lastUsedAtFormatted = lastUsedAt?.toLocaleDateString(lang, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting: isSubmittingForm },
  } = useForm({
    resolver: zodResolver(addPasskeySchema),
    defaultValues: {
      name: passkey.name,
    },
  });

  const onSubmit: SubmitHandler<AddPasskeySchema> = async (data) => {
    try {
      await renameWebAuthCredentials(passkey.id, data);
      toast.success(t("renamedSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["2fa"] });
      setIsRenameDialogOpen(false);
    } catch (error) {
      if (needReAuthentication(error)) {
        initializeReAuthentication({
          onReAuthenticated: () => {
            setIsRenameDialogOpen(true);
            handleSubmit(onSubmit)();
          },
          onCancel: () => {
            setIsRenameDialogOpen(false);
          },
        });
        return;
      }

      console.error(error);
      toast.error(t("renameFailed"));
    }
  };

  return (
    <li className="flex items-center justify-between">
      <div className="text-foreground/60 space-y-1 text-xs">
        <p>{passkey.name}</p>
        <p>
          <span>{t("createdOn", { date: createdAtFormatted })}</span>{" "}
          {lastUsedAtFormatted ? (
            <span>• {t("lastUsedOn", { date: lastUsedAtFormatted })}</span>
          ) : null}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-12"
              loading={isSubmittingForm || isDeleting}
            >
              <Edit />
              <span className="sr-only">
                {t("editPasskeyName", { name: passkey.name })}
              </span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("editPasskey")}</DialogTitle>
              <DialogDescription>
                {t.rich("editYourPasskey", {
                  b: richTextBold,
                  passkeyName: passkey.name,
                })}
              </DialogDescription>
            </DialogHeader>
            <form
              className="mt-3 flex w-full flex-col gap-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor={`passkey-name-${passkey.id}`}>
                  {t("name")}
                </Label>
                <Input
                  id={`passkey-name-${passkey.id}`}
                  type="text"
                  {...register("name")}
                />
                {errors.name ? (
                  <p className="text-destructive text-sm">
                    {errors.name.message}
                  </p>
                ) : null}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    {actionsT("cancel")}
                  </Button>
                </DialogClose>
                <Button type="submit" loading={isSubmittingForm}>
                  {actionsT("save")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-12"
              loading={isDeleting}
            >
              <Trash />
              <span className="sr-only">
                {t("deletePasskeyName", { name: passkey.name })}
              </span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("deletePasskey")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t.rich("deleteDescription", {
                  b: richTextBold,
                  passkeyName: passkey.name,
                })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline">
                  {actionsT("cancel")}
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => deletePasskey([passkey.id])}
                  loading={isDeleting}
                >
                  {t("delete")}
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </li>
  );
}

interface PasskeysListProps {
  readonly passkeys: Get2FAAuthenticatorWebAuthn[];
}

export function PasskeysList({ passkeys }: PasskeysListProps) {
  const t = useTranslations("securityPage.2fa.passkey");
  const queryClient = useQueryClient();
  const { initializeReAuthentication } = useReAuthenticate();
  const [open, setOpen] = useState(false);

  const { mutate: deletePasskey, isPending: isDeleting } = useMutation({
    mutationFn: async (ids: number[]) => await deleteWebAuthCredentials(ids),
    onSuccess: () => {
      toast.success(t("deleteSuccessfully"));
      queryClient.invalidateQueries({ queryKey: ["2fa"] });
    },
    onError: (error, ids) => {
      if (needReAuthentication(error)) {
        initializeReAuthentication({
          onReAuthenticated: () => deletePasskey(ids),
        });
        return;
      }
      toast.error(t("deleteFailed"));
    },
  });

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="mt-2 w-full">
      <CollapsibleTrigger className="text-muted-foreground flex items-center gap-1 text-sm [&>svg]:size-4">
        <span>{t("passkeysRegistered", { count: passkeys.length })}</span>
        <ChevronDown className={`${open ? "rotate-180" : ""} duration-200`} />
        <span className="sr-only">
          {open ? t("closePasskeysList") : t("openPasskeysList")}
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Separator className="my-3" />
        <ul className="space-y-3">
          {passkeys
            .sort((a, b) => b.created_at - a.created_at)
            .map((key) => (
              <PasskeyItem
                key={key.id}
                passkey={key}
                deletePasskey={deletePasskey}
                isDeleting={isDeleting}
                initializeReAuthentication={initializeReAuthentication}
              />
            ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}
