import { Layout } from "../components/layout";
import { Text } from "../components/text";

export default function WelcomeEmail() {
  const title = "Welcome to DkMovie!";
  const text = "Thank you for joining DkMovie!";

  return (
    <Layout title={title} previewText={text}>
      <Text>{text}</Text>
    </Layout>
  );
}
