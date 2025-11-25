import { Section } from "@react-email/components";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { SITE_NAME, USERNAME } from "@/utils/constants";
import { Layout } from "../components/layout";
import { Text } from "../components/text";

interface EmailChangedProps {
  readonly username?: string;
  readonly oldEmail?: string;
  readonly newEmail?: string;
  readonly siteName?: string;
}

export default function EmailChanged({
  username = USERNAME,
  oldEmail = "{{ from_email }}",
  newEmail = "{{ to_email }}",
  siteName = SITE_NAME,
}: EmailChangedProps) {
  const title = "Email Changed";
  const text = `Hello, ${username}. We are sending this message to confirm that the email address associated with your ${siteName} account has been changed.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text className="mb-0 text-sm">
        Hello, <strong>{username}</strong>.
      </Text>

      <Text className="mt-2 text-sm">
        We are sending this message to confirm that the email address associated
        with your <strong>{siteName}</strong> account has been changed.
      </Text>

      <Section className="bg-muted border-border my-5 rounded-sm border p-3.5">
        <Text className="m-0 mb-2.5 text-sm">
          <strong className="text-muted-foreground text-xs tracking-wider uppercase">
            From:
          </strong>
          <br />
          <span className="font-mono text-base">{oldEmail}</span>
        </Text>

        <Text className="text-primary m-0 mb-2.5 text-lg leading-none">↓</Text>

        <Text className="m-0 text-sm">
          <strong className="text-muted-foreground text-xs tracking-wider uppercase">
            To:
          </strong>
          <br />
          <span className="font-mono text-base font-semibold">{newEmail}</span>
        </Text>
      </Section>

      <Text className="text-sm">
        If you made this change, no further action is required.
      </Text>

      <NotMakeThisChange addResetPassword />
      <RequestOrigins />
    </Layout>
  );
}
