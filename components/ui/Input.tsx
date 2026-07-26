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
            className="block text-xs font-bold text-gray-800 dark:text-zinc-200 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl text-sm font-medium",
            "bg-white text-gray-900 placeholder:text-gray-400",
            "dark:bg-zinc-800/90 dark:text-white dark:placeholder:text-zinc-400",
            "focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent",
            "transition-all duration-200 shadow-sm",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-red-500 dark:text-red-400 text-xs font-bold mt-1.5">{error}</p>}
        {helperText && !error && (
          <p className="text-gray-400 dark:text-zinc-400 text-xs mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
