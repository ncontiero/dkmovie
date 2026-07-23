import { forwardRef, useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { type ButtonProps, Button } from "./button";

interface CopyButtonProps extends Omit<ButtonProps, "asChild"> {
  readonly value: string;
  readonly timeout?: number;
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(
  ({ value, timeout = 2000, children, ...props }, ref) => {
    const [hasCopied, setHasCopied] = useState(false);

    const handleCopy = useCallback(() => {
      navigator.clipboard.writeText(value);
      setHasCopied(true);
      setTimeout(setHasCopied, timeout, false);
    }, [timeout, value]);

    return (
      <Button
        type="button"
        ref={ref}
        disabled={hasCopied}
        {...props}
        onClick={handleCopy}
      >
        {hasCopied ? <Check /> : <Copy />}
        {children}
      </Button>
    );
  },
);
CopyButton.displayName = "CopyButton";
