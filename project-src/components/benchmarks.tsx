"use client";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { softEase, useReducedMotion } from "@/lib/motion";
import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";


const VOLUME = [12, 18, 26, 34, 48, 62, 80, 105, 130, 160, 195, 240];
const FIRST_TAKE = 0.999;

const ROUTES: {
  name: string;
  seconds: number;
  label: string;
  ours?: boolean;
}[] = [
  { name: "CIFRA Vault", seconds: 300, label: "5 мин", ours: true },
  { name: "Почта и мессенджеры", seconds: 2 * 3600, label: "2 ч" },
  { name: "Курьер с диском", seconds: 2 * 86400, label: "2 дня" },
  { name: "Международная логистика", seconds: 21 * 86400, label: "3 нед" },
];
const AXIS_MIN = Math.log10(10);
const AXIS_MAX = Math.log10(60 * 86400);
const AXIS_TICKS: { seconds: number; label: string }[] = [
  { seconds: 60, label: "1 мин" },
  { seconds: 3600, label: "1 час" },
  { seconds: 86400, label: "1 день" },
  { seconds: 7 * 86400, label: "1 неделя" },
  { seconds: 30 * 86400, label: "1 месяц" },
];
const pos = (s: number): number =>
  ((Math.log10(s) - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;

function CountUp({
  value,
  decimals = 0,
  active,
  className,
}: {
  value: number;
  decimals?: number;
  active: boolean;
  className?: string;
}): ReactNode {
  const reducedMotion = useReducedMotion();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active || reducedMotion) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: softEase,
      onUpdate: (v) => setShown(v),
    });
    return () => controls.stop();
  }, [active, value, reducedMotion]);
  const text = (reducedMotion ? value : shown).toFixed(decimals);
  return (
    <span className={className}>
      <span className="sr-only">{value.toFixed(decimals)}</span>
      <span aria-hidden="true" className="tabular-nums">
        {text}
      </span>
    </span>
  );
}

  const reducedMotion = useReducedMotion();
  const on = active || reducedMotion;
  const max = Math.max(...VOLUME);
  return (
    <div className="flex h-16 items-end gap-1.5" aria-hidden="true">
      {VOLUME.map((v, i) => (
        <motion.span
          key={i}
          style={{ height: `${(v / max) * 100}%` }}
          initial={{ scaleY: 0 }}
          animate={{ scaleY: on ? 1 : 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.9,
            ease: softEase,
            delay: reducedMotion ? 0 : 0.04 * i,
          }}
          className={`flex-1 origin-bottom rounded-[2px] ${
            i === VOLUME.length - 1 ? "bg-foreground" : "bg-foreground/[0.16]"
          }`}
        />
      ))}
    </div>
  );
}

function ApprovalArc({ active }: { active: boolean }): ReactNode {
  const reducedMotion = useReducedMotion();
  const on = active || reducedMotion;
  const r = 28;
  const c = 2 * Math.PI * r;
  return (
    <svg
      viewBox="0 0 64 64"
      className="h-16 w-16 -rotate-90 max-xl:hidden"
      aria-hidden="true"
    >
      <circle
        cx={32}
        cy={32}
        r={r}
        fill="none"
        strokeWidth={5}
        className="stroke-foreground/[0.12]"
      />
      <motion.circle
        cx={32}
        cy={32}
        r={r}
        fill="none"
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={c}
        className="stroke-foreground"
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: on ? c * (1 - FIRST_TAKE) : c }}
        transition={{ duration: reducedMotion ? 0 : 1.4, ease: softEase }}
      />
    </svg>
  );
}

function RulesMatrix({ active }: { active: boolean }): ReactNode {
  const reducedMotion = useReducedMotion();
  const on = active || reducedMotion;
  return (
    <div className="grid h-16 w-16 grid-cols-10 gap-[3px] max-xl:hidden" aria-hidden="true">
      {Array.from({ length: 100 }, (_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: on ? 1 : 0 }}
          transition={{
            duration: 0.3,
            delay: reducedMotion ? 0 : 0.008 * i,
          }}
          className={`rounded-full ${
            i === 37 ? "bg-foreground/[0.18]" : "bg-foreground"
          }`}
        />
      ))}
    </div>
  );
}

