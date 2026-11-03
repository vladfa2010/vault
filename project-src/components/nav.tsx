"use client";

import { Logo } from "@/components/logo";
import { quickEase, softEase, useReducedMotion } from "@/lib/motion";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  type Transition,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

const LINKS = [
  { label: "Возможности", href: "#features", id: "features" },
  { label: "Стандарты", href: "#benchmarks", id: "benchmarks" },
  { label: "Истории", href: "#stories", id: "stories" },
  { label: "Тарифы", href: "#pricing", id: "pricing" },
] as const;

const SIGN_IN_URL = "https://vault.cifra.com/sign-in";
const START_HREF = "#pricing";

const EASE_OUT: Transition = { duration: 0.45, ease: softEase };
const EASE_IN: Transition = { duration: 0.22, ease: quickEase };
const SPRING: Transition = { type: "spring", stiffness: 420, damping: 36 };

const CONDENSE_AT = 48;

const INTRO_EASE = [0.22, 1, 0.36, 1] as const;
const introGroup = (delay: number) => ({
  hidden: { opacity: 0, y: -18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.1,
      ease: INTRO_EASE,
      delay,

      delayChildren: delay + 0.25,
      staggerChildren: 0.055,
    },
  },
});
const introItem = {
  hidden: { opacity: 0, y: -6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: INTRO_EASE } },
};

function Burger({ open }: { open: boolean }): ReactNode {
  const reducedMotion = useReducedMotion();
  const t: Transition = reducedMotion ? { duration: 0 } : EASE_OUT;
  const bar = "absolute left-0 h-[1.5px] w-full rounded-full bg-current";
  return (
    <span aria-hidden="true" className="relative block h-[9px] w-[15px]">
      <motion.span
        className={bar}
        initial={false}
        animate={
          open
            ? { top: "50%", y: "-50%", rotate: 45 }
            : { top: 0, y: 0, rotate: 0 }
        }
        transition={t}
      />
      <motion.span
        className={bar}
        initial={false}
        animate={
          open
            ? { top: "50%", y: "-50%", rotate: -45 }
            : { top: "100%", y: "-100%", rotate: 0 }
        }
        transition={t}
      />
    </span>
  );
}

function LinkRow({ active }: { active: string | null }): ReactNode {
  const [hover, setHover] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const shown = hover ?? active;

  return (
    <ul
      className="relative hidden items-center md:flex"
      onMouseLeave={() => setHover(null)}
    >
      {LINKS.map((link) => {
        const isActive = active === link.id;
        return (
          <motion.li key={link.id} variants={introItem} className="relative">
            {shown === link.id && (
              <motion.span
                layoutId="nav-thumb"
                aria-hidden="true"
                className="absolute inset-0 rounded-lg bg-white/10 dark:bg-black/8"
                transition={reducedMotion ? { duration: 0 } : SPRING}
              />
            )}
            <a
              href={link.href}
              onMouseEnter={() => setHover(link.id)}
              onFocus={() => setHover(link.id)}
              onBlur={() => setHover(null)}
              aria-current={isActive ? "location" : undefined}
              className={`relative z-[1] inline-flex h-8 items-center rounded-lg px-3 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                isActive || hover === link.id
                  ? "text-background"
                  : "text-background/65"
              }`}
            >
              {link.label}

              <span
                aria-hidden="true"
                className={`absolute bottom-[3px] left-1/2 h-[3px] w-[3px] -translate-x-1/2 rounded-full bg-background transition-[opacity,transform] duration-300 ${
                  isActive ? "scale-100 opacity-100" : "scale-0 opacity-0"
                }`}
              />
            </a>
          </motion.li>
        );
      })}
    </ul>
  );
}

