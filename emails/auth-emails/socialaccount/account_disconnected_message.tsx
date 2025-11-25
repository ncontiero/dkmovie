import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { SITE_NAME, USERNAME } from "@/utils/constants";
import { Layout } from "../../components/layout";
import { Text } from "../../components/text";

interface AccountDisconnectedProps {
  readonly username?: string;
  readonly provider?: string;
  readonly siteName?: string;
}

export default function AccountDisconnected({
  username = USERNAME,
  provider = "{{ provider }}",
  siteName = SITE_NAME,
}: AccountDisconnectedProps) {
  const title = "Account Disconnected";
  const text = `A third-party account from ${provider} has been disconnected from your ${siteName} account.`;

  return (
    <Layout title={title} previewText={text} siteName={siteName}>
      <Text className="mb-0 text-sm">
        Hello, <strong>{username}</strong>.
      </Text>

      <Text className="mt-2 text-sm">
        The third-party account from <strong>{provider}</strong> has been
        disconnected from your <strong>{siteName}</strong> account.
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
