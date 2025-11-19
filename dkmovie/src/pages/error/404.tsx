import { AlertTriangle } from "lucide-react";
import { PageError } from "@/components/page-error";

export default function PageNotFound() {
  return (
    <PageError
      code={404}
      title="Page Not Found"
      description="Sorry, we couldn't find the page you're looking for. It may have been moved or deleted."
      Icon={AlertTriangle}
    />
  );
}
