import { useState } from "react";

import { type SubmitHandler, useForm } from "react-hook-form";

import { useNavigate } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Loader } from "lucide-react";
import { toast } from "sonner";
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
import { changeEmail } from "@/http/account/emails";
import {
  type ChangeEmailSchema,
  changeEmailSchema,
} from "@/schemas/account/email";
import { getErrorMessage } from "@/utils/errors";

export function ChangeEmailDialog() {
  const [showDialog, setShowDialog] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(changeEmailSchema),
  });

  const onSubmit: SubmitHandler<ChangeEmailSchema> = async (data) => {
    try {
      const res = await changeEmail(data);
      queryClient.setQueryData(["user-emails"], res.data);
      toast.success("Email added!", {
        description: "You will receive an email with a verification code.",
      });
      navigate("/account/verify-email");
    } catch (error) {
      const errors = getErrorMessage(error);
      if (errors) {
        toast.error(errors);
        return;
      }

      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <Edit />
          Change email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Email</DialogTitle>
          <DialogDescription>
            Change to a new email address. You will receive an email with a
            verification code.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="mt-2 flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="new-email@example.com"
              {...register("email")}
            />
            {errors.email ? (
              <p className="text-destructive text-sm">{errors.email.message}</p>
            ) : null}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader className="animate-spin" /> : "Change"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
