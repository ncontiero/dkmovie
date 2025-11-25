import { Section } from "@react-email/components";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { SITE_NAME, USERNAME } from "@/utils/constants";
import { Layout } from "../components/layout";
import { Text } from "../components/text";

interface EmailDeletedProps {
  readonly username?: string;
  readonly siteName?: string;
  readonly removedEmail?: string;
}

export default function EmailDeleted({
  username = USERNAME,
  siteName = SITE_NAME,
  removedEmail = "{{ deleted_email }}",
}: EmailDeletedProps) {
  const title = "Email Address Removed";
  const text = `Hello, ${username}. We are sending this message to notify you that an email address has been removed from your ${siteName} account.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text className="mb-0 text-sm">
        Hello, <strong>{username}</strong>.
      </Text>

      <Text className="mt-2 text-sm">
        We are writing to notify you that an email address has been removed from
        your <strong>{siteName}</strong> account.
      </Text>

      <Section className="bg-muted border-border my-5 rounded-sm border p-5 text-center">
        <Text className="text-muted-foreground m-0 mb-2.5 text-xs font-bold tracking-wider uppercase">
          Removed Email
        </Text>
        <Text className="text-destructive m-0 font-mono text-base font-bold line-through">
          {removedEmail}
        </Text>
      </Section>

      <Text className="text-sm">
        You will no longer be able to use this email address to log in or
        recover your account.
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
