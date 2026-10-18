"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveSheet } from "./ResponsiveSheet";

// Remplace prompt() : renommer une page, une boutique, son prénom…
export function TextFieldDialog({
  open,
  onOpenChange,
  title,
  label,
  initialValue = "",
  placeholder,
  submitLabel = "Enregistrer",
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  label: string;
  initialValue?: string;
  placeholder?: string;
  submitLabel?: string;
  onSubmit: (value: string) => void | Promise<void>;
}) {
  return (
    <ResponsiveSheet open={open} onOpenChange={onOpenChange} title={title}>
      {open && (
        <Form label={label} initialValue={initialValue} placeholder={placeholder} submitLabel={submitLabel} onSubmit={onSubmit} onDone={() => onOpenChange(false)} />
      )}
    </ResponsiveSheet>
  );
}

function Form({
  label,
  initialValue,
  placeholder,
  submitLabel,
  onSubmit,
  onDone,
}: {
  label: string;
  initialValue: string;
  placeholder?: string;
  submitLabel: string;
  onSubmit: (value: string) => void | Promise<void>;
  onDone: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState(false);

  return (
    <form
      className="grid gap-4 pb-2"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!value.trim()) return setError(true);
        await onSubmit(value.trim());
        onDone();
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="text-field">{label}</Label>
        <Input
          id="text-field"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setError(false);
          }}
          placeholder={placeholder}
          aria-invalid={error}
          autoComplete="off"
        />
        {error && <p className="text-sm text-destructive">Ce champ ne peut pas être vide.</p>}
      </div>
      <Button type="submit" size="touch-lg">
        {submitLabel}
      </Button>
    </form>
  );
}
