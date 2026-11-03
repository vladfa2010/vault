"use client";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { softEase, useReducedMotion } from "@/lib/motion";
import { siteConfig } from "@/lib/metadata";
import { PHOTOS, photoUrl, type PhotoId } from "@/lib/photos";
import { SPECTRUM_CLASS } from "@/lib/spectrum";
import { ArrowRight, Check } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import type { ReactNode } from "react";

interface Allowance {
  images: string;
  note: string;
}

interface Tier {
  name: string;
  blurb: string;
  cta: string;
  href: string;
  featured?: boolean;
  photo: PhotoId;
  price: number;
  decimals: number;
  allowance: Allowance;
  features: string[];
}

const SIGN_UP = "https://vault.cifra.com/sign-up";

const TIERS: Tier[] = [
  {
    name: "Старт",
    blurb: "Для художников, которые начинают цифровой архив.",
    cta: "Начать бесплатно",
    href: `${SIGN_UP}?plan=start`,
    photo: PHOTOS[3],
    price: 0,
    decimals: 0,
    allowance: {
      images: "1 ТБ хранения",
      note: "Бесплатно при загрузке 3 работ",
    },
    features: [
      "Хранение без пережатия — TIFF, RAW, 16-бит",
      "Хеш подлинности и таймстемп",
      "Публичная витрина — продажи и роялти",
      "Стандарт хранения 3-2-1",
    ],
  },
  {
    name: "Студия",
    blurb: "Для художников и студий с активной практикой.",
    cta: "Выбрать «Студию»",
    href: `${SIGN_UP}?plan=studio`,
    featured: true,
    photo: PHOTOS[6],
    price: 19.99,
    decimals: 2,
    allowance: {
      images: "5 ТБ хранения",
      note: "Без ограничения на число работ",
    },
    features: [
      "Всё из «Старта»",
      "Сертификаты подлинности и договоры",
      "Тиражи «N из M» под контролем",
      "Защищённая передача покупателю",
      "Роялти при вторичных продажах",
      "Виртуальный зал",
    ],
  },
  {
    name: "Коллекция",
    blurb: "Для коллекционеров, галерей и фондов.",
    cta: "Выбрать «Коллекцию»",
    href: `${SIGN_UP}?plan=collection`,
    photo: PHOTOS[8],
    price: 80,
    decimals: 0,
    allowance: {
      images: "20 ТБ хранения",
      note: "Каталог коллекции и оценка",
    },
    features: [
      "Всё из «Студии»",
      "Провенанс и смена владельца",
      "Каталог коллекции с оценкой",
      "Приоритетная миграция архива",
      "Именный куратор",
    ],
  },
];

const ENTERPRISE = [
  "Индивидуальные условия для институтов",
  "Музеи, фонды и университеты",
  "Миграция существующего архива",
  "SLA и приоритетная поддержка",
  "API и интеграция с каталогом",
  "Обучение команды",
  "Именный менеджер",
  "Инвойсы и закупочные документы",
];

