import { apiAuthBasePath } from "@/http/client";
import { getCookie } from "@/utils/get-cookie";
import { Button } from "../ui/button";

export function GoogleProvider({
  process = "login",
}: {
  readonly process?: "login" | "connect";
}) {
  const actionUrl = `${apiAuthBasePath}/auth/provider/redirect`;
  const csrfToken = getCookie("csrftoken");

  return (
    <form method="POST" action={actionUrl}>
      <input type="hidden" name="provider" value="google" />
      <input
        type="hidden"
        name="callback_url"
        value="/account/provider/callback"
      />
      <input type="hidden" name="process" value={process} />
      <input type="hidden" name="csrfmiddlewaretoken" value={csrfToken} />
      <Button type="submit" variant="outline" size="sm">
        Continue with Google
      </Button>
    </form>
  );
}
