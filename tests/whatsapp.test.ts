import { describe, expect, it } from "vitest";
import { buildShareMessage, normalizePhone, whatsappLink } from "../src/lib/whatsapp";

describe("normalizePhone", () => {
  it("ajoute +237 par défaut", () => {
    expect(normalizePhone("6 99 00 11 22")).toBe("237699001122");
    expect(normalizePhone("699-00-11-22")).toBe("237699001122");
  });
  it("garde un numéro déjà international", () => {
    expect(normalizePhone("+237 699 00 11 22")).toBe("237699001122");
    expect(normalizePhone("00237699001122")).toBe("237699001122");
    expect(normalizePhone("237699001122")).toBe("237699001122");
    expect(normalizePhone("+33 6 12 34 56 78")).toBe("33612345678");
  });
  it("refuse un numéro vide ou trop court", () => {
    expect(normalizePhone("")).toBeNull();
    expect(normalizePhone("12")).toBeNull();
  });
});

describe("buildShareMessage", () => {
  it("formate par catégorie avec en-tête boutique et date", () => {
    const msg = buildShareMessage(
      "Boutique Akwa",
      [
        { category: "Afficheurs", items: [{ name: "KG5" }] },
        { category: "Vide", items: [] },
        { category: "Accessoires", items: [{ name: "Pochette Itel A100", note: "x3" }] },
      ],
      new Date("2026-10-18T10:00:00Z"),
    );
    expect(msg).toBe("*Boutique Akwa* · À racheter\n18/10/2026\n\n*Afficheurs*\n- KG5\n\n*Accessoires*\n- Pochette Itel A100 (x3)");
    expect(whatsappLink(msg, "237699001122")).toMatch(/^https:\/\/wa\.me\/237699001122\?text=\*Boutique%20Akwa\*/);
  });
});
