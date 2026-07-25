import { Hr, Section, Text } from "react-email";
import { SITE_NAME } from "@/utils/constants";
import { translate } from "@/utils/translate";

interface FooterProps {
  readonly siteName?: string;
}

const year = new Date().getFullYear();

export function Footer({ siteName = SITE_NAME }: FooterProps) {
  return (
    <Section>
      <Hr className="mx-0 my-6 w-full border border-solid border-border" />
      <Text className="mb-0 text-sm text-muted-foreground">
        © {year} {siteName}. {translate("All rights reserved.")}
      </Text>
      <Text className="mt-1 text-sm text-muted-foreground">
        {siteName} - {translate("Your favorite streaming portal.")}
      </Text>
    </Section>
  );
}
