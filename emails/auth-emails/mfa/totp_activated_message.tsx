import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { SITE_NAME, USERNAME } from "@/utils/constants";

interface TotpActivatedProps {
  readonly username?: string;
  readonly siteName?: string;
}

export default function TotpActivated({
  username = USERNAME,
  siteName = SITE_NAME,
}: TotpActivatedProps) {
  const title = "Authenticator App Activated";
  const text = `Hello, ${username}. An authenticator app has been activated for your ${siteName} account.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text>
        Hello, <strong>{username}</strong>.
      </Text>

      <Text>
        An authenticator app has been activated for your{" "}
        <strong>{siteName}</strong> account.
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
