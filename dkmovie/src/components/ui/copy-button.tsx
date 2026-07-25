import { useCallback, useState } from "react";
import { Check, Copy } from "lucide-react";
import { type ButtonProps, Button } from "./button";

interface CopyButtonProps extends Omit<ButtonProps, "asChild"> {
  value: string;
  timeout?: number;
}

export function CopyButton({
  value,
  timeout = 2000,
  children,
  ...props
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setHasCopied(true);
    setTimeout(setHasCopied, timeout, false);
  }, [timeout, value]);

  return (
    <Button type="button" disabled={hasCopied} {...props} onClick={handleCopy}>
      {hasCopied ? <Check /> : <Copy />}
      {children}
    </Button>
  );
}
