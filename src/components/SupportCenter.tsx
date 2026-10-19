"use client";

import { ArrowUp, ChevronDown, ChevronRight, CircleHelp, House, Lightbulb, MessageCircle, Search, X, type LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/AppShell";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { useSupportWhatsapp } from "@/hooks/use-support-whatsapp";
import { isCloudConfigured } from "@/lib/cloud";
import { FAQ, loadSupport, sendSupport, SUPPORT_MAX_LENGTH, SUPPORT_TOPICS, type SupportThread, type SupportTopic } from "@/lib/support";
import { normalizeName } from "@/lib/text";
import { cn } from "@/lib/utils";
import { whatsappLink } from "@/lib/whatsapp";

export type SupportView = "home" | "messages" | "help";

const DELAY = "On répond en général dans la journée.";
const time = (at: string) => new Date(at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
const day = (at: string) => new Date(at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

// Ombre teintée de bleu, décalée vers le bas : les cartes se posent sur le bandeau.
const raised = "border bg-card shadow-[0_1px_2px_rgb(10_60_110/0.06),0_10px_24px_-14px_rgb(10_60_110/0.28)] dark:shadow-none";

// Centre d'aide : accueil, conversation avec le support, questions fréquentes.
// Plein écran sur téléphone, panneau centré sur grand écran. Sans compte (écran de connexion),
// seules l'aide et WhatsApp restent.
export function SupportCenter({
  open,
  onOpenChange,
  name,
  shopId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string | null;
  shopId: string | null;
}) {
  const canMessage = isCloudConfigured && Boolean(name);
  const whatsapp = useSupportWhatsapp();
  const [view, setView] = useState<SupportView>("home");
  const [thread, setThread] = useState<SupportThread | null>(null);
  const [topic, setTopic] = useState<SupportTopic | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [searchFocus, setSearchFocus] = useState(false);
  const height = useVisualHeight(open);


  // La conversation est relue à l'ouverture, puis toutes les 15 s tant qu'elle est à l'écran.
  useEffect(() => {
    if (!open || !canMessage) return;
    const seen = view === "messages";
    const load = () => loadSupport(seen).then(setThread, () => setThread((t) => t ?? { messages: [], unread: false, closedAt: null }));
    void load();
    if (!seen) return;
    const timer = setInterval(() => document.visibilityState === "visible" && void load(), 15_000);
    return () => clearInterval(timer);
  }, [open, canMessage, view]);

  const go = useCallback((next: SupportView, options: { topic?: SupportTopic; faq?: number; search?: boolean } = {}) => {
    if (options.topic) setTopic(options.topic);
    setFaqOpen(options.faq ?? null);
    setSearchFocus(Boolean(options.search));
    setView(next);
  }, []);

  const whatsappHref = (text: string) => (whatsapp ? whatsappLink(text, whatsapp) : null);
  const tabs: { id: SupportView; label: string; icon: LucideIcon; dot?: boolean }[] = [
    { id: "home", label: "Accueil", icon: House },
    ...(canMessage ? [{ id: "messages" as const, label: "Messages", icon: MessageCircle, dot: thread?.unread }] : []),
    { id: "help", label: "Aide", icon: CircleHelp },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        // Chaque ouverture repart de l'accueil.
        if (!o) setView("home");
        onOpenChange(o);
      }}
    >
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        // Le focus va au panneau, pas au bouton Fermer : pas d'anneau affiché au simple tap.
        onOpenAutoFocus={(e) => (e.preventDefault(), (e.currentTarget as HTMLElement).focus())}
        style={height ? ({ "--vvh": `${height}px` } as React.CSSProperties) : undefined}
        className="top-0 left-0 flex h-[var(--vvh,100dvh)] max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none bg-background p-0 text-base ring-0 sm:max-w-none md:top-1/2 md:left-1/2 md:h-[min(46rem,calc(100dvh-4rem))] md:w-[26rem] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:ring-1"
      >
        <div className="min-h-0 flex-1">
          {view === "home" && (
            <Home
              name={name}
              thread={canMessage ? thread : null}
              canMessage={canMessage}
              whatsappHref={whatsappHref}
              onGo={go}
            />
          )}
          {view === "messages" && canMessage && (
            <Conversation
              name={name ?? ""}
              shopId={shopId}
              thread={thread}
              onThread={setThread}
              topic={topic}
              onTopic={setTopic}
              whatsappHref={whatsappHref("Bonjour Yaplus, ")}
            />
          )}
          {view === "help" && (
            <Help
              open={faqOpen}
              onToggle={(i) => setFaqOpen((o) => (o === i ? null : i))}
              focusSearch={searchFocus}
              contact={
                canMessage
                  ? { label: "Écrire au support", onClick: () => go("messages") }
                  : whatsappHref("Bonjour Yaplus, ")
                    ? { label: "Écrire sur WhatsApp", href: whatsappHref("Bonjour Yaplus, ")! }
                    : null
              }
            />
          )}
        </div>

        <nav className="grid shrink-0 border-t bg-background pb-[env(safe-area-inset-bottom)]" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => go(t.id)}
              aria-current={view === t.id ? "page" : undefined}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                view === t.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="relative">
                <t.icon className="size-[22px]" strokeWidth={view === t.id ? 2.25 : 1.75} aria-hidden />
                {t.dot && <span className="absolute -top-0.5 -right-1 size-2.5 rounded-full bg-primary ring-2 ring-background" />}
              </span>
              {t.label}
              {t.dot && <span className="sr-only">, nouvelle réponse</span>}
            </button>
          ))}
        </nav>
      </DialogContent>
    </Dialog>
  );
}

