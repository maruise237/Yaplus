"use client";

import { useEffect, useState } from "react";
import { isCloudConfigured } from "@/lib/cloud";

// Numéro WhatsApp du support, réglé dans le panneau admin. Sans lui, les liens WhatsApp du support sont cachés.
let supportNumber: Promise<string | null> | null = null;

function fetchSupportWhatsapp(): Promise<string | null> {
  supportNumber ??= fetch("/api/settings")
    .then((r) => (r.ok ? r.json() : null))
    .then((d: { supportWhatsapp?: string | null } | null) => d?.supportWhatsapp ?? null)
    .catch(() => ((supportNumber = null), null));
  return supportNumber;
}

export function useSupportWhatsapp(): string | null {
  const [number, setNumber] = useState<string | null>(null);
  useEffect(() => {
    if (isCloudConfigured) void fetchSupportWhatsapp().then(setNumber);
  }, []);
  return number;
}
