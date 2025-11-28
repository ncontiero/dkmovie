import { USERNAME_VALUE } from "@/utils/constants";
import { translate, translateWithUsername } from "@/utils/translate";
import { Text } from "./text";

export function HelloText() {
  return (
    <Text className="mb-0 text-sm">
      {`{% if ${USERNAME_VALUE} %}`}
      {translateWithUsername("Hello, <strong>{{name}}</strong>!")}
      {`{% else %}`}
      {translate("Hello.")}
      {`{% endif %}`}
    </Text>
  );
}
