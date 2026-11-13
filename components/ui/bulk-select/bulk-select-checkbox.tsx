"use client";

import React, { useEffect, useRef } from "react";

export interface BulkSelectCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
  label?: string;
}

export function BulkSelectCheckbox({
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  className = "",
  label,
  id,
  ...props
}: BulkSelectCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate && !checked);
    }
  }, [indeterminate, checked]);

  const checkbox = (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      id={id}
      aria-checked={indeterminate && !checked ? "mixed" : checked}
      className={`h-4 w-4 rounded border-border/80 text-primary focus:ring-2 focus:ring-primary/20 accent-primary cursor-pointer transition-all disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    />
  );

  if (!label) {
    return checkbox;
  }

  return (
    <label
      htmlFor={id}
      className="inline-flex items-center gap-2 cursor-pointer text-xs select-none"
    >
      {checkbox}
      <span className="text-foreground">{label}</span>
    </label>
  );
}
