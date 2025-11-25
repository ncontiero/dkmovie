import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { SITE_NAME, USERNAME } from "@/utils/constants";

interface RecoveryCodesGeneratedProps {
  readonly username?: string;
  readonly siteName?: string;
}

export default function RecoveryCodesGenerated({
  username = USERNAME,
  siteName = SITE_NAME,
}: RecoveryCodesGeneratedProps) {
  const title = "Recovery Codes Generated";
  const text = `Hello, ${username}. A new set of Two-Factor Authentication recovery codes has been generated for your ${siteName} account.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text>
        Hello, <strong>{username}</strong>.
      </Text>

      <Text>
        A new set of Two-Factor Authentication recovery codes has been generated
        for your <strong>{siteName}</strong> account.
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