function RollingNumber({
  value,
  decimals = 0,
}: {
  value: number;
  decimals?: number;
}): ReactNode {
  const reducedMotion = useReducedMotion();
  return (
    <span className="relative inline-flex h-[1em] overflow-hidden align-baseline">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reducedMotion ? false : { y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reducedMotion ? { opacity: 0 } : { y: "-100%", opacity: 0 }}
          transition={
            reducedMotion
              ? { duration: 0.1 }
              : { duration: 0.45, ease: softEase }
          }
          className="tabular-nums"
        >
          {value.toFixed(decimals)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Tag({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "accent";
}): ReactNode {
  return (
    <span
      className={`inline-flex h-6 items-center rounded-md px-2 text-xs font-medium ${
        tone === "accent"
          ? "bg-sky-500/12 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function FeatureList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}): ReactNode {
  return (
    <ul className={`space-y-2.5 text-[15px] ${className ?? ""}`}>
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2.5">
          <Check
            className="mt-[3px] h-4 w-4 shrink-0 text-foreground/60"
            strokeWidth={2.25}
            aria-hidden
          />
          <span className="text-foreground/85">{f}</span>
        </li>
      ))}
    </ul>
  );
}

function TierCard({ tier }: { tier: Tier }): ReactNode {
  const inner = (
    <div className="flex h-full flex-col rounded-[15px] bg-background p-6 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[1.375rem] leading-tight font-medium tracking-[-0.01em]">
            {tier.name}
          </h3>
          <p className="mt-1 text-[15px] text-muted-foreground">{tier.blurb}</p>
        </div>
        {tier.featured && (
          <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-md bg-foreground px-2 text-xs font-medium text-background">
            <span
              aria-hidden="true"
              className={`h-1.5 w-1.5 rounded-full [background-size:200%_100%] motion-safe:animate-[spectrum-drift_14s_linear_infinite] ${SPECTRUM_CLASS}`}
            />
            Выбирают чаще
          </span>
        )}
      </div>

      <div className="mt-8 flex items-baseline gap-2.5">
        <span className="font-serif text-[3.75rem] leading-none tracking-[-0.02em]">
          $<RollingNumber value={tier.price} decimals={tier.decimals} />
        </span>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {tier.price === 0 ? <Tag tone="accent">бесплатно</Tag> : <Tag>в месяц</Tag>}
      </div>

      <div className="mt-7 rounded-xl bg-muted p-3.5">
        <div className="flex items-center gap-3.5">
          <Image
            src={photoUrl(tier.photo, 112)}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0">
            <p className="text-[15px] font-medium tabular-nums">
              {tier.allowance.images}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground lg:truncate">
              {tier.allowance.note}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 border-t border-border pt-6 pb-10">
        <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
          Включает
        </p>
        <FeatureList items={tier.features} className="mt-4" />
      </div>

      <a
        href={tier.href}
        className={`group mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl text-[15px] font-medium transition-[opacity,background-color,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] ${
          tier.featured
            ? "bg-foreground text-background hover:opacity-85"
            : "bg-foreground/[0.06] text-foreground hover:bg-foreground/[0.1] dark:bg-white/[0.1] dark:hover:bg-white/[0.14]"
        }`}
      >
        {tier.cta}
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </a>
    </div>
  );

  if (tier.featured) {
    return (
      <div className="relative h-full rounded-2xl shadow-[0_28px_60px_-32px_rgba(0,0,0,0.28)] dark:shadow-none">
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-2xl [background-size:200%_100%] motion-safe:animate-[spectrum-drift_14s_linear_infinite] ${SPECTRUM_CLASS}`}
        />
        <div className="relative h-full p-px">{inner}</div>
      </div>
    );
  }
  return (
    <div className="h-full rounded-2xl border border-border transition-colors hover:border-foreground/20">
      {inner}
    </div>
  );
}

function Fan(): ReactNode {
  const cards: { id: PhotoId; className: string }[] = [
    {
      id: PHOTOS[1],
      className:
        "z-1 [transform:translateX(-46px)_rotate(-12deg)] motion-safe:group-hover:[transform:translateX(-62px)_rotate(-18deg)]",
    },
    {
      id: PHOTOS[4],
      className:
        "z-2 transform-none motion-safe:group-hover:[transform:translateY(-4px)]",
    },
    {
      id: PHOTOS[9],
      className:
        "z-1 [transform:translateX(46px)_rotate(12deg)] motion-safe:group-hover:[transform:translateX(62px)_rotate(18deg)]",
    },
  ];
  return (
    <div className="group relative flex h-full min-h-[220px] items-center justify-center overflow-hidden rounded-xl bg-foreground dark:bg-white/[0.06]">
      <div
        aria-hidden="true"
        className={`absolute inset-0 [background-size:200%_100%] opacity-25 blur-3xl motion-safe:animate-[spectrum-drift_14s_linear_infinite] ${SPECTRUM_CLASS}`}
      />
      {cards.map((card) => (
        <div
          key={card.id}
          className={`absolute h-[104px] w-[104px] overflow-hidden rounded-xl shadow-[0_18px_40px_-18px_rgba(0,0,0,0.7)] ring-1 ring-white/15 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${card.className}`}
        >
          <Image
            src={photoUrl(card.id, 224)}
            alt=""
            width={104}
            height={104}
            className="h-full w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

export function Pricing(): ReactNode {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-heading"
      className="scroll-mt-20 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="pricing-heading"
          title="Тарифы за функционал, а не за количество произведений."
          description="Оригинальное качество и верификация — в каждом тарифе. Начните бесплатно и переходите на больший объём, когда архив растёт."
        />

        <ul className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:mt-14">
          {TIERS.map((tier, i) => (
            <li key={tier.name} className="min-w-0">
              <Reveal inView delay={0.08 * i} y={24} className="h-full">
                <TierCard tier={tier} />
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal inView y={24} className="mt-4 md:mt-5">
          <div className="grid gap-6 rounded-2xl border border-border bg-muted p-3 sm:p-4 lg:grid-cols-[300px_minmax(0,1fr)_minmax(0,1.25fr)] lg:gap-10">
            <Fan />
            <div className="flex flex-col justify-center px-3 py-2 sm:px-4">
              <h3 className="font-serif text-[2.25rem] leading-none tracking-[-0.02em]">
                Институции
              </h3>
              <p className="mt-2 text-[15px] text-muted-foreground">
                Для музеев, фондов и университетов — на ваших условиях и под
                ваши регламенты.
              </p>
              <a
                href={`mailto:sales@${new URL(siteConfig.url).hostname}`}
                className="group mt-7 inline-flex h-11 w-fit items-center gap-2 rounded-xl bg-foreground pr-4 pl-5 text-[15px] font-medium text-background transition-[opacity,transform] hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98]"
              >
                Обсудить условия
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </a>
            </div>
            <div className="px-3 py-2 sm:px-4 lg:border-l lg:border-border lg:pl-10">
              <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">
                Включает
              </p>
              <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
                <FeatureList items={ENTERPRISE.slice(0, 4)} />
                <FeatureList
                  items={ENTERPRISE.slice(4)}
                  className="mt-2.5 sm:mt-0"
                />
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal
          inView
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Цены в USD, без учёта налогов. Тариф «Старт» бесплатен при загрузке
          трёх работ.
        </Reveal>
      </div>
    </section>
  );
}
