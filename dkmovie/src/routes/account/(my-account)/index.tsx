import { createFileRoute } from "@tanstack/react-router";
import { generateMetadata } from "@/utils/metadata";
import { AccountTabsContent } from "./-account-tabs";

export const Route = createFileRoute("/account/(my-account)/")({
  component: MyAccountComponent,
  head: ({
    match: {
      context: { metadataTranslations },
    },
  }) =>
    generateMetadata({
      metadataTranslations,
      title: metadataTranslations("myAccount"),
    }),
});

function MyAccountComponent() {
  return <AccountTabsContent />;
}
