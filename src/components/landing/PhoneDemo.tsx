"use client";

import { ArrowLeft, Check, CheckCheck, History, LayoutGrid, MessageCircle, Pause, Play, Search, ShoppingCart, Store } from "lucide-react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useLayoutEffect, useReducer, useRef, useState, useSyncExternalStore } from "react";
import { LogoMark } from "@/components/AppShell";
import { StatusMark } from "@/components/ProductRow";
import { base, ease, quick } from "@/lib/motion";
import { cn } from "@/lib/utils";

// Le téléphone de la page d'accueil : un vrai cahier en miniature qui joue le cycle
// signaler → envoyer → clôturer. Le visiteur peut toucher les produits lui-même ;
// la lecture s'arrête alors pour lui laisser la main.

const SHOP = "Boutique Akwa";

type Item = { id: string; name: string; category: string };
const ITEMS: Item[] = [
  { id: "kg5", name: "KG5", category: "Afficheurs" },
  { id: "a70", name: "Itel A70", category: "Afficheurs" },
  { id: "spark", name: "Tecno Spark 10", category: "Afficheurs" },
  { id: "hot30", name: "Infinix Hot 30", category: "Afficheurs" },
  { id: "a14", name: "Samsung A14", category: "Afficheurs" },
  { id: "pochette", name: "Pochette Itel A100", category: "Pochettes" },
];
const AFFICHEURS = ITEMS.filter((i) => i.category === "Afficheurs");
const nameOf = (id: string) => ITEMS.find((i) => i.id === id)?.name ?? id;

type State = {
  flagged: Record<string, string>;
  bought: string[];
  sent: boolean;
  notice: { id: string; text: string } | null;
  closed: boolean;
};

type Action =
  | { type: "enter"; scene: number }
  | { type: "flag"; id: string; by: string }
  | { type: "toggle"; id: string }
  | { type: "send" }
  | { type: "buy"; id: string }
  | { type: "close" };

const START: State = { flagged: { spark: "Marie", pochette: "Marie" }, bought: [], sent: false, notice: null, closed: false };
// État de départ des écrans 2 et 3 : Paul a déjà signalé KG5 et Samsung A14.
const LIST: State = { ...START, flagged: { kg5: "Paul", spark: "Marie", a14: "Paul", pochette: "Marie" } };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "enter":
      return action.scene === 0 ? START : LIST;
    case "flag":
      return {
        ...state,
        flagged: { ...state.flagged, [action.id]: action.by },
        notice: { id: action.id, text: `${action.by} a signalé ${nameOf(action.id)}` },
      };
    case "toggle": {
      const flagged = { ...state.flagged };
      if (flagged[action.id]) {
        delete flagged[action.id];
        return { ...state, flagged };
      }
      flagged[action.id] = "toi";
      return { ...state, flagged, notice: { id: action.id, text: `Tu as signalé ${nameOf(action.id)}` } };
    }
    case "send":
      return { ...state, sent: true };
    case "buy":
      return state.bought.includes(action.id) ? state : { ...state, bought: [...state.bought, action.id] };
    case "close":
      return { ...state, closed: true };
  }
}

type Step = { wait: number; target: string; act: Action };
const SCENES: { label: string; caption: string; steps: Step[]; tail: number }[] = [
  {
    label: "Signaler",
    caption: "L’employé touche ce qui est fini. Le patron le voit tout de suite.",
    steps: [
      { wait: 1200, target: "row-kg5", act: { type: "flag", id: "kg5", by: "Paul" } },
      { wait: 2300, target: "row-a14", act: { type: "flag", id: "a14", by: "Paul" } },
    ],
    tail: 2600,
  },
  {
    label: "Envoyer",
    caption: "Un bouton, et le fournisseur reçoit la liste rangée par catégorie.",
    steps: [{ wait: 1500, target: "btn-send", act: { type: "send" } }],
    tail: 4400,
  },
  {
    label: "Clôturer",
    caption: "On coche ce qui est acheté. Le reste revient la fois suivante.",
    steps: [
      { wait: 1100, target: "chk-kg5", act: { type: "buy", id: "kg5" } },
      { wait: 850, target: "chk-spark", act: { type: "buy", id: "spark" } },
      { wait: 850, target: "chk-pochette", act: { type: "buy", id: "pochette" } },
      { wait: 1300, target: "btn-close", act: { type: "close" } },
    ],
    tail: 3200,
  },
];
const sceneLength = (s: (typeof SCENES)[number]) => s.steps.reduce((t, st) => t + st.wait, 0) + s.tail;

