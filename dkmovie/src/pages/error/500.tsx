import { ServerCrash } from "lucide-react";
import { PageError } from "@/components/page-error";

export default function InternalServerErrorPage() {
  return (
    <PageError
      code={500}
      title="Internal Server Error"
      description="We track these errors automatically, but if the problem persists feel free to contact us. In the meantime, try refreshing."
      Icon={ServerCrash}
    />
  );
}
