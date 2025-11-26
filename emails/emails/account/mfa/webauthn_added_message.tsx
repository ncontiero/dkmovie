import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { SITE_NAME, USERNAME } from "@/utils/constants";

interface WebauthnAddedProps {
  readonly username?: string;
  readonly siteName?: string;
}

export default function WebauthnAdded({
  username = USERNAME,
  siteName = SITE_NAME,
}: WebauthnAddedProps) {
  const title = "New Security Key Added";
  const text = `Hello, ${username}. A new security key has been added to your ${siteName} account.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text>
        Hello, <strong>{username}</strong>.
      </Text>

      <Text>
        A new security key has been added to your <strong>{siteName}</strong>{" "}
        account.
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
