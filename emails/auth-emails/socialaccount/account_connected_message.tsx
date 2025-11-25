import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { SITE_NAME, USERNAME } from "@/utils/constants";

interface AccountConnectedProps {
  readonly username?: string;
  readonly provider?: string;
  readonly siteName?: string;
}

export default function AccountConnected({
  username = USERNAME,
  provider = "{{ provider }}",
  siteName = SITE_NAME,
}: AccountConnectedProps) {
  const title = "Account Connected";
  const text = `A third-party account from ${provider} has been connected to your ${siteName} account.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text className="mb-0 text-sm">
        Hello, <strong>{username}</strong>.
      </Text>

      <Text className="mt-2 text-sm">
        A third-party account from <strong>{provider}</strong> has been
        connected to your <strong>{siteName}</strong> account.
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
