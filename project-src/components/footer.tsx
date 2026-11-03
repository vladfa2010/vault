"use client";

import { LogoMark } from "@/components/logo";
import { softEase, useReducedMotion } from "@/lib/motion";
import { siteConfig } from "@/lib/metadata";
import { SPECTRUM_CLASS } from "@/lib/spectrum";
import { ArrowRight, Check } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

const SITE = siteConfig.url;

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Продукт",
    links: [
      { label: "Возможности", href: "#features" },
      { label: "Стандарты", href: "#benchmarks" },
      { label: "Истории", href: "#stories" },
      { label: "Тарифы", href: "#pricing" },
      { label: "Вопросы", href: "#faq" },
    ],
  },
  {
    title: "Платформа",
    links: [
      { label: "О Цифре", href: "https://cifra.com" },
      { label: "CIFRA Vault", href: "#top" },
      { label: "Контакты", href: "mailto:vault@cifra.com" },
    ],
  },
  {
    title: "Сообщество",
    links: [
      { label: "Telegram", href: "https://t.me/cifra" },
      { label: "VK", href: "https://vk.com/cifra" },
      { label: "YouTube", href: "https://youtube.com/@cifra" },
    ],
  },
];

const LEGAL = [
  { label: "Условия", href: `${SITE}/terms` },
  { label: "Конфиденциальность", href: `${SITE}/privacy` },
  { label: "Cookies", href: `${SITE}/cookies` },
];

function Newsletter(): ReactNode {
  const [done, setDone] = useState(false);
  const onSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setDone(true);
  };
  return (
    <div className="max-w-[26rem]">
      <h2 className="font-serif text-[2rem] leading-none tracking-[-0.01em] text-foreground">
        Не пропустите
      </h2>
      <p className="mt-2 text-[15px] text-muted-foreground">
        Новые функции хранилища, истории коллекций и закулисье цифрового
        искусства — раз в месяц.
      </p>
      <form
        onSubmit={onSubmit}
        className="relative mt-6"
        aria-label="Newsletter signup"
      >
        <label htmlFor="footer-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-email"
          type="email"
          name="email"
          required
          disabled={done}
          placeholder="Ваш email"
          autoComplete="email"
          className="h-13 w-full rounded-xl border border-border bg-background pr-14 pl-4 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-80"
        />
        <button
          type="submit"
          aria-label={done ? "Subscribed" : "Subscribe"}
          disabled={done}
          className="absolute top-1.5 right-1.5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background transition-[opacity,transform] hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-95 disabled:bg-emerald-600 disabled:text-white"
        >
          {done ? (
            <Check className="h-4 w-4" aria-hidden />
          ) : (
            <ArrowRight className="h-4 w-4" aria-hidden />
          )}
        </button>
      </form>
      <p
        role="status"
        aria-live="polite"
        className={`mt-2 text-sm text-muted-foreground transition-opacity ${done ? "opacity-100" : "opacity-0"}`}
      >
        {done ? "Вы в списке. До связи." : "\u00a0"}
      </p>
    </div>
  );
}

const PROBE_PX = 100;

const FILL = 0.98;

const GLOW_R = 0.9;

