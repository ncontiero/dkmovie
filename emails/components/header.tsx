import { Heading, Section } from "@react-email/components";
import { SITE_NAME } from "@/utils/constants";

interface HeaderProps {
  readonly siteName?: string;
}

export function Header({ siteName = SITE_NAME }: HeaderProps) {
  return (
    <Section>
      <Heading className="text-primary mx-0 mt-7 mb-5 p-0 text-center text-3xl font-bold">
        {siteName}
      </Heading>
    </Section>
  );
}
