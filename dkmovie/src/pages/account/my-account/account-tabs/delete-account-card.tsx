import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardFooter } from "@/components/card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-session";
import { deleteMyAccount } from "@/http/account/me";
import {
  type ConfirmDeleteAccountSchema,
  confirmDeleteAccountSchema,
} from "@/schemas/account/delete-account";

export function DeleteAccountCard() {
  const { session, setSession } = useSession();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm({
    resolver: zodResolver(confirmDeleteAccountSchema),
  });

  const onSubmit: SubmitHandler<ConfirmDeleteAccountSchema> = async (data) => {
    if (data.confirmEmail !== session?.user.email) {
      setError("confirmEmail", {
        type: "manual",
        message: "The email you entered does not match your account email.",
      });
      return;
    }

    try {
      await deleteMyAccount();
      setSession(null);
      toast.success("Account deleted successfully.");
      navigate("/");
    } catch {
      toast.error(
        "There was an error deleting your account. Please try again.",
      );
    }
  };

  return (
    <Card className="border-destructive mt-10">
      <CardContent className="flex flex-col p-4 sm:p-6">
        <h3 className="text-lg font-bold">Delete Account</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Permanently delete your account and all associated data. This action
          is not reversible, so please continue with caution.
        </p>
      </CardContent>
      <CardFooter className="bg-destructive/20 border-destructive dark:bg-destructive/20 sm:justify-end">
        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" size="sm" variant="destructive">
              Delete Account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Delete Account
              </DialogTitle>
              <DialogDescription className="text-base font-medium">
                DkMovie will permanently delete your account and all associated
                data.{" "}
                <span className="text-destructive font-bold">
                  This action is irreversible
                </span>
                . Are you sure you want to proceed?
              </DialogDescription>
            </DialogHeader>
            <form
              className="mt-2 flex flex-col gap-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="flex flex-col gap-3">
                <Label
                  htmlFor="confirm-email"
                  className="gap-1 font-normal select-auto"
                >
                  Enter your email
                  <b>{session?.user.email}</b> to continue:
                </Label>
                <Input
                  id="confirm-email"
                  type="text"
                  {...register("confirmEmail")}
                />
                {errors.confirmEmail ? (
                  <p className="text-destructive text-sm">
                    {errors.confirmEmail.message}
                  </p>
                ) : null}
              </div>
              <div className="flex flex-col gap-3">
                <Label
                  htmlFor="confirm-text"
                  className="gap-1 font-normal select-auto"
                >
                  To verify, type <b>delete my account</b> below:
                </Label>
                <Input
                  id="confirm-text"
                  type="text"
                  {...register("confirmText")}
                />
                {errors.confirmText ? (
                  <p className="text-destructive text-sm">
                    {errors.confirmText.message}
                  </p>
                ) : null}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader className="animate-spin" />
                  ) : (
                    "Confirm Delete"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
