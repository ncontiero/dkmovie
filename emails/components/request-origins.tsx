import { Section } from "react-email";
import { translate } from "@/utils/translate";
import { Text } from "./text";

interface RequestOriginsProps {
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly timestamp?: string;
}

export function RequestOrigins({
  ipAddress = "{{ ip }}",
  userAgent = "{{ user_agent }}",
  timestamp = "{{ timestamp }}",
}: RequestOriginsProps) {
  const title = translate("The change to your account originated from:");

  return (
    <Section className="mt-5">
      <Text className="m-0 mb-2 text-sm font-semibold">{title}</Text>

      <div className="bg-muted border-border rounded-sm border p-4">
        <Text className="m-0 text-sm">
          <span className="block">
            <strong>{translate("IP Address:")}</strong> {ipAddress}
          </span>
          <span className="block">
            <strong>{translate("User Agent:")}</strong> {userAgent}
          </span>
          <span className="block">
            <strong>{translate("Date:")}</strong> {timestamp}
          </span>
        </Text>
      </div>
    </Section>
  );
}
