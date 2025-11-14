import { PageError } from "@/components/page-error";

export default function PageNotFound() {
  return (
    <PageError
      title="Page not found"
      description="This is not the page you were looking for."
    />
  );
}
