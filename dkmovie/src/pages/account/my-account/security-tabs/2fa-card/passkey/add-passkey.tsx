import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { RecoveryCodesDialog } from "@/components/recovery-codes/dialog";
import { AlertDialogHeader } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import {
  addWebAuthCredentials,
  getWebAuthCredentials,
} from "@/http/account/passkey";
import {
  type AddPasskeySchema,
  addPasskeySchema,
} from "@/schemas/account/passkey";
import { needReAuthentication } from "@/utils/auth-flows";

export function AddPasskey() {
  const queryClient = useQueryClient();
  const { initializeReAuthentication, isReAuthenticating } = useSession();
  const [showDialog, setShowDialog] = useState(false);
  const [recoveryCodesGenerated, setRecoveryCodesGenerated] = useState(false);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addPasskeySchema),
  });

  const onSubmit: SubmitHandler<AddPasskeySchema> = async (data) => {
    try {
      const credentials = await getWebAuthCredentials();
      const publicKey = PublicKeyCredential.parseCreationOptionsFromJSON(
        credentials.data.creation_options.publicKey,
      );
      const credential = (await navigator.credentials.create({
        publicKey,
      })) as PublicKeyCredential;
      const res = await addWebAuthCredentials(credential.toJSON(), data);
      toast.success("Passkey added successfully");
      if (res?.meta?.recovery_codes_generated) {
        setRecoveryCodesGenerated(true);
      }
      setShowDialog(false);
      reset();
    } catch (error) {
      if (needReAuthentication(error)) {
        initializeReAuthentication(() => {
          setShowDialog(true);
          handleSubmit(onSubmit)();
        });
        return;
      }

      console.error(error);
      toast.error("Failed to add passkey");
    }
  };

  if (isReAuthenticating) return null;

  return recoveryCodesGenerated ? (
    <RecoveryCodesDialog
      onOpenChange={(open) => {
        if (!open) {
          queryClient.invalidateQueries({ queryKey: ["2fa"] });
        }
        setRecoveryCodesGenerated(open);
      }}
    />
  ) : (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          Add
        </Button>
      </DialogTrigger>
      <DialogContent>
        <AlertDialogHeader>
          <DialogTitle>Add Passkey</DialogTitle>
          <DialogDescription>
            Add a passkey to your account. Passkeys are secure, fast, and easy
            to use.
          </DialogDescription>
        </AlertDialogHeader>
        <form
          className="mt-3 flex w-full flex-col gap-5"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="My Passkey"
              {...register("name")}
            />
            {errors.name ? (
              <p className="text-destructive text-sm">{errors.name.message}</p>
            ) : null}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="animate-spin" /> : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
