import { ShieldBan } from "lucide-react";
import { PageError } from "@/components/page-error";

export default function ForbiddenPage() {
  return (
    <PageError
      code={403}
      title="Forbidden"
      description="You don't have the necessary permissions to view this page. This might be due to insufficient access rights or a restricted area."
      Icon={ShieldBan}
    />
  );
}
