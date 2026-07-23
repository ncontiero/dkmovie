import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useTranslations } from "use-intl";
import { useSchemaTranslations } from "@/hooks/use-schema-translations";
import { type SearchDialogSchema, searchDialogSchema } from "@/schemas/lists";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";

export function SearchDialog() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const t = useTranslations("search.dialog");

  const navigate = useNavigate();

  const { schemaTranslator } = useSchemaTranslations<SearchDialogSchema>({
    defaultError: t("searchIsRequired"),
  });

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(searchDialogSchema, { error: schemaTranslator }),
  });

  const onSubmit: SubmitHandler<SearchDialogSchema> = async (data) => {
    await navigate({ to: "/search", search: { search: data.search, page: 1 } });
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="invert"
          size="icon"
          className="rounded-full hover:bg-foreground/20"
          aria-label={t("label")}
        >
          <Search />
        </Button>
      </DialogTrigger>
      <DialogContent className="top-[15%] max-w-2xl" addClose={false}>
        <DialogHeader className="sr-only">
          <DialogTitle>{t("label")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <InputGroup className="h-12">
            <InputGroupInput
              type="text"
              placeholder={t("label")}
              disabled={isSubmitting}
              {...register("search")}
            />
            <InputGroupAddon>
              {isSubmitting ? <Spinner /> : <Search />}
            </InputGroupAddon>
          </InputGroup>
          {errors.search ? (
            <p className="mt-2 text-sm text-destructive">
              {errors.search.message}
            </p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
