import { createFileRoute, Outlet } from "@tanstack/react-router";
import { generateMetadata } from "@/utils/metadata";

export const Route = createFileRoute("/auth/2fa")({
  component: MFALayoutComponent,
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) =>
    generateMetadata({
      metadataTranslations,
      title: metadataTranslations("2fa"),
    }),
});

function MFALayoutComponent() {
  return <Outlet />;
}
