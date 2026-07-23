import type { TwoFactorAuthSchema } from "@/schemas/auth/2fa";
import type { AuthFormWithCodeProps } from "./types";
import { type Control, type FieldErrors, Controller } from "react-hook-form";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { CodeInput as CodeInputPrimitive } from "../ui/input-otp";

interface CodeInputProps extends AuthFormWithCodeProps {
  readonly control: Control<TwoFactorAuthSchema>;
  readonly errors: FieldErrors<TwoFactorAuthSchema>;
  readonly onComplete?: () => void;
}

export function CodeInput({
  type,
  description,
  control,
  errors,
  onComplete,
}: CodeInputProps) {
  return (
    <>
      <div className="flex w-full items-center justify-center">
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <CodeInputPrimitive
              {...field}
              id={`${type}-code`}
              aria-label={description}
              codeLength={type === "totp" ? 6 : 8}
              pattern={REGEXP_ONLY_DIGITS}
              autoFocus
              onComplete={onComplete}
            />
          )}
        />
      </div>
      {errors.code ? (
        <p className="text-sm text-destructive">{errors.code.message}</p>
      ) : null}
    </>
  );
}
