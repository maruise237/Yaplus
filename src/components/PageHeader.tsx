import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  aside,
  leading,
  className,
}: {
  title: React.ReactNode;
  aside?: React.ReactNode;
  leading?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex min-h-11 items-center gap-2 md:mb-7", className)}>
      {leading}
      <h1 className="min-w-0 flex-1 truncate text-[1.625rem] leading-tight font-bold tracking-tight md:text-3xl">{title}</h1>
      {aside}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed px-6 py-10 text-center">
      <p className="font-semibold">{title}</p>
      {children && <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">{children}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
