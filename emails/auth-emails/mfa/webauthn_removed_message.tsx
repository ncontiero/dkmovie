import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { SITE_NAME, USERNAME } from "@/utils/constants";

interface WebauthnRemovedProps {
  readonly username?: string;
  readonly siteName?: string;
}

export default function WebauthnRemoved({
  username = USERNAME,
  siteName = SITE_NAME,
}: WebauthnRemovedProps) {
  const title = "Security Key Removed";
  const text = `Hello, ${username}. A security key has been removed from your ${siteName} account.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text>
        Hello, <strong>{username}</strong>.
      </Text>

      <Text>
        A security key has been removed from your <strong>{siteName}</strong>{" "}
        account.
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
