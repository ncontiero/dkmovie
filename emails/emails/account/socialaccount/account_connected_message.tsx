import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { NotMakeThisChange } from "@/components/not-make-this-change";
import { RequestOrigins } from "@/components/request-origins";
import { Text } from "@/components/text";
import { translate, translateWithSiteName } from "@/utils/translate";

interface AccountConnectedProps {
  readonly provider?: string;
}

export default function AccountConnected({
  provider = "{{ provider }}",
}: AccountConnectedProps) {
  const title = translate("Account Connected");
  const text = translate(
    `A third-party account from ${provider} has been connected to your account.`,
  );

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 text-sm">
        {translateWithSiteName(
          `A third-party account from <strong>${provider}</strong> has been connected to your <strong>{{site_name}}</strong> account.`,
        )}
      </Text>

      <NotMakeThisChange />
      <RequestOrigins />
    </Layout>
  );
}
