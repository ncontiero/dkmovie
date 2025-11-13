import { Hr, Section, Text } from "@react-email/components";

export function Footer() {
  const team = "DkMovie Team.";

  return (
    <Section>
      <Hr />
      <Text className="text-muted-foreground">
        Best regards,
        <br />
        <span className="font-medium">{team}</span>
      </Text>
    </Section>
  );
}
