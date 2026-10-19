"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";
import { useFieldError } from "./FormShell";

type Base = { form: string; name: string; label: string; hint?: string; required?: boolean; wide?: boolean };

function FieldFrame({ id, label, hint, error, required, wide, children }: Omit<Base, "form" | "name"> & { id: string; error?: string; children: ReactNode }) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="block text-sm font-semibold">
        {label}
        {required ? <span aria-hidden="true" className="text-danger"> *</span> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function a11y(id: string, hint?: string, error?: string, required?: boolean) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  return {
    id,
    "aria-invalid": error ? (true as const) : undefined,
    "aria-describedby": describedBy || undefined,
    "aria-required": required || undefined,
  };
}

export function TextField({ form, name, label, hint, required, wide, ...input }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const id = `${form}-${name}`;
  const error = useFieldError(name);
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required} wide={wide}>
      <input name={name} className="field-input" {...a11y(id, hint, error, required)} {...input} />
    </FieldFrame>
  );
}

export function SelectField({ form, name, label, hint, required, wide, options }: Base & { options: { value: string; label: string }[] }) {
  const id = `${form}-${name}`;
  const error = useFieldError(name);
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required} wide={wide}>
      <select name={name} className="field-input" defaultValue="" {...a11y(id, hint, error, required)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldFrame>
  );
}

export function TextAreaField({ form, name, label, hint, required, maxLength }: Base & { maxLength: number }) {
  const id = `${form}-${name}`;
  const error = useFieldError(name);
  return (
    <FieldFrame id={id} label={label} hint={hint} error={error} required={required} wide>
      <textarea name={name} rows={4} maxLength={maxLength} className="field-input" {...a11y(id, hint, error, required)} />
    </FieldFrame>
  );
}

export function ConsentField({ form, children }: { form: string; children: ReactNode }) {
  const id = `${form}-consentement`;
  const error = useFieldError("consentement");
  const hintId = useId();
  return (
    <div className="sm:col-span-2">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          name="consentement"
          id={id}
          className="mt-1 h-5 w-5 shrink-0 accent-[var(--color-accent)]"
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, error ? `${id}-error` : ""].filter(Boolean).join(" ")}
        />
        <label htmlFor={id} className="text-sm">
          J&apos;accepte que mes informations soient utilisées pour répondre à ma demande. <span aria-hidden="true" className="text-danger">*</span>
        </label>
      </div>
      <p id={hintId} className="mt-2 pl-8 text-xs text-muted">
        {children}
      </p>
      {error ? (
        <p id={`${id}-error`} className="mt-1 pl-8 text-sm font-medium text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
