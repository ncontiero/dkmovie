import type { Get2FAAuthenticatorWebAuthn } from "@/http/account/2fa";
import { Activity, useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Edit, Loader, Trash } from "lucide-react";
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
import { useSession } from "@/hooks/use-session";
import {
  type AddWebAuthCredentialsSchema,
  addWebAuthCredentialsSchema,
  deleteWebAuthCredentials,
  renameWebAuthCredentials,
} from "@/http/account/passkey";
import { needReAuthentication } from "@/utils/auth-flows";

interface PasskeyItemProps {
  readonly passkey: Get2FAAuthenticatorWebAuthn;
  readonly deletePasskey: (ids: number[]) => void;
  readonly isDeleting: boolean;
  readonly initializeReAuthentication: (callback: () => void) => void;
  readonly userId?: number;
}

function PasskeyItem({
  passkey,
  deletePasskey,
  isDeleting,
  initializeReAuthentication,
  userId,
}: PasskeyItemProps) {
  const queryClient = useQueryClient();
  const createdAt = new Date(passkey.created_at * 1000);
  const lastUsedAt = passkey.last_used_at
    ? new Date(passkey.last_used_at * 1000)
    : null;

  const createdAtFormatted = createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const lastUsedAtFormatted = lastUsedAt?.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting: isSubmittingForm },
  } = useForm({
    resolver: zodResolver(addWebAuthCredentialsSchema),
    defaultValues: {
      name: passkey.name,
    },
  });

  const onSubmit: SubmitHandler<AddWebAuthCredentialsSchema> = async (data) => {
    try {
      await renameWebAuthCredentials(passkey.id, data);
      toast.success("Passkey renamed successfully");
      queryClient.invalidateQueries({ queryKey: ["2fa", userId] });
    } catch (error) {
      if (needReAuthentication(error)) {
        initializeReAuthentication(() => {
          handleSubmit(onSubmit)();
        });
        return;
      }

      console.error(error);
      toast.error("Failed to rename passkey");
    }
  };

  return (
    <li className="flex items-center justify-between">
      <div className="text-foreground/60 space-y-1 text-xs">
        <p>{passkey.name}</p>
        <p>
          <span>Created on {createdAtFormatted}</span>{" "}
          {lastUsedAt ? (
            <span>• Last used on {lastUsedAtFormatted}</span>
          ) : null}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-12"
              disabled={isSubmittingForm || isDeleting}
            >
              {isSubmittingForm || isDeleting ? (
                <Loader className="animate-spin" />
              ) : (
                <Edit />
              )}
              <span className="sr-only">Edit {passkey.name}</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Passkey</DialogTitle>
              <DialogDescription>
                Edit your passkey <b>{passkey.name}</b> name.
              </DialogDescription>
            </DialogHeader>
            <form
              className="mt-3 flex w-full flex-col gap-5"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor={`passkey-name-${passkey.id}`}>Name</Label>
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
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmittingForm}>
                  {isSubmittingForm ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Save"
                  )}
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
              disabled={isDeleting}
            >
              {isDeleting ? <Loader className="animate-spin" /> : <Trash />}
              <span className="sr-only">Delete {passkey.name}</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Passkey</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete your <b>{passkey.name}</b>{" "}
                passkey? By removing this passkey you will no longer be able to
                use it to sign-in to your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => deletePasskey([passkey.id])}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader className="animate-spin" /> : "Delete"}
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
  const queryClient = useQueryClient();
  const { session, initializeReAuthentication, isReAuthenticating } =
    useSession();
  const [open, setOpen] = useState(false);

  const { mutate: deletePasskey, isPending: isDeleting } = useMutation({
    mutationFn: async (ids: number[]) => await deleteWebAuthCredentials(ids),
    onSuccess: () => {
      toast.success("Passkey deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["2fa", session?.user.id] });
    },
    onError: (error, ids) => {
      if (needReAuthentication(error)) {
        initializeReAuthentication(() => deletePasskey(ids));
        return;
      }
      toast.error("Failed to delete passkey");
    },
  });

  return (
    <Activity mode={isReAuthenticating ? "hidden" : "visible"}>
      <Collapsible open={open} onOpenChange={setOpen} className="mt-2 w-full">
        <CollapsibleTrigger className="text-muted-foreground flex items-center gap-1 text-sm [&>svg]:size-4">
          <span>{passkeys.length} passkeys registered</span>
          <ChevronDown className={`${open ? "rotate-180" : ""} duration-200`} />
          <span className="sr-only">
            {open ? "Close" : "Open"} passkeys list
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
                  userId={session?.user.id}
                />
              ))}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </Activity>
  );
}
