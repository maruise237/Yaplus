"use client";

import { SignInForm } from "@/components/SignInForm";

export default function ConnexionPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-black text-brand">Yaplus</h1>
        <p className="mt-2 text-lg text-muted">Y&apos;a plus ? Un tap, c&apos;est noté. Le patron voit tout, même absent.</p>
      </div>
      <SignInForm />
    </div>
  );
}