function GiantBrand({ className }: { className?: string }): ReactNode {
  const colRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  const rawX = useMotionValue(-9999);
  const rawY = useMotionValue(-9999);
  const rawOn = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 300, damping: 30, mass: 0.5 });
  const y = useSpring(rawY, { stiffness: 300, damping: 30, mass: 0.5 });
  const on = useSpring(rawOn, { stiffness: 120, damping: 22 });
  const radius = useMotionValue(120);
  const mask = useMotionTemplate`radial-gradient(${radius}px at ${x}px ${y}px, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 28%, rgba(0,0,0,0.55) 58%, transparent 100%)`;

  useEffect(() => {
    const col = colRef.current;
    const row = rowRef.current;
    if (!col || !row) return;

    const measure = (): number => {
      const prevCol = col.style.fontSize;
      col.style.fontSize = `${PROBE_PX}px`;
      const ratio = row.getBoundingClientRect().width / PROBE_PX;
      col.style.fontSize = prevCol;
      return ratio;
    };
    let ratio = 0;
    const fit = (): void => {
      if (!ratio) ratio = measure();
      if (!ratio) return;
      const size = (col.clientWidth * FILL) / ratio;

      col.style.fontSize = `${size}px`;
      col.style.height = `${size * 0.72}px`;
      radius.set(size * 0.72 * GLOW_R);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(col);

    document.fonts?.ready.then(() => {
      ratio = 0;
      fit();
    });
    return () => ro.disconnect();
  }, [radius]);

  const onMove = (e: PointerEvent<HTMLDivElement>): void => {
    if (reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set(e.clientX - r.left);
    rawY.set(e.clientY - r.top);
    rawOn.set(1);
  };
  const onEnter = (e: PointerEvent<HTMLDivElement>): void => {
    if (reducedMotion) return;
    const r = e.currentTarget.getBoundingClientRect();

    x.jump(e.clientX - r.left);
    y.jump(e.clientY - r.top);
  };

  const rowClass =
    "absolute bottom-[-0.32em] left-1/2 flex -translate-x-1/2 items-end gap-[0.12em] leading-none font-medium tracking-[-0.05em] whitespace-nowrap select-none";
  const glyphs = (
    <>
      <LogoMark className="h-[0.86em] w-[0.86em] shrink-0 translate-y-[-0.13em]" />
      <span>CIFRA Vault</span>
    </>
  );

  return (
    <div
      ref={colRef}
      aria-hidden="true"
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={() => rawOn.set(0)}
      className="relative h-[15vw] overflow-hidden"
    >
      <div ref={rowRef} className={`${rowClass} ${className ?? ""}`}>
        {glyphs}
      </div>
      {!reducedMotion && (
        <motion.div
          style={{
            opacity: on,
            maskImage: mask,
            WebkitMaskImage: mask,
          }}
          className="absolute inset-0"
        >
          <div
            className={`${SPECTRUM_CLASS} ${rowClass} [background-size:200%_100%] bg-clip-text text-transparent motion-safe:animate-[spectrum-drift_14s_linear_infinite]`}
          >
            <span
              className={`inline-block h-[0.86em] w-[0.86em] shrink-0 translate-y-[-0.13em] [mask-image:url(/brand-mask.svg)] [background-size:200%_100%] [mask-size:100%_100%] motion-safe:animate-[spectrum-drift_14s_linear_infinite] ${SPECTRUM_CLASS}`}
            />
            <span>CIFRA Vault</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function Footer(): ReactNode {
  const ref = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end end"],
  });
  const rise = useTransform(scrollYProgress, [0, 1], ["52%", "0%"]);
  const fade = useTransform(scrollYProgress, [0, 0.6], [0.3, 1]);

  return (
    <footer
      ref={ref}
      aria-labelledby="footer-heading"
      className="relative overflow-hidden bg-background text-foreground"
    >
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>

      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <motion.div style={reducedMotion ? {} : { y: rise, opacity: fade }}>
          <GiantBrand className="text-foreground/[0.08] dark:text-foreground/[0.14]" />
        </motion.div>

        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.9, ease: softEase }}
          className="relative -mt-px mb-4 rounded-2xl border border-border bg-muted px-6 pt-10 pb-6 sm:mb-6 sm:px-10 sm:pt-12 lg:px-12"
        >
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-8">
            <Newsletter />

            <nav aria-label="Footer">
              <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3">
                {COLUMNS.map((col) => (
                  <div key={col.title}>
                    <h3 className="text-xs font-medium tracking-[0.08em] text-foreground/85 uppercase">
                      {col.title}
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {col.links.map((l) => (
                        <li key={l.label}>
                          <a
                            href={l.href}
                            className="group inline-flex items-center gap-1 rounded-sm text-[15px] text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                            {...(l.href.startsWith("http")
                              ? { rel: "noreferrer noopener" }
                              : {})}
                          >
                            <span className="relative">
                              {l.label}
                              <span
                                aria-hidden="true"
                                className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-foreground transition-transform duration-300 ease-out group-hover:scale-x-100"
                              />
                            </span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </nav>
          </div>

          <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 pb-10 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:pb-0">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="inline-flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 motion-reduce:hidden" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Все системы в норме
              </span>
              <span>
                &copy; {new Date().getFullYear()} {siteConfig.name}
              </span>
            </div>
            <ul className="flex flex-wrap items-center gap-5">
              {LEGAL.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="rounded-sm transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