function MobilePanel({
  open,
  id,
  onClose,
  active,
}: {
  open: boolean;
  id: string;
  onClose: () => void;
  active: string | null;
}): ReactNode {
  const reducedMotion = useReducedMotion();
  const firstRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: globalThis.KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(
      () => firstRef.current?.focus(),
      reducedMotion ? 0 : 250
    );
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, onClose, reducedMotion]);

  const panel = reducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 },
      }
    : {
        initial: { opacity: 0, scale: 0.92, y: -8 },
        animate: { opacity: 1, scale: 1, y: 0, transition: EASE_OUT },
        exit: { opacity: 0, scale: 0.96, y: -6, transition: EASE_IN },
      };
  const item = (i: number) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: {
            opacity: 1,
            y: 0,
            transition: { ...EASE_OUT, delay: 0.1 + i * 0.05 },
          },
          exit: { opacity: 0, transition: { duration: 0.12 } },
        };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            key="scrim"
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="fixed inset-0 z-30 bg-foreground/25 backdrop-blur-[2px] md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.div
            key="panel"
            id={id}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"

            className="fixed top-[4.25rem] right-4 left-4 z-40 origin-top-left overflow-hidden rounded-2xl bg-foreground p-2 text-background shadow-[0_24px_70px_-24px_rgba(0,0,0,0.6)] md:hidden dark:shadow-[0_24px_70px_-24px_rgba(0,0,0,0.9)]"
            {...panel}
          >
            <nav aria-label="Mobile">
              <ul className="flex flex-col">
                {LINKS.map((link, i) => (
                  <motion.li key={link.id} {...item(i)}>
                    <a
                      ref={i === 0 ? firstRef : undefined}
                      href={link.href}
                      onClick={onClose}
                      aria-current={active === link.id ? "location" : undefined}
                      className="group flex items-center justify-between rounded-xl px-4 py-3.5 text-[1.375rem] font-medium tracking-[-0.01em] transition-colors hover:bg-background/8 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <span className="flex items-center gap-3">
                        {active === link.id && (
                          <span
                            aria-hidden="true"
                            className="h-1.5 w-1.5 rounded-full bg-background"
                          />
                        )}
                        {link.label}
                      </span>
                      <ArrowUpRight
                        className="h-5 w-5 text-background/40 transition-[transform,color] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-background"
                        aria-hidden
                      />
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <motion.div
              className="mt-3 grid grid-cols-2 gap-2"
              {...item(LINKS.length)}
            >
              <a
                href={SIGN_IN_URL}
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-background/12 text-sm font-medium text-background transition-colors hover:bg-background/18 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Войти
              </a>
              <a
                href={START_HREF}
                onClick={onClose}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-background text-sm font-medium text-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Начать бесплатно
              </a>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function Nav(): ReactNode {
  const reducedMotion = useReducedMotion();
  const [condensed, setCondensed] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    setCondensed(y > CONDENSE_AT);
  });

  const close = useCallback(() => {
    setOpen(false);
    toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    const els = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
          else if (active === e.target.id && e.boundingClientRect.top > 0) {
            setActive(null);
          }
        }
      },
      { rootMargin: "-33% 0px -60% 0px" }
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, [active]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (): void => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const onKey = (e: KeyboardEvent<HTMLElement>): void => {
    if (e.key === "Escape" && open) close();
  };

  return (
    <>
      <motion.header
        onKeyDown={onKey}
        className="fixed inset-x-0 top-0 z-50 flex items-start justify-between px-4 pt-4 sm:px-5 sm:pt-5"
        aria-label="Site"
      >
        <motion.div
          variants={introGroup(0.15)}
          initial={reducedMotion ? false : "hidden"}
          animate="show"
          className="flex h-11 items-center gap-1 rounded-xl bg-foreground p-1 text-background shadow-[0_12px_36px_-14px_rgba(0,0,0,0.45)] dark:shadow-[0_12px_36px_-14px_rgba(0,0,0,0.8)]"
        >
          <motion.div
            variants={introItem}
            className="flex items-center pr-1 pl-2"
          >
            <Logo className="h-9 text-background" compact={condensed} />
          </motion.div>

          <LinkRow active={active} />

          <motion.button
            variants={introItem}
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-background/80 transition-colors hover:bg-background/10 hover:text-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
          >
            <Burger open={open} />
          </motion.button>
        </motion.div>

        <motion.div
          variants={introGroup(0.3)}
          initial={reducedMotion ? false : "hidden"}
          animate="show"
          className="flex h-11 items-center"
        >
          <AnimatePresence initial={false}>
            {!condensed && (
              <motion.div
                key="sign-in"
                className="hidden overflow-hidden sm:block"
                initial={reducedMotion ? false : { width: 0, opacity: 0 }}
                animate={{
                  width: "auto",
                  opacity: 1,
                  transition: reducedMotion ? { duration: 0 } : EASE_OUT,
                }}
                exit={{
                  width: 0,
                  opacity: 0,
                  transition: reducedMotion ? { duration: 0 } : EASE_IN,
                }}
              >
                <a
                  href={SIGN_IN_URL}
                  className="mr-2 inline-flex h-11 items-center rounded-xl bg-foreground/[0.07] px-4 text-sm font-medium whitespace-nowrap text-foreground transition-colors hover:bg-foreground/[0.11] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-white/[0.13] dark:hover:bg-white/[0.18]"
                >
                  Войти
                </a>
              </motion.div>
            )}
          </AnimatePresence>
          <a
            href={START_HREF}
            className="group inline-flex h-11 items-center gap-1 rounded-xl bg-foreground pr-3 pl-4 text-sm font-medium whitespace-nowrap text-background shadow-[0_12px_36px_-14px_rgba(0,0,0,0.45)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:shadow-[0_12px_36px_-14px_rgba(0,0,0,0.8)]"
          >
            Начать бесплатно
            <ChevronRight
              className="h-4 w-4 text-background/70 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
        </motion.div>
      </motion.header>

      <MobilePanel open={open} id={panelId} onClose={close} active={active} />
    </>
  );
}
