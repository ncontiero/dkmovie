import { TriangleAlert } from "lucide-react";
import { PageError } from "@/components/page-error";

export default function BadRequestPage() {
  return (
    <PageError
      code={400}
      title="Bad Request"
      description="This usually happens due to invalid syntax, a malformed URL, or a client-side error. Please check your action and try again."
      Icon={TriangleAlert}
    />
  );
}
