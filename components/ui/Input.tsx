import { cn } from "@/lib/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-xs font-extrabold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full px-4 py-3 border rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm",
            "bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-[#FF274B] focus:ring-2 focus:ring-[#FF274B]/20",
            "dark:bg-zinc-900/80 dark:border-zinc-800 dark:text-white dark:placeholder:text-zinc-500 dark:focus:bg-zinc-900 dark:focus:border-[#FF274B] dark:focus:ring-2 dark:focus:ring-[#FF274B]/20",
            "focus:outline-none",
            error && "border-red-500 focus:ring-red-500 dark:border-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-red-500 dark:text-red-400 text-xs font-bold mt-1.5">{error}</p>}
        {helperText && !error && (
          <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 font-medium">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
