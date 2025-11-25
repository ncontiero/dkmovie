import { Hr, Section, Text } from "@react-email/components";
import { SITE_NAME } from "@/utils/constants";

interface FooterProps {
  readonly siteName?: string;
}

export function Footer({ siteName = SITE_NAME }: FooterProps) {
  return (
    <Section>
      <Hr className="border-border mx-0 my-6 w-full border border-solid" />
      <Text className="text-muted-foreground mb-0 text-sm">
        © {new Date().getFullYear()} {siteName}. All rights reserved.
      </Text>
      <Text className="text-muted-foreground mt-1 text-sm">
        {siteName} - Your favorite streaming portal.
      </Text>
    </Section>
  );
}
