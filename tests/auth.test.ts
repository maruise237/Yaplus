import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { phoneToLogin, signIn, signUp } from "../src/lib/auth";
import { db } from "../src/lib/db";
import { getSession, signOutLocal } from "../src/lib/session";

beforeEach(async () => {
  await db.delete();
  await db.open();
});

describe("phoneToLogin", () => {
  it("donne le même identifiant quelle que soit l'écriture du numéro", () => {
    const id = "237699001122@tel.yaplus.app";
    expect(phoneToLogin("6 99 00 11 22")).toBe(id);
    expect(phoneToLogin("+237 699 00 11 22")).toBe(id);
    expect(phoneToLogin("00237699001122")).toBe(id);
    expect(phoneToLogin("12")).toBeNull();
  });
});

describe("numéro + mot de passe (mode sur cet appareil)", () => {
  it("inscription puis connexion avec le même numéro, même écrit autrement", async () => {
    await signUp({ name: "Jules", phone: "6 99 00 11 22", password: "123456" });
    const first = await getSession();
    expect(first).toMatchObject({ displayName: "Jules", phone: "+237699001122", mode: "local" });

    await signOutLocal();
    expect(await getSession()).toBeUndefined();

    await signIn({ phone: "+237 699 00 11 22", password: "123456" });
    expect((await getSession())?.userId).toBe(first!.userId);
  });

  it("refuse un mauvais mot de passe, un mot de passe trop court et un numéro déjà pris", async () => {
    await signUp({ name: "Jules", phone: "699001122", password: "123456" });
    await expect(signIn({ phone: "699001122", password: "000000" })).rejects.toThrow("Numéro ou mot de passe incorrect.");
    await expect(signUp({ name: "Paul", phone: "677000000", password: "123" })).rejects.toThrow("au moins 6");
    await expect(signUp({ name: "Paul", phone: "699 00 11 22", password: "abcdef" })).rejects.toThrow("déjà un compte");
  });

  it("ne garde jamais le mot de passe en clair", async () => {
    await signUp({ name: "Jules", phone: "699001122", password: "secret123" });
    expect(JSON.stringify(await db.meta.toArray())).not.toContain("secret123");
  });
});