function Timeline({ active }: { active: boolean }): ReactNode {
  const reducedMotion = useReducedMotion();
  const on = active || reducedMotion;
  return (
    <div className="relative mt-36 mb-14 hidden h-px bg-border md:block">
      {AXIS_TICKS.map((t) => (
        <div
          key={t.label}
          style={{ left: `${pos(t.seconds)}%` }}
          className="absolute top-0 -translate-x-1/2"
        >
          <span className="block h-2 w-px bg-border" />
          <span className="mt-2 block text-xs whitespace-nowrap text-muted-foreground">
            {t.label}
          </span>
        </div>
      ))}
      {ROUTES.map((r, i) => (
        <motion.div
          key={r.name}
          style={{ left: `${pos(r.seconds)}%` }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: on ? 1 : 0, y: on ? 0 : 8 }}
          transition={{
            duration: reducedMotion ? 0 : 0.6,
            ease: softEase,
            delay: reducedMotion ? 0 : 0.2 + 0.12 * i,
          }}
          className="absolute bottom-0 -translate-x-1/2"
        >
          <div className="flex flex-col items-center">
            <span
              className={`font-serif whitespace-nowrap ${
                r.ours
                  ? "text-[2rem] leading-none"
                  : "text-[1.25rem] leading-none text-muted-foreground"
              }`}
            >
              {r.label}
            </span>
            <span
              className={`mt-1.5 text-xs whitespace-nowrap ${
                r.ours ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {r.name}
            </span>
            <span className="mt-3 h-6 w-px bg-border" />
            <span
              className={`-mb-[5px] block h-[11px] w-[11px] rounded-full ring-4 ring-muted ${
                r.ours
                  ? "bg-foreground"
                  : "border border-foreground/50 bg-muted"
              }`}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function Benchmarks(): ReactNode {
  const stripRef = useRef<HTMLUListElement>(null);
  const stripOn = useInView(stripRef, { once: true, margin: "-15% 0px" });
  const lineRef = useRef<HTMLDivElement>(null);
  const lineOn = useInView(lineRef, { once: true, margin: "-15% 0px" });

  return (
    <section
      id="benchmarks"
      aria-labelledby="benchmarks-heading"
      className="scroll-mt-20 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="benchmarks-heading"
          title="Надежнее, чем жесткий диск в вашем сейфе."
          description="Музейный стандарт 3-2-1, проверка целостности каждого файла и передача прав за минуты. Мы задаём новые стандарты индустрии цифрового искусства."
        />

        <Reveal inView y={24} className="mt-12 lg:mt-14">
          <div className="rounded-2xl border border-border bg-muted p-6 sm:p-8 lg:p-10">
            <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
              <div className="flex flex-col">
                <p className="font-serif text-[5rem] leading-[0.9] tracking-[-0.03em] sm:text-[6.5rem]">
                  3-2-1
                </p>
                <h3 className="mt-6 text-lg font-medium">
                  Стандарт хранения 3-2-1 — расшифровка
                </h3>
                <p className="mt-2 max-w-sm text-[15px] leading-7 text-muted-foreground">
                  Правило музейной архивации: три копии, два разных носителя,
                  одна копия вне основной площадки. Применяется к каждому файлу
                  автоматически — при загрузке.
                </p>
              </div>
              <ul className="flex flex-col justify-center gap-6">
                <li className="flex items-baseline gap-6">
                  <span
                    className="font-serif text-[3rem] leading-none"
                    style={{ width: "4rem" }}
                  >
                    3
                  </span>
                  <div>
                    <p className="text-lg font-medium">Копии каждого файла</p>
                    <p className="mt-1 text-[15px] leading-7 text-muted-foreground">
                      Оригинал и две независимые резервные копии. Потеря любой
                      одной ничего не стоит.
                    </p>
                  </div>
                </li>
                <li className="flex items-baseline gap-6">
                  <span
                    className="font-serif text-[3rem] leading-none"
                    style={{ width: "4rem" }}
                  >
                    2
                  </span>
                  <div>
                    <p className="text-lg font-medium">Разных типа носителей</p>
                    <p className="mt-1 text-[15px] leading-7 text-muted-foreground">
                      Объектное хранилище и ленточная библиотека — сбой одной
                      технологии не затрагивает вторую.
                    </p>
                  </div>
                </li>
                <li className="flex items-baseline gap-6">
                  <span
                    className="font-serif text-[3rem] leading-none"
                    style={{ width: "4rem" }}
                  >
                    1
                  </span>
                  <div>
                    <p className="text-lg font-medium">Копия вне площадки</p>
                    <p className="mt-1 text-[15px] leading-7 text-muted-foreground">
                      Географически изолированный дата-центр: пожар, затопление
                      или кража основной площадки архив не уничтожат.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal inView y={24} delay={0.05} className="mt-4 md:mt-5">
          <ul
            ref={stripRef}
            className="grid grid-cols-1 divide-y divide-border rounded-2xl border border-border bg-background md:grid-cols-3 md:divide-x md:divide-y-0"
          >
            <li className="flex items-end justify-between gap-6 p-6 sm:p-8">
              <div>
                <p className="font-serif text-[3rem] leading-none tracking-[-0.02em]">
                  <CountUp value={240} active={stripOn} />
                  <span className="text-[0.55em] text-muted-foreground">ТБ</span>
                </p>
                <p className="mt-3 text-[15px] text-muted-foreground">
                  Цифрового искусства под защитой
                </p>
              </div>
              <div className="w-32 shrink-0 sm:w-40 max-xl:hidden">
                <VolumeBars active={stripOn} />
              </div>
            </li>
            <li className="flex items-end justify-between gap-6 p-6 sm:p-8">
              <div>
                <p className="font-serif text-[3rem] leading-none tracking-[-0.02em]">
                  <CountUp value={99.9} decimals={1} active={stripOn} />
                  <span className="text-[0.55em] text-muted-foreground">%</span>
                </p>
                <p className="mt-3 text-[15px] text-muted-foreground">
                  Доступность хранилища за год
                </p>
              </div>
              <ApprovalArc active={stripOn} />
            </li>
            <li className="flex items-end justify-between gap-6 p-6 sm:p-8">
              <div>
                <p className="font-serif text-[3rem] leading-none tracking-[-0.02em]">
                  <CountUp value={6500} active={stripOn} />
                </p>
                <p className="mt-3 text-[15px] text-muted-foreground">
                  Произведений под защитой
                </p>
              </div>
              <RulesMatrix active={stripOn} />
            </li>
          </ul>
        </Reveal>

        <Reveal inView y={24} delay={0.05} className="mt-4 md:mt-5">
          <div
            ref={lineRef}
            className="rounded-2xl border border-border bg-muted p-6 sm:p-8 lg:p-10"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <h3 className="font-serif text-[2rem] leading-[1.05] tracking-[-0.02em]">
                Передача работы новому владельцу.
              </h3>
              <p className="max-w-md text-[15px] leading-7 text-muted-foreground">
                Четыре способа передать произведение, измеренные от начала до
                конца. Логарифмическая шкала — чтобы вся история уместилась на
                одной линии.
              </p>
            </div>
            <Timeline active={lineOn} />

            <ul className="mt-8 divide-y divide-border md:hidden">
              {ROUTES.map((r) => (
                <li
                  key={r.name}
                  className="flex items-baseline justify-between py-3"
                >
                  <span
                    className={
                      r.ours ? "text-foreground" : "text-muted-foreground"
                    }
                  >
                    {r.name}
                  </span>
                  <span
                    className={`font-serif text-xl ${
                      r.ours ? "" : "text-muted-foreground"
                    }`}
                  >
                    {r.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
