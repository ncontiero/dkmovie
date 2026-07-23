import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
  useContext,
} from "react";
import { type OTPInputProps, OTPInput, OTPInputContext } from "input-otp";
import { Dot } from "lucide-react";
import { cn } from "@/lib/utils";

const InputOTP = forwardRef<
  ComponentRef<typeof OTPInput>,
  ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      "flex items-center gap-2 has-disabled:opacity-50",
      containerClassName,
    )}
    className={cn("disabled:cursor-not-allowed", className)}
    {...props}
  />
));
InputOTP.displayName = "InputOTP";

const InputOTPGroup = forwardRef<
  ComponentRef<"div">,
  ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

const InputOTPSlot = forwardRef<
  ComponentRef<"div">,
  ComponentPropsWithoutRef<"div"> & { readonly index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
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
      {hasFakeCaret ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      ) : null}
    </div>
  );
});
InputOTPSlot.displayName = "InputOTPSlot";

const InputOTPSeparator = forwardRef<
  ComponentRef<"div">,
  ComponentPropsWithoutRef<"div">
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Dot />
  </div>
));
InputOTPSeparator.displayName = "InputOTPSeparator";

type CodeInputProps = Omit<OTPInputProps, "maxLength"> & {
  readonly codeLength?: number;
};

const CodeInput = forwardRef<ComponentRef<typeof OTPInput>, CodeInputProps>(
  ({ codeLength = 6, render: _render, ...props }, ref) => {
    const codesSlot = Array.from({ length: codeLength });

    return (
      <InputOTP ref={ref} {...props} maxLength={codesSlot.length}>
        <InputOTPGroup>
          {codesSlot.map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
    );
  },
);
CodeInput.displayName = "CodeInput";

export { CodeInput, InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot };
