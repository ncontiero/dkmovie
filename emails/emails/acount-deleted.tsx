import { HelloText } from "@/components/hello-text";
import { Layout } from "@/components/layout";
import { Text } from "@/components/text";
import { translate } from "@/utils/translate";

export default function AccountDeletedEmail() {
  const title = translate("Account Deleted");
  const text = translate("Your account has been deleted.");

  return (
    <Layout title={title} previewText={text}>
      <HelloText />

      <Text className="mt-2 text-sm">
        {translate(
          "Your account has been deleted. All your data has been permanently removed.",
        )}
      </Text>

      <Text className="mt-2 mb-0 text-sm">
        {translate("If you have any questions, please contact us.")}
      </Text>

      <Text className="mt-2 text-sm">
        {translate("Thank you for using our service.")}
      </Text>
    </Layout>
  );
}
