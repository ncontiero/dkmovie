import { Section } from "@react-email/components";
import { Text } from "./text";

interface RequestOriginsProps {
  readonly ipAddress?: string;
  readonly userAgent?: string;
  readonly timestamp?: string;
  readonly isRequested?: boolean;
}

export function RequestOrigins({
  ipAddress = "{{ ip }}",
  userAgent = "{{ user_agent }}",
  timestamp = "{{ timestamp }}",
  isRequested = false,
}: RequestOriginsProps) {
  return (
    <Section className="mt-5">
      <Text className="m-0 mb-2 text-sm font-semibold">
        The{" "}
        {isRequested
          ? "request originated"
          : "change to your account originates"}{" "}
        from:
      </Text>

      <div className="bg-muted border-border rounded-sm border p-4">
        <Text className="m-0 text-sm">
          <span className="block">
            <strong>IP Address:</strong> {ipAddress}
          </span>
          <span className="block">
            <strong>User Agent:</strong> {userAgent}
          </span>
          <span className="block">
            <strong>Date:</strong> {timestamp}
          </span>
        </Text>
      </div>
    </Section>
  );
}
