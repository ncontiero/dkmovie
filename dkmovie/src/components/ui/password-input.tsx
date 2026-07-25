import { type ComponentProps, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "use-intl";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";

export function PasswordInput(props: ComponentProps<"input">) {
  const t = useTranslations("common.actions");
  const [showPassword, setShowPassword] = useState(false);
  const label = showPassword ? t("hidePassword") : t("showPassword");

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <InputGroup>
      <InputGroupInput {...props} type={showPassword ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={label}
          title={label}
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