function CloseButton({ className }: { className?: string }) {
  return (
    <DialogClose className={cn("-mr-2 grid size-11 place-items-center rounded-full transition-colors", className)} aria-label="Fermer">
      <X className="size-6" aria-hidden />
    </DialogClose>
  );
}

function Home({
  name,
  thread,
  canMessage,
  whatsappHref,
  onGo,
}: {
  name: string | null;
  thread: SupportThread | null;
  canMessage: boolean;
  whatsappHref: (text: string) => string | null;
  onGo: (view: SupportView, options?: { topic?: SupportTopic; faq?: number; search?: boolean }) => void;
}) {
  const last = thread?.messages.at(-1);
  const status = !last
    ? null
    : thread?.unread
      ? "Le support t’a répondu"
      : thread?.closedAt
        ? "Réglé"
        : last.fromAdmin
          ? "Répondu"
          : "En attente de réponse";
  const contactHref = whatsappHref("Bonjour Yaplus, ");
  const ideaHref = whatsappHref("Bonjour Yaplus, j’ai une idée : ");

  return (
    <div className="h-full overflow-y-auto overscroll-contain">
      <div className="bg-hero px-5 pt-[max(0.75rem,env(safe-area-inset-top))] pb-16 text-hero-foreground">
        <div className="flex h-12 items-center justify-between">
          <LogoMark className="size-8 text-hero-foreground" />
          <CloseButton className="hover:bg-white/10" />
        </div>
        <DialogTitle className="mt-7 text-[1.75rem] leading-[1.15] font-semibold tracking-tight text-balance">
          <span className="block text-hero-muted">{name ? `Bonjour ${name}` : "Bonjour"}</span>
          Comment on peut t’aider ?
        </DialogTitle>
      </div>

      <div className="-mt-10 grid grid-cols-[minmax(0,1fr)] gap-3 px-4 pb-6">
        {canMessage ? (
          <button type="button" onClick={() => onGo("messages")} className={cn(raised, "flex min-h-20 w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors hover:bg-accent/50")}>
            <span className="min-w-0 flex-1">
              {last ? (
                <>
                  <span className="block font-semibold">Ta conversation</span>
                  <span className={cn("block text-[15px]", thread?.unread ? "font-semibold text-primary" : "text-muted-foreground")}>{status}</span>
                  <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                    {last.fromAdmin ? "Support : " : "Toi : "}
                    {last.body}
                  </span>
                </>
              ) : (
                <>
                  <span className="block font-semibold">Écrire au support</span>
                  <span className="block text-[15px] text-muted-foreground">{DELAY}</span>
                </>
              )}
            </span>
            {last ? (
              <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                <ArrowUp className="size-5" aria-hidden />
              </span>
            )}
          </button>
        ) : (
          contactHref && (
            <a href={contactHref} target="_blank" rel="noreferrer" className={cn(raised, "flex min-h-20 items-center gap-3 rounded-2xl px-4 py-3.5 transition-colors hover:bg-accent/50")}>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">Écrire au support</span>
                <span className="block text-[15px] text-muted-foreground">Sur WhatsApp. {DELAY}</span>
              </span>
              <WhatsAppIcon className="size-6 shrink-0 text-primary" />
            </a>
          )
        )}

        <section className={cn(raised, "rounded-2xl p-2")} aria-label="Questions fréquentes">
          <button
            type="button"
            onClick={() => onGo("help", { search: true })}
            className="flex h-12 w-full items-center justify-between gap-3 rounded-xl bg-secondary px-3.5 text-left text-[15px] font-medium transition-colors hover:bg-accent"
          >
            Chercher de l’aide
            <Search className="size-5 text-muted-foreground" aria-hidden />
          </button>
          <ul className="mt-1">
            {FAQ.slice(0, 3).map((f, i) => (
              <li key={f.q}>
                <button
                  type="button"
                  onClick={() => onGo("help", { faq: i })}
                  className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-[15px] transition-colors hover:bg-accent/60"
                >
                  <span className="flex-1">{f.q}</span>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {(canMessage || ideaHref) && (
          <IdeaRow
            {...(canMessage ? { onClick: () => onGo("messages", { topic: "idea" }) } : { href: ideaHref! })}
          />
        )}
      </div>
    </div>
  );
}

function IdeaRow(props: { onClick: () => void } | { href: string }) {
  const content = (
    <>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-foreground">
        <Lightbulb className="size-5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold">Une idée pour Yaplus ?</span>
        <span className="block text-[15px] text-muted-foreground">Dis-nous ce qui t’aiderait en boutique.</span>
      </span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
    </>
  );
  const className = "flex min-h-16 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-accent/60";
  return "href" in props ? (
    <a href={props.href} target="_blank" rel="noreferrer" className={className}>
      {content}
    </a>
  ) : (
    <button type="button" onClick={props.onClick} className={className}>
      {content}
    </button>
  );
}

function SupportAvatar({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-full bg-hero", className)}>
      <LogoMark className="size-[55%] text-hero-foreground" />
    </span>
  );
}

// Une bulle du support. `meta` : l'heure, ou rien pour les messages automatiques.
function SupportBubble({ children, meta }: { children: React.ReactNode; meta?: string }) {
  return (
    <li className="flex items-end gap-2">
      <SupportAvatar className="size-7" />
      <div className="max-w-[80%]">
        <div className="rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap">{children}</div>
        {meta && <p className="mt-1 ml-1 text-xs text-muted-foreground">{meta}</p>}
      </div>
    </li>
  );
}

function Conversation({
  name,
  shopId,
  thread,
  onThread,
  topic,
  onTopic,
  whatsappHref,
}: {
  name: string;
  shopId: string | null;
  thread: SupportThread | null;
  onThread: (t: SupportThread) => void;
  topic: SupportTopic | null;
  onTopic: (t: SupportTopic | null) => void;
  whatsappHref: string | null;
}) {
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  const messages = thread?.messages ?? null;
  const last = messages?.at(-1);
  // Une nouvelle demande commence quand il n'y a rien, ou quand la précédente est réglée.
  const fresh = messages !== null && (messages.length === 0 || Boolean(thread?.closedAt && last && last.at <= thread.closedAt));

  // Le dernier message en vue, comme dans WhatsApp.
  useLayoutEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, topic, busy]);

  // La zone de texte grandit avec le message, jusqu'à 5 lignes environ.
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 136)}px`;
  }, [body]);

  const send = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      onThread(await sendSupport(body, shopId ?? "", fresh ? topic : null));
      setBody("");
      onTopic(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Le message n’est pas parti.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b px-4 pt-[env(safe-area-inset-top)]">
        <div className="flex min-h-16 min-w-0 flex-1 items-center gap-3">
          <SupportAvatar />
          <div className="min-w-0">
            <DialogTitle className="truncate text-base font-semibold">Support Yaplus</DialogTitle>
            <p className="truncate text-sm text-muted-foreground">{DELAY}</p>
          </div>
        </div>
        {whatsappHref && (
          <a href={whatsappHref} target="_blank" rel="noreferrer" className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground" aria-label="Écrire plutôt sur WhatsApp">
            <WhatsAppIcon className="size-[22px]" />
          </a>
        )}
        <CloseButton className="text-muted-foreground hover:bg-accent hover:text-foreground" />
      </header>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        {messages === null ? (
          <div className="grid gap-3" aria-busy="true" aria-label="Chargement des messages">
            <Skeleton className="h-16 w-3/4 rounded-2xl" />
            <Skeleton className="ml-auto h-12 w-1/2 rounded-2xl" />
          </div>
        ) : (
          <ol className="grid gap-3" aria-label="Messages">
            <SupportBubble>{`Bonjour ${name}. Pose ta question ou raconte ton souci, on te répond ici.`}</SupportBubble>

            {messages.map((m, i) => {
              const closedHere = thread?.closedAt && m.at <= thread.closedAt && (messages[i + 1]?.at ?? "9") > thread.closedAt;
              return (
                <Fragment key={m.id}>
                  {m.fromAdmin ? (
                    <SupportBubble meta={time(m.at)}>{m.body}</SupportBubble>
                  ) : (
                    <li className="ml-auto max-w-[80%]">
                      <div className="rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-primary-foreground">
                        {m.body}
                      </div>
                      <p className="mt-1 mr-1 text-right text-xs text-muted-foreground">
                        {m.topic && `${SUPPORT_TOPICS[m.topic]}, `}
                        {time(m.at)}
                      </p>
                    </li>
                  )}
                  {closedHere && (
                    <li className="py-1 text-center text-sm text-muted-foreground">Réglé le {day(thread.closedAt!)}. Écris si tu as encore besoin.</li>
                  )}
                </Fragment>
              );
            })}

            {last && !last.fromAdmin && !thread?.closedAt && <SupportBubble>{`C’est bien reçu. ${DELAY} La réponse arrive ici.`}</SupportBubble>}

            {fresh && (
              <>
                <SupportBubble>C’est à propos de quoi ?</SupportBubble>
                <li>
                  <ul className="flex flex-wrap justify-end gap-2" aria-label="Sujet">
                    {(Object.keys(SUPPORT_TOPICS) as SupportTopic[]).map((t) => (
                      <li key={t}>
                        <button
                          type="button"
                          onClick={() => onTopic(topic === t ? null : t)}
                          aria-pressed={topic === t}
                          className={cn(
                            "h-11 rounded-full border px-4 text-[15px] font-medium transition-colors",
                            topic === t ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:bg-accent",
                          )}
                        >
                          {SUPPORT_TOPICS[t]}
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
                <AnimatePresence initial={false}>
                  {topic && (
                    <motion.li key="next" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      <ol>
                        <SupportBubble>{topic === "idea" ? "Super, on t’écoute. Écris ton idée en bas." : "D’accord. Écris ton message en bas, en quelques mots."}</SupportBubble>
                      </ol>
                    </motion.li>
                  )}
                </AnimatePresence>
              </>
            )}
          </ol>
        )}
      </div>

      <form className="shrink-0 border-t bg-background px-3 pt-2 pb-2" onSubmit={(e) => (e.preventDefault(), void send())}>
        {error && (
          <p id="support-error" className="px-2 pb-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="flex items-end gap-2">
          <label htmlFor="support-message" className="sr-only">
            Ton message
          </label>
          <textarea
            ref={field}
            id="support-message"
            rows={1}
            value={body}
            onChange={(e) => (setBody(e.target.value), setError(null))}
            onKeyDown={(e) => {
              // Entrée envoie sur ordinateur ; sur téléphone, Entrée fait une nouvelle ligne.
              if (e.key !== "Enter" || e.shiftKey || !window.matchMedia("(pointer: fine)").matches) return;
              e.preventDefault();
              void send();
            }}
            placeholder="Écris ton message…"
            maxLength={SUPPORT_MAX_LENGTH}
            className="min-h-11 flex-1 resize-none rounded-[1.375rem] border border-input bg-card px-4 py-2.5 text-base leading-6 outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "support-error" : undefined}
          />
          <button
            type="submit"
            disabled={busy || !body.trim()}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-opacity outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40"
            aria-label={busy ? "Envoi…" : "Envoyer"}
          >
            <ArrowUp className="size-5" aria-hidden />
          </button>
        </div>
      </form>
    </div>
  );
}

function Help({
  open,
  onToggle,
  focusSearch,
  contact,
}: {
  open: number | null;
  onToggle: (i: number) => void;
  focusSearch: boolean;
  contact: { label: string; onClick: () => void } | { label: string; href: string } | null;
}) {
  const [search, setSearch] = useState("");
  const input = useRef<HTMLInputElement>(null);

  // La recherche ne prend le clavier que si on a touché « Chercher de l'aide ».
  useEffect(() => {
    if (focusSearch) input.current?.focus();
  }, [focusSearch]);

  const words = normalizeName(search).split(" ").filter(Boolean);
  const results = FAQ.map((f, i) => ({ ...f, i })).filter((f) => {
    const text = normalizeName(`${f.q} ${f.a}`);
    return words.every((w) => text.includes(w));
  });

  const contactButton =
    contact &&
    ("href" in contact ? (
      <a href={contact.href} target="_blank" rel="noreferrer" className={contactClass}>
        <WhatsAppIcon className="size-5" />
        {contact.label}
      </a>
    ) : (
      <button type="button" onClick={contact.onClick} className={contactClass}>
        {contact.label}
      </button>
    ));

  return (
    <div className="flex h-full flex-col">
      <header className="flex min-h-16 shrink-0 items-center justify-between gap-3 px-4 pt-[env(safe-area-inset-top)]">
        <DialogTitle className="text-[1.375rem] font-semibold tracking-tight">Aide</DialogTitle>
        <CloseButton className="text-muted-foreground hover:bg-accent hover:text-foreground" />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            ref={input}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Chercher de l’aide"
            aria-label="Chercher de l’aide"
            className="h-12 rounded-xl pl-11 [&::-webkit-search-cancel-button]:appearance-none"
          />
        </div>

        {results.length === 0 ? (
          <p className="mt-6 px-1 text-[15px] text-muted-foreground">Rien trouvé pour « {search.trim()} ». Écris-nous, on t’explique.</p>
        ) : (
          <ul className="mt-3 divide-y">
            {results.map((f) => {
              const expanded = open === f.i || (words.length > 0 && results.length === 1);
              return (
                <li key={f.q}>
                  <button
                    type="button"
                    onClick={() => onToggle(f.i)}
                    aria-expanded={expanded}
                    aria-controls={`faq-${f.i}`}
                    className="flex min-h-14 w-full items-center gap-3 py-3 text-left text-[15px] font-medium"
                  >
                    <span className="flex-1">{f.q}</span>
                    <ChevronDown className={cn("size-5 shrink-0 text-muted-foreground transition-transform duration-200", expanded && "rotate-180")} aria-hidden />
                  </button>
                  <AnimatePresence initial={false}>
                    {expanded && (
                      <motion.div
                        id={`faq-${f.i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[65ch] pb-4 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}

        {contactButton && (
          <div className="mt-6 grid gap-2.5 rounded-2xl bg-secondary p-4">
            <p className="font-semibold">Pas trouvé ta réponse ?</p>
            {contactButton}
          </div>
        )}
      </div>
    </div>
  );
}

const contactClass =
  "inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 outline-none focus-visible:ring-3 focus-visible:ring-ring/50";

// Hauteur visible quand le clavier s'ouvre : la zone de saisie reste au-dessus du clavier.
function useVisualHeight(active: boolean): number | null {
  const [height, setHeight] = useState<number | null>(null);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!active || !vv) return;
    const update = () => setHeight(vv.height);
    update();
    vv.addEventListener("resize", update);
    return () => vv.removeEventListener("resize", update);
  }, [active]);
  return height;
}