type Finger = { target: string; press: number } | null;

// Préférence « moins de mouvement », lue après l'hydratation (le serveur ne la connaît pas).
const REDUCED = "(prefers-reduced-motion: reduce)";
function useReducedMotionPref() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(REDUCED);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

export function PhoneDemo() {
  const [scene, setScene] = useState(0);
  const [state, dispatch] = useReducer(reducer, START);
  // null : lecture automatique, sauf si le téléphone demande moins de mouvement.
  const [choice, setChoice] = useState<boolean | null>(null);
  const [finger, setFinger] = useState<Finger>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const reduced = useReducedMotionPref();
  const playing = choice ?? !reduced;
  const setPlaying = (p: boolean) => setChoice(p);
  const stageRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.35 });
  const [pageVisible, setPageVisible] = useState(true);

  // Mouvement réduit : pas de lecture automatique, on montre le résultat du premier geste.
  useEffect(() => {
    if (reduced) dispatch({ type: "flag", id: "kg5", by: "Paul" });
  }, [reduced]);

  useEffect(() => {
    const onVis = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const goTo = (n: number, instant = false) => {
    setScene(n);
    setFinger(null);
    dispatch({ type: "enter", scene: n });
    if (instant) for (const s of SCENES[n].steps) dispatch(s.act);
  };

  const running = playing && inView && pageVisible;

  // Le script de la scène : le doigt va vers la cible, appuie, l'action s'applique.
  useEffect(() => {
    if (!running) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    let t = 0;
    SCENES[scene].steps.forEach((step, i) => {
      t += step.wait;
      at(t - 600, () => setFinger({ target: step.target, press: 0 }));
      at(t, () => {
        setFinger({ target: step.target, press: i + 1 });
        dispatch(step.act);
      });
    });
    at(t + 700, () => setFinger(null));
    at(t + SCENES[scene].tail, () => goTo((scene + 1) % SCENES.length));
    return () => timers.forEach(clearTimeout);
  }, [scene, running]);

  useLayoutEffect(() => {
    if (!finger || !screenRef.current) return;
    const el = screenRef.current.querySelector<HTMLElement>(`[data-target="${finger.target}"]`);
    if (!el) return;
    const s = screenRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const left = el.dataset.tap === "left";
    setPos({ x: r.left - s.left + (left ? r.width * 0.74 : r.width / 2), y: r.top - s.top + r.height / 2 });
  }, [finger]);

  const userToggle = (id: string) => {
    setPlaying(false);
    setFinger(null);
    dispatch({ type: "toggle", id });
  };

  const flaggedIds = ITEMS.filter((i) => state.flagged[i.id]).map((i) => i.id);
  const left = flaggedIds.filter((id) => !state.bought.includes(id));
  const badge = state.closed ? left.length : flaggedIds.length;

  return (
    <div className="flex flex-col items-center">
      <div ref={stageRef} className="relative">
        {/* Notification : ce que voit le patron, même loin de la boutique */}
        <AnimatePresence>
          {scene === 0 && state.notice && (
            <motion.div
              key={state.notice.id}
              initial={{ opacity: 0, y: -10, scale: 0.96, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.32, ease } }}
              exit={{ opacity: 0, y: -6, transition: quick }}
              className="absolute -top-12 -left-2 z-20 flex w-[256px] items-center gap-3 rounded-2xl border bg-card/95 p-3 shadow-[0_12px_32px_-12px_rgb(16_40_80/0.35),0_2px_6px_-2px_rgb(16_40_80/0.15)] backdrop-blur-md sm:-left-24 lg:top-[196px] lg:-left-60"
              aria-hidden
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-brand">
                <LogoMark className="size-5 text-white" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] leading-tight font-semibold text-balance">{state.notice.text}</span>
                <span className="mt-0.5 block text-[12px] text-muted-foreground">{SHOP}, à l’instant</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Message WhatsApp : ce que reçoit le fournisseur */}
        <AnimatePresence>
          {scene === 1 && state.sent && <WhatsAppBubble ids={flaggedIds} />}
        </AnimatePresence>

        <Phone>
          <div ref={screenRef} className="relative flex h-full flex-col">
            <StatusBar />
            <div className="flex h-11 shrink-0 items-center gap-2 border-b px-4">
              <LogoMark className="size-5" />
              <span className="flex-1 truncate text-[13px] font-semibold">{SHOP}</span>
              <Check className="size-3.5 text-muted-foreground" aria-hidden />
            </div>

            <div className="relative flex-1 overflow-hidden">
              <AnimatePresence initial={false}>
                <motion.div
                  key={scene}
                  className="absolute inset-0 flex flex-col pt-3"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0, transition: base }}
                  exit={{ opacity: 0, x: -24, transition: quick }}
                >
                  {scene === 0 && <CategoryScreen state={state} onToggle={userToggle} />}
                  {scene === 1 && <ToBuyScreen state={state} ids={flaggedIds} />}
                  {scene === 2 && <CloseScreen state={state} ids={flaggedIds} />}
                </motion.div>
              </AnimatePresence>
            </div>

            <TabBar active={scene === 0 ? 0 : 1} badge={badge} />

            {/* Le doigt du démonstrateur */}
            <AnimatePresence>
              {finger && pos && (
                <motion.div
                  className="pointer-events-none absolute top-0 left-0 z-30"
                  initial={{ opacity: 0, x: pos.x - 18, y: pos.y + 40 }}
                  animate={{ opacity: 1, x: pos.x - 18, y: pos.y - 18, transition: { duration: 0.5, ease } }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  aria-hidden
                >
                  <motion.span
                    key={finger.press}
                    className="block size-9 rounded-full border border-white/70 bg-[rgb(42_42_42/0.22)] shadow-[0_4px_12px_-2px_rgb(16_40_80/0.35)] backdrop-blur-[2px] dark:bg-white/25"
                    initial={finger.press ? { scale: 0.8 } : false}
                    animate={{ scale: 1, transition: { duration: 0.22, ease } }}
                  />
                  {finger.press > 0 && (
                    <motion.span
                      key={`ring-${finger.press}`}
                      className="absolute inset-0 rounded-full border-2 border-brand"
                      initial={{ scale: 0.7, opacity: 0.9 }}
                      animate={{ scale: 2, opacity: 0, transition: { duration: 0.5, ease } }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Phone>
      </div>

      {/* Commandes : les trois gestes, et pause */}
      <div className="mt-6 flex w-full max-w-[22rem] flex-col items-center gap-3">
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-full border bg-card p-1" role="group" aria-label="Étapes de la démo">
            {SCENES.map((s, i) => (
              <button
                key={s.label}
                type="button"
                aria-pressed={scene === i}
                onClick={() => goTo(i, reduced || !playing)}
                className={cn(
                  "relative h-10 overflow-hidden rounded-full px-4 text-[14px] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  scene === i ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
                {scene === i && running && (
                  <motion.span
                    key={`p-${scene}`}
                    className="absolute inset-x-3 bottom-1 h-0.5 origin-left rounded-full bg-brand"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1, transition: { duration: sceneLength(s) / 1000, ease: "linear" } }}
                    aria-hidden
                  />
                )}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setPlaying(!playing)}
            aria-label={playing ? "Mettre la démo en pause" : "Lancer la démo"}
            className="grid size-11 place-items-center rounded-full text-muted-foreground transition-colors duration-150 outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            {playing ? <Pause className="size-[18px]" aria-hidden /> : <Play className="size-[18px]" aria-hidden />}
          </button>
        </div>
        <p className="min-h-[2lh] text-center text-[15px] leading-snug text-balance text-muted-foreground">
          {scene === 0 && !playing ? "Touche un produit dans le téléphone pour le signaler." : SCENES[scene].caption}
        </p>
      </div>
    </div>
  );
}

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[300px] rounded-[46px] bg-[#1d1f22] p-[9px] dark:bg-[#3a3c41] dark:shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12)] [filter:drop-shadow(0_28px_36px_rgb(16_40_80/0.28))_drop-shadow(0_8px_12px_rgb(16_40_80/0.18))] sm:w-[312px]">
      {/* Boutons latéraux */}
      <span className="absolute top-28 -right-[3px] h-14 w-[3px] rounded-r bg-[#2a2c30] dark:bg-[#4a4c52]" aria-hidden />
      <span className="absolute top-48 -right-[3px] h-9 w-[3px] rounded-r bg-[#2a2c30] dark:bg-[#4a4c52]" aria-hidden />
      <div className="relative h-[600px] overflow-hidden rounded-[38px] bg-background text-foreground select-none sm:h-[620px]">
        <span className="absolute top-2.5 left-1/2 z-40 size-[11px] -translate-x-1/2 rounded-full bg-[#0c0d0e]" aria-hidden />
        {children}
      </div>
    </div>
  );
}

function StatusBar() {
  return (
    <div className="flex h-8 shrink-0 items-center justify-between px-6 pt-1 text-[11px] font-semibold tabular-nums" aria-hidden>
      <span>18:02</span>
      <span className="flex items-center gap-1">
        <svg viewBox="0 0 16 12" className="h-2.5 w-3.5 fill-current">
          <rect x="0" y="8" width="3" height="4" rx="0.6" />
          <rect x="4.3" y="5.5" width="3" height="6.5" rx="0.6" />
          <rect x="8.6" y="3" width="3" height="9" rx="0.6" />
          <rect x="12.9" y="0" width="3" height="12" rx="0.6" opacity="0.35" />
        </svg>
        <svg viewBox="0 0 24 12" className="h-2.5 w-5">
          <rect x="0.5" y="0.5" width="20" height="11" rx="3" fill="none" stroke="currentColor" opacity="0.4" />
          <rect x="2" y="2" width="13" height="8" rx="1.6" fill="currentColor" />
          <rect x="21.5" y="4" width="2" height="4" rx="1" fill="currentColor" opacity="0.4" />
        </svg>
      </span>
    </div>
  );
}

function TabBar({ active, badge }: { active: number; badge: number }) {
  const tabs = [
    { label: "Cahier", icon: LayoutGrid },
    { label: "À racheter", icon: ShoppingCart },
    { label: "Historique", icon: History },
    { label: "Boutique", icon: Store },
  ];
  return (
    <div className="grid h-14 shrink-0 grid-cols-4 border-t pb-1" aria-hidden>
      {tabs.map((t, i) => {
        const Icon = t.icon;
        return (
          <span key={t.label} className={cn("flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium", i === active ? "text-foreground" : "text-muted-foreground")}>
            <span className="relative">
              <Icon className="size-[19px]" strokeWidth={i === active ? 2.25 : 1.75} />
              {i === 1 && badge > 0 && (
                <motion.span
                  key={badge}
                  initial={{ scale: 1.35 }}
                  animate={{ scale: 1, transition: { duration: 0.22, ease } }}
                  className="absolute -top-1.5 left-3 min-w-4 rounded-full bg-flag px-1 text-center text-[9px] leading-4 font-semibold text-flag-foreground tabular-nums"
                >
                  {badge}
                </motion.span>
              )}
            </span>
            {t.label}
          </span>
        );
      })}
    </div>
  );
}

function CategoryScreen({ state, onToggle }: { state: State; onToggle: (id: string) => void }) {
  return (
    <>
      <div className="flex h-9 items-center gap-1.5 px-4">
        <ArrowLeft className="size-[18px]" aria-hidden />
        <span className="text-[19px] font-bold tracking-tight">Afficheurs</span>
      </div>
      <div className="mx-4 mt-2 flex h-10 items-center gap-2 rounded-full bg-secondary px-3.5 text-[13px] text-muted-foreground" aria-hidden>
        <Search className="size-4" />
        Chercher un produit
      </div>
      <ul className="relative mt-3 divide-y border-y bg-card before:pointer-events-none before:absolute before:inset-y-0 before:left-11 before:z-10 before:w-px before:bg-flag/35">
        {AFFICHEURS.map((p) => {
          const by = state.flagged[p.id];
          return (
            <li key={p.id}>
              <button
                type="button"
                data-target={`row-${p.id}`}
                data-tap="left"
                aria-pressed={!!by}
                onClick={() => onToggle(p.id)}
                className={cn(
                  "flex h-[54px] w-full items-center pr-4 text-left transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  by ? "bg-flag-subtle" : "hover:bg-accent/50",
                )}
              >
                <span className="grid w-11 shrink-0 place-items-center pl-1">
                  <StatusMark status={by ? "to_buy" : "in_stock"} />
                </span>
                <span className="min-w-0 flex-1 pl-3">
                  <span className="block truncate text-[14px] leading-snug font-medium">{p.name}</span>
                  <span className={cn("block text-[12px] leading-snug", by ? "text-flag-text" : "text-muted-foreground")}>
                    {by ? (by === "toi" ? "Signalé par toi" : `Signalé par ${by}`) : "En stock"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function groupsOf(ids: string[]) {
  const groups: { category: string; items: Item[] }[] = [];
  for (const id of ids) {
    const item = ITEMS.find((i) => i.id === id)!;
    let g = groups.find((x) => x.category === item.category);
    if (!g) groups.push((g = { category: item.category, items: [] }));
    g.items.push(item);
  }
  return groups;
}

function ToBuyScreen({ state, ids }: { state: State; ids: string[] }) {
  return (
    <>
      <span className="px-4 text-[19px] leading-9 font-bold tracking-tight">À racheter</span>
      <span className="px-4 text-[12px] text-muted-foreground tabular-nums">{ids.length} produits, prêts à envoyer</span>
      <div className="mt-3 grid gap-3">
        {groupsOf(ids).map((g) => (
          <div key={g.category}>
            <p className="mb-1.5 flex justify-between px-4 text-[13px] font-semibold">
              {g.category}
              <span className="font-normal text-muted-foreground tabular-nums">{g.items.length}</span>
            </p>
            <ul className="divide-y border-y bg-card">
              {g.items.map((p) => (
                <li key={p.id} className="flex h-[46px] items-center">
                  <span className="grid w-11 shrink-0 place-items-center pl-1">
                    <StatusMark status="to_buy" />
                  </span>
                  <span className="min-w-0 flex-1 pl-2">
                    <span className="block truncate text-[13px] leading-snug font-medium">{p.name}</span>
                    <span className="block text-[11px] leading-snug text-muted-foreground">
                      {state.flagged[p.id] === "toi" ? "Signalé par toi" : `Signalé par ${state.flagged[p.id]}`}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-auto flex gap-2 px-3.5 pb-3">
        <span
          data-target="btn-send"
          className={cn(
            "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border text-[13px] font-medium transition-colors duration-200",
            state.sent ? "border-success/40 bg-success-subtle text-success-text" : "bg-card",
          )}
        >
          {state.sent ? <Check className="size-4" aria-hidden /> : <MessageCircle className="size-4" aria-hidden />}
          {state.sent ? "Envoyé" : "Envoyer"}
        </span>
        <span className="flex h-10 flex-1 items-center justify-center rounded-xl bg-primary text-[13px] font-medium text-primary-foreground">Clôturer</span>
      </div>
    </>
  );
}

function CloseScreen({ state, ids }: { state: State; ids: string[] }) {
  const bought = ids.filter((id) => state.bought.includes(id)).length;
  return (
    <>
      <span className="px-4 text-[19px] leading-9 font-bold tracking-tight">À racheter</span>
      <div className="px-4 pt-1">
        <p className="text-[12px] text-muted-foreground tabular-nums">
          <span className="text-[17px] font-bold text-foreground">{bought}</span> / {ids.length} achetés
        </p>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-secondary">
          <motion.div className="h-full rounded-full bg-success" animate={{ width: `${(bought / ids.length) * 100}%` }} transition={base} />
        </div>
      </div>
      <ul className="mt-3 divide-y border-y bg-card">
        {ids.map((id) => {
          const on = state.bought.includes(id);
          const forgotten = state.closed && !on;
          return (
            <li key={id} className={cn("flex h-[50px] items-center transition-colors duration-200", on && "bg-success-subtle")}>
              <span className="grid w-11 shrink-0 place-items-center pl-1">
                <span
                  data-target={`chk-${id}`}
                  className={cn(
                    "grid size-[22px] place-items-center rounded-md border transition-colors duration-150",
                    on ? "border-success bg-success text-white" : "border-input bg-card",
                  )}
                >
                  {on && (
                    <motion.span initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={quick}>
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </motion.span>
                  )}
                </span>
              </span>
              <span className="min-w-0 flex-1 pl-2">
                <span className={cn("block truncate text-[13px] leading-snug font-medium", on && "text-muted-foreground line-through decoration-1")}>{nameOf(id)}</span>
                <span className={cn("block text-[11px] leading-snug", forgotten ? "font-medium text-flag-text" : "text-muted-foreground")}>
                  {forgotten ? "Oublié, reste sur la liste" : on ? "Acheté" : ITEMS.find((i) => i.id === id)?.category}
                </span>
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto px-3.5 pb-3">
        <span data-target="btn-close" className="flex h-10 items-center justify-center rounded-xl bg-primary text-[13px] font-medium text-primary-foreground">
          Clôturer la liste
        </span>
      </div>
      <AnimatePresence>
        {state.closed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0, transition: base }}
            exit={{ opacity: 0, transition: quick }}
            className="absolute inset-x-3.5 bottom-16 flex items-center gap-2 rounded-xl bg-foreground px-3 py-2.5 text-[12px] font-medium text-background shadow-lg"
          >
            <Check className="size-4 shrink-0" aria-hidden />
            Liste clôturée, rangée dans l’historique
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function WhatsAppBubble({ ids }: { ids: string[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -24, scale: 0.94, filter: "blur(4px)" }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)", transition: { duration: 0.4, ease } }}
      exit={{ opacity: 0, x: 12, transition: quick }}
      className="absolute top-[200px] -right-3 z-20 w-[236px] origin-left sm:-right-28 lg:-right-48"
      aria-hidden
    >
      <div className="rounded-2xl rounded-tr-md bg-[#d9fdd3] px-3.5 pt-2 pb-1.5 text-[#1f2a24] shadow-[0_12px_32px_-12px_rgb(16_40_80/0.35),0_2px_6px_-2px_rgb(16_40_80/0.15)] dark:bg-[#005c4b] dark:text-[#e9f5ef]">
        <p className="mb-1 flex items-center gap-1.5 border-b border-current/10 pb-1.5 text-[12px] font-medium opacity-75">
          <MessageCircle className="size-3.5" />
          Envoyé à Ets Ngono, fournisseur
        </p>
        <p className="text-[13px] leading-relaxed">
          <strong className="font-semibold">{SHOP}</strong>, à racheter
        </p>
        {groupsOf(ids).map((g) => (
          <div key={g.category} className="pt-1">
            <p className="text-[13px] leading-relaxed font-semibold">{g.category}</p>
            {g.items.map((p) => (
              <p key={p.id} className="text-[13px] leading-relaxed">
                - {p.name}
              </p>
            ))}
          </div>
        ))}
        <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] opacity-70 tabular-nums">
          18:03
          <CheckCheck className="size-3.5 text-[#1d8fd6] dark:text-[#53bdeb]" />
        </p>
      </div>
    </motion.div>
  );
}
