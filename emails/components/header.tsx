import { Heading, Section } from "react-email";
import { SITE_NAME } from "@/utils/constants";

interface HeaderProps {
  readonly siteName?: string;
}

export function Header({ siteName = SITE_NAME }: HeaderProps) {
  return (
    <Section>
      <Heading className="mx-0 mt-7 mb-5 p-0 text-center text-3xl font-bold text-primary">
        {siteName}
      </Heading>
    </Section>
  );
}
