import { type ComponentProps, use } from "react";
import { type OTPInputProps, OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";

function InputOTP({
  className,
  containerClassName,
  ...props
}: ComponentProps<typeof OTPInput> & {
  containerClassName?: string;
}) {
  return (
    <OTPInput
      data-slot="input-otp"
      containerClassName={cn(
        "flex items-center gap-2 has-disabled:opacity-50",
        containerClassName,
      )}
      className={cn("disabled:cursor-not-allowed", className)}
      spellCheck={false}
      {...props}
    />
  );
}

function InputOTPGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex items-center", className)}
      {...props}
    />
  );
}

function InputOTPSlot({
  index,
  className,
  ...props
}: ComponentProps<"div"> & {
  index: number;
}) {
  const inputOTPContext = use(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        `
          relative flex size-10 items-center justify-center border-y border-r border-input text-sm transition-all
          first:rounded-l-md first:border-l last:rounded-r-md
        `,
        isActive && "z-10 ring-2 ring-ring ring-offset-background",
        className,
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
}

function InputOTPSeparator(props: ComponentProps<"div">) {
  return (
    <div data-slot="input-otp-separator" role="separator" {...props}>
      <Dot />
    </div>
  );
}

type CodeInputProps = Omit<OTPInputProps, "maxLength"> & {
  codeLength?: number;
};

function CodeInput({
  codeLength = 6,
  render: _render,
  ...props
}: CodeInputProps) {
  const codesSlot = Array.from({ length: codeLength });

  return (
    <InputOTP {...props} maxLength={codesSlot.length}>
      <InputOTPGroup>
        {codesSlot.map((_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>
  );
}

export { CodeInput, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
