export interface AuthWithCodeProps {
  readonly type: "totp" | "recovery_codes";
}

export interface AuthFormWithCodeProps extends AuthWithCodeProps {
  readonly description: string;
  readonly isSubmitting?: boolean;
}
