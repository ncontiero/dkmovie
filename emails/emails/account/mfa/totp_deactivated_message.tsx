import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { SITE_NAME, USERNAME } from "@/utils/constants";

interface TotpDeactivatedProps {
  readonly username?: string;
  readonly siteName?: string;
}

export default function TotpDeactivated({
  username = USERNAME,
  siteName = SITE_NAME,
}: TotpDeactivatedProps) {
  const title = "Authenticator App Deactivated";
  const text = `Hello, ${username}. An authenticator app has been deactivated for your ${siteName} account.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text>
        Hello, <strong>{username}</strong>.
      </Text>

      <Text>
        An authenticator app has been deactivated for your{" "}
        <strong>{siteName}</strong> account.
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
