import { useState } from "react";

import { type SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader, Plus } from "lucide-react";
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
import {
  type AddEmailSchema,
  addEmail,
  addEmailSchema,
} from "@/http/account/emails";
import { HTTPError } from "@/http/client";

export function AddEmailDialog() {
  const queryClient = useQueryClient();
  const [apiErrors, setApiErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addEmailSchema),
  });

  const onSubmit: SubmitHandler<AddEmailSchema> = async (data) => {
    try {
      const res = await addEmail(data);
      queryClient.setQueryData(["user-emails"], res.data);
      toast.success("Email added!", {
        description: "You will receive an email with a verification code.",
      });
      setApiErrors([]);
      setTimeout(() => {
        navigate("/account/verify-email");
      }, 1000);
    } catch (error) {
      if (error instanceof HTTPError) {
        console.error(error.data);
        setApiErrors(error.data?.errors?.map((e: any) => e.message) || []);
        return;
      }

      console.error(error);
      toast.error("Something went wrong!");
      return;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-4 w-fit"
        >
          <Plus />
          Add email
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Email</DialogTitle>
          <DialogDescription>
            Add a new email address to your account. This email, once verified,
            can be used to login to your account.
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
            {apiErrors ? (
              <span className="text-destructive mt-1 text-sm">{apiErrors}</span>
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
