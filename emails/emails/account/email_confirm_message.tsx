import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { SITE_NAME, USERNAME } from "@/utils/constants";

interface EmailConfirmProps {
  readonly username?: string;
  readonly siteName?: string;
}

export default function EmailConfirm({
  username = USERNAME,
  siteName = SITE_NAME,
}: EmailConfirmProps) {
  const title = "Email Successfully Verified";
  const text = `Hello, ${username}. We are sending this message to confirm that the email address associated with your ${siteName} account has been changed.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text className="mb-0 text-sm">
        Hello, <strong>{username}</strong>.
      </Text>

      <Text className="mt-2 text-sm">
        Great news! Your email address has been successfully confirmed. You now
        have full access to all features on <strong>{siteName}</strong>.
      </Text>

      <Text className="text-sm">
        You can now start watching your favorite movies and series without
        interruption.
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
