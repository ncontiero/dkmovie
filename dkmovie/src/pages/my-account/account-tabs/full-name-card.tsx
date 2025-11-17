import { useState } from "react";
import { type SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardFooter,
  CardFooterDescription,
} from "@/components/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type UpdateMeSchema,
  getMe,
  updateMe,
  updateMeSchema,
} from "@/http/account/me";
import { HTTPError } from "@/http/client";

export function FullNameCard() {
  const queryClient = useQueryClient();
  const [apiErrors, setApiErrors] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return await getMe();
    },
    staleTime: 60 * 60 * 1000,
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(updateMeSchema),
    values: {
      name: user?.name || "",
    },
  });

  const watchedValues = useWatch({
    control,
  });

  const onSubmit: SubmitHandler<UpdateMeSchema> = async (data) => {
    try {
      const res = await updateMe(data);
      queryClient.setQueryData(["user"], res);
      setApiErrors(null);
      toast.success("Full name updated!");
    } catch (error) {
      if (error instanceof HTTPError) {
        console.error(error.data);
        setApiErrors(error.data?.message);
        return;
      }

      console.error(error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <Card asChild>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="flex flex-col p-4 sm:p-6">
          <Label htmlFor="full-name">
            <h3 className="text-lg font-bold">Full Name</h3>
          </Label>
          <Input
            id="full-name"
            type="text"
            className="mt-4"
            placeholder="Your full name"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-destructive mt-1 text-sm">
              {errors.name.message}
            </p>
          ) : null}
          {apiErrors ? (
            <span className="text-destructive mt-1 text-sm">{apiErrors}</span>
          ) : null}
          <p className="text-muted-foreground mt-2 text-sm">
            Please enter your full name, or a display name you are comfortable
            with.
          </p>
        </CardContent>
        <CardFooter>
          <CardFooterDescription>
            Please use 255 characters at maximum.
          </CardFooterDescription>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting || user?.name === watchedValues.name}
          >
            {isSubmitting ? <Loader className="animate-spin" /> : "Save"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
