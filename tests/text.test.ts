import { describe, expect, it } from "vitest";
import { findSimilar, normalizeName } from "../src/lib/text";

describe("normalizeName", () => {
  it("met en minuscules, enlève accents et ponctuation", () => {
    expect(normalizeName("  Écran   KG5 ")).toBe("ecran kg5");
    expect(normalizeName("Sac de riz (50kg)")).toBe("sac de riz 50kg");
  });
});

describe("findSimilar", () => {
  const items = [{ name: "Riz 50kg" }, { name: "Afficheur KG5" }, { name: "Pochette Itel A100" }, { name: "Huile 1L" }];

  it("propose le produit existant malgré une autre écriture", () => {
    expect(findSimilar("riz 50 kg", items)[0].name).toBe("Riz 50kg");
    expect(findSimilar("aficheur kg5", items)[0].name).toBe("Afficheur KG5");
    expect(findSimilar("itel a100", items)[0].name).toBe("Pochette Itel A100");
  });

  it("trouve par début de mot", () => {
    expect(findSimilar("poch", items).map((i) => i.name)).toEqual(["Pochette Itel A100"]);
  });

  it("ne propose rien de hors sujet", () => {
    expect(findSimilar("chargeur", items)).toEqual([]);
  });
});
