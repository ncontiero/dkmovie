import { createFileRoute } from "@tanstack/react-router";
import { generateMetadata } from "@/utils/metadata";
import { SecurityTabsContent } from "./-security-tabs";

export const Route = createFileRoute("/account/(my-account)/security")({
  component: SecurityPageComponent,
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) =>
    generateMetadata({
      metadataTranslations,
      title: metadataTranslations("security"),
    }),
});

function SecurityPageComponent() {
  return <SecurityTabsContent />;
}
