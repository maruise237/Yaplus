"use client";

import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Field = { key: string; label: string; unit: string; example: string; optional?: boolean };
type Result = { label: string; value: string; strong?: boolean };
type Spec = { fields: Field[]; compute: (v: Record<string, number>) => Result[] | string };

// Espace insécable ordinaire entre les milliers : l'espace fine de fr-FR n'a pas de largeur dans Outfit.
const group = (n: number) => n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }).replace(/\u202f/g, "\u00a0");
const fcfa = (n: number) => `${group(Math.round(n))}\u00a0FCFA`;
const pct = (n: number) => `${n.toLocaleString("fr-FR", { maximumFractionDigits: 1 })}\u00a0%`;
const units = (n: number) => group(Math.ceil(n));

const SPECS: Record<string, Spec> = {
  "calcul-de-marge": {
    fields: [
      { key: "achat", label: "Prix d’achat", unit: "FCFA", example: "1500" },
      { key: "vente", label: "Prix de vente", unit: "FCFA", example: "2500" },
    ],
    compute: ({ achat, vente }) => {
      if (achat <= 0 || vente <= 0) return "Entre un prix d’achat et un prix de vente plus grands que zéro.";
      const marge = vente - achat;
      return [
        { label: "Marge par article", value: fcfa(marge), strong: true },
        { label: "Taux de marge", value: pct((marge / achat) * 100) },
        { label: "Taux de marque", value: pct((marge / vente) * 100) },
      ];
    },
  },
  "prix-de-vente": {
    fields: [
      { key: "achat", label: "Prix d’achat", unit: "FCFA", example: "2000" },
      { key: "frais", label: "Frais par article", unit: "FCFA", example: "150", optional: true },
      { key: "taux", label: "Marge voulue", unit: "%", example: "40" },
    ],
    compute: ({ achat, frais = 0, taux }) => {
      if (achat <= 0 || taux < 0) return "Entre un prix d’achat et une marge.";
      const cout = achat + frais;
      const prix = cout * (1 + taux / 100);
      return [
        { label: "Prix arrondi", value: fcfa(Math.ceil(prix / 25) * 25), strong: true },
        { label: "Prix exact", value: fcfa(prix) },
        { label: "Coût en boutique", value: fcfa(cout) },
      ];
    },
  },
  "point-de-commande": {
    fields: [
      { key: "ventes", label: "Ventes par jour", unit: "pièces", example: "4" },
      { key: "delai", label: "Délai de livraison", unit: "jours", example: "3" },
      { key: "securite", label: "Stock de sécurité", unit: "pièces", example: "4", optional: true },
    ],
    compute: ({ ventes, delai, securite = 0 }) => {
      if (ventes <= 0 || delai < 0) return "Entre tes ventes par jour et le délai de livraison.";
      const point = ventes * delai + securite;
      return [
        { label: "Point de commande", value: `${units(point)} pièces`, strong: true },
        { label: "Vendu pendant la livraison", value: `${units(ventes * delai)} pièces` },
      ];
    },
  },
  "stock-de-securite": {
    fields: [
      { key: "vmax", label: "Ventes d’un bon jour", unit: "pièces", example: "10" },
      { key: "dmax", label: "Délai quand il y a du retard", unit: "jours", example: "7" },
      { key: "vmoy", label: "Ventes d’un jour normal", unit: "pièces", example: "6" },
      { key: "dmoy", label: "Délai habituel", unit: "jours", example: "4" },
    ],
    compute: ({ vmax, dmax, vmoy, dmoy }) => {
      if (vmax < vmoy || dmax < dmoy) return "Les ventes d’un bon jour et le délai avec retard doivent être au moins égaux aux valeurs normales.";
      const ss = vmax * dmax - vmoy * dmoy;
      return [
        { label: "Stock de sécurité", value: `${units(ss)} pièces`, strong: true },
        { label: "Point de commande avec cette réserve", value: `${units(vmoy * dmoy + ss)} pièces` },
      ];
    },
  },
  "quantite-a-commander": {
    fields: [
      { key: "ventes", label: "Ventes par jour", unit: "pièces", example: "12" },
      { key: "jours", label: "Jours à tenir", unit: "jours", example: "7" },
      { key: "stock", label: "Stock restant", unit: "pièces", example: "20" },
      { key: "securite", label: "Stock de sécurité", unit: "pièces", example: "12", optional: true },
    ],
    compute: ({ ventes, jours, stock = 0, securite = 0 }) => {
      if (ventes <= 0 || jours <= 0) return "Entre tes ventes par jour et le nombre de jours à tenir.";
      const q = ventes * jours + securite - stock;
      if (q <= 0) return [{ label: "Quantité à racheter", value: "Rien pour l’instant : tu as de quoi tenir.", strong: true }];
      return [
        { label: "Quantité à racheter", value: `${units(q)} pièces`, strong: true },
        { label: "Ventes prévues", value: `${units(ventes * jours)} pièces` },
      ];
    },
  },
};

const parse = (s: string) => {
  const n = Number(s.replace(/\s/g, "").replace(",", "."));
  return s.trim() === "" || Number.isNaN(n) ? null : n;
};

// Calcul en direct dans la page : pas de bouton, le résultat suit la saisie.
export function Calculator({ slug }: { slug: string }) {
  const spec = SPECS[slug];
  const id = useId();
  const [values, setValues] = useState<Record<string, string>>(() => Object.fromEntries(spec.fields.map((f) => [f.key, f.example])));

  const numbers: Record<string, number> = {};
  let missing = false;
  for (const f of spec.fields) {
    const n = parse(values[f.key] ?? "");
    if (n === null) {
      if (!f.optional) missing = true;
    } else numbers[f.key] = n;
  }
  const result = missing ? "Remplis les cases pour voir le résultat." : spec.compute(numbers);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-[0_18px_40px_-24px_rgb(16_40_80/0.35),0_2px_6px_-3px_rgb(16_40_80/0.1)]">
      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        {spec.fields.map((f) => (
          <div key={f.key} className="grid gap-2">
            <Label htmlFor={`${id}-${f.key}`} className="text-[15px]">
              {f.label}
              {f.optional && <span className="font-normal text-muted-foreground"> (facultatif)</span>}
            </Label>
            <div className="relative">
              <Input
                id={`${id}-${f.key}`}
                inputMode="decimal"
                autoComplete="off"
                value={values[f.key] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                className="h-12 pr-20 text-[17px] tabular-nums"
              />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[15px] text-muted-foreground">{f.unit}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="border-t bg-secondary/50 p-5 sm:p-6" aria-live="polite">
        {typeof result === "string" ? (
          <p className="text-[16px] text-muted-foreground">{result}</p>
        ) : (
          <dl className="grid gap-3">
            {result.map((r) => (
              <div key={r.label} className="flex flex-wrap items-baseline justify-between gap-x-4">
                <dt className="text-[16px] text-muted-foreground">{r.label}</dt>
                <dd className={r.strong ? "text-[26px] font-semibold tracking-tight tabular-nums" : "text-[17px] font-medium tabular-nums"}>{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
