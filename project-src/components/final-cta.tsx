import { DotField } from "@/components/dot-field";
import { ImageHelix } from "@/components/image-helix";
import { Reveal } from "@/components/reveal";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

const SIGN_UP = "https://vault.cifra.com/sign-up";

export function FinalCta(): ReactNode {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative overflow-hidden pt-[14rem] pb-32 sm:pt-[25rem] sm:pb-40"
    >
      <DotField stageId="cta-copy" alpha={0.6} />
      <ImageHelix stageId="cta-heading" />
      <div
        id="cta-copy"
        className="relative mx-auto max-w-[1440px] px-4 text-center sm:px-6"
      >
        <Reveal inView y={12} scale={0.96} duration={1}>
          <div id="cta-stage">
            <h2
              id="cta-heading"
              className="mx-auto max-w-4xl font-serif text-[clamp(2.75rem,5.6vw,4.75rem)] leading-[1.0] tracking-[-0.025em] text-balance"
            >
              Ваше искусство — под защитой
              <br className="hidden sm:block" /> музейного стандарта.
            </h2>
          </div>
        </Reveal>
        <Reveal inView delay={0.1} y={12} scale={0.96} duration={1}>
          <p className="mx-auto mt-7 max-w-md text-[15px] leading-7 text-muted-foreground sm:text-base">
Начните с бесплатного тарифа: загрузите три работы, получите 1 ТБ
            хранения и сертификаты подлинности. Карта не нужна.
          </p>
        </Reveal>
        <Reveal
          inView
          delay={0.18}
          y={12}
          scale={0.96}
          duration={1}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <a
            href={SIGN_UP}
            className="group inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-foreground pr-4 pl-5 text-[15px] font-medium text-background shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_12px_32px_-14px_rgba(0,0,0,0.45)] transition-[transform,opacity] hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98]"
          >
            Начать бесплатно
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
          <a
            href="#pricing"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-foreground/[0.06] px-5 text-[15px] font-medium text-foreground transition-colors hover:bg-foreground/[0.1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring dark:bg-white/[0.1] dark:hover:bg-white/[0.14]"
          >
            Смотреть тарифы
          </a>
        </Reveal>
      </div>
    </section>
  );
}
