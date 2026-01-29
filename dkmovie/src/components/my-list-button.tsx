import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "use-intl";
import { useSession } from "@/hooks/use-session";
import { addToMyList, removeFromMyList } from "@/http/account/my-list";
import { type ButtonProps, Button } from "./ui/button";

interface MyListButtonProps extends ButtonProps {
  readonly titleId: string;
  readonly iconClassName?: string;
  readonly isTextHidden?: boolean;
}

export function MyListButton({
  titleId,
  iconClassName,
  isTextHidden = false,
  ...props
}: MyListButtonProps) {
  const t = useTranslations("myListButton");
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useSession();
  const [isMyListUpdating, setIsMyListUpdating] = useState(false);

  const isTitleInMyList = useMemo(() => {
    if (!isAuthenticated || !user) return false;
    return user.my_list.includes(titleId);
  }, [isAuthenticated, titleId, user]);

  const handleAddRemoveMyList = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setIsMyListUpdating(true);

    const isToAdd = !isTitleInMyList;
    try {
      let newList: string[] = [];
      if (isToAdd) {
        newList = await addToMyList(titleId);
      } else {
        newList = await removeFromMyList(titleId);
      }

      queryClient.setQueryData(["session", "me"], {
        ...user,
        my_list: newList,
      });
      queryClient.invalidateQueries({
        queryKey: ["content", "my-list"],
        exact: false,
      });
      toast.success(
        isToAdd ? t("addToMyListSuccess") : t("removeFromMyListSuccess"),
      );
    } catch (error) {
      console.error(error);
      toast.error(
        isToAdd
          ? t("errors.addToMyListFailed")
          : t("errors.removeFromMyListFailed"),
      );
    } finally {
      setIsMyListUpdating(false);
    }
  }, [isAuthenticated, isTitleInMyList, queryClient, t, titleId, user]);

  return isAuthenticated && user ? (
    <Button
      {...props}
      type="button"
      title={isTitleInMyList ? t("removeFromMyList") : t("addToMyList")}
      onClick={handleAddRemoveMyList}
      loading={isMyListUpdating}
    >
      {isTitleInMyList ? (
        <X className={iconClassName} />
      ) : (
        <Plus className={iconClassName} />
      )}
      <span className="sr-only">
        {isTitleInMyList ? t("removeFromMyList") : t("addToMyList")}
      </span>
      {isTextHidden
        ? null
        : isTitleInMyList
          ? t("removeFromMyList")
          : t("myList")}
    </Button>
  ) : null;
}
