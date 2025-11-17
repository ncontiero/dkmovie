import { type ComponentProps, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "./input-group";

export function PasswordInput(props: ComponentProps<"input">) {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <InputGroup>
      <InputGroupInput {...props} type={showPassword ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          aria-label={`${showPassword ? "Hide" : "Show"} password`}
          title={`${showPassword ? "Hide" : "Show"} password`}
          onClick={togglePasswordVisibility}
        >
          {showPassword ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
