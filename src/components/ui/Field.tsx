import { cn } from "@/lib/cn";
import type {
  InputHTMLAttributes,
  LabelHTMLAttributes,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

export function Label({
  required,
  className,
  children,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-[13px] font-medium text-text-primary",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-danger-600"> *</span>}
    </label>
  );
}

const fieldBase =
  "w-full rounded-lg border border-border-strong bg-surface px-3 h-10 text-sm text-text-primary placeholder:text-text-tertiary transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 disabled:bg-surface-sunken disabled:text-text-tertiary";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBase, "pr-8", className)} {...props}>
      {children}
    </select>
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldBase, "h-auto min-h-24 py-2.5 resize-none", className)}
      {...props}
    />
  );
}

export function FieldHint({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("mt-1 text-xs text-text-tertiary", className)}>{children}</p>;
}

export function FieldError({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1 text-xs text-danger-600">{children}</p>;
}
