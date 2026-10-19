import { cn } from "@/lib/utils";

// La colonne des pages publiques, alignée sur la marge du cahier.
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto max-w-6xl pr-4 pl-7 sm:pr-8 sm:pl-11", className)}>{children}</div>;
}

export function PageTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h1 className={cn("max-w-[20ch] text-[clamp(2.25rem,8vw,3.75rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance", className)}>{children}</h1>
  );
}

export function Lead({ children }: { children: React.ReactNode }) {
  return <p className="mt-5 max-w-[36rem] text-[17px] leading-relaxed text-muted-foreground sm:text-[19px]">{children}</p>;
}

export function H2({ id, children, className }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <h2 id={id} className={cn("text-[clamp(1.75rem,5vw,2.25rem)] leading-tight font-semibold tracking-[-0.025em] text-balance", className)}>
      {children}
    </h2>
  );
}
