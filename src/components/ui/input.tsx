"use client";

import { cn } from "@/lib/utils";
import { type InputHTMLAttributes, type TextareaHTMLAttributes, forwardRef } from "react";

/* ============================================
   Input Component
   ============================================ */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const baseInputStyles = [
  "w-full rounded-lg px-4 py-2.5",
  "bg-[var(--glass-bg)] backdrop-blur-[12px]",
  "border border-[var(--glass-border)]",
  "text-[var(--text-base)] placeholder:text-ancient-aqua/40",
  "transition-all duration-200",
  "focus:outline-none focus:border-ancient-teal/50",
  "input-focus-glow",
  "disabled:opacity-50 disabled:cursor-not-allowed",
].join(" ");

const errorInputStyles =
  "border-red-500/60 focus:border-red-400 focus:shadow-[0_0_10px_rgba(239,68,68,0.15)]";

/**
 * Glass-styled input field with optional label and error state.
 * Client Component -- handles value/onChange interactivity.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ label, error, className, id, ...props }, ref) {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm text-ancient-aqua/70 font-medium"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            baseInputStyles,
            error && errorInputStyles,
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

/* ============================================
   Textarea Component
   ============================================ */

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

/**
 * Glass-styled textarea with optional label and error state.
 * Client Component -- handles value/onChange interactivity.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ label, error, className, id, ...props }, ref) {
    const textareaId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm text-ancient-aqua/70 font-medium"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            baseInputStyles,
            "min-h-[100px] resize-y",
            error && errorInputStyles,
            className,
          )}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${textareaId}-error`}
            className="text-sm text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
