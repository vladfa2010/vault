"use client";

import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { FAQS } from "@/lib/faqs";
import { softEase, useReducedMotion } from "@/lib/motion";
import { Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type ReactNode } from "react";

function Item({
  q,
  a,
  open,
  onToggle,
  id,
}: {
  q: string;
  a: string;
  open: boolean;
  onToggle: () => void;
  id: string;
}): ReactNode {
  const reducedMotion = useReducedMotion();
  return (
    <li className="rounded-2xl bg-muted">
      <h3>
        <button
          type="button"
          id={`${id}-q`}
          aria-expanded={open}
          aria-controls={`${id}-a`}
          onClick={onToggle}
          className="group flex w-full items-center justify-between gap-6 rounded-2xl px-5 py-5 text-left text-[17px] leading-6 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:px-6 sm:py-6"
        >
          <span className="transition-colors group-hover:text-foreground/80">
            {q}
          </span>
          <motion.span
            aria-hidden="true"
            animate={{ rotate: open ? 45 : 0 }}
            transition={
              reducedMotion
                ? { duration: 0 }
                : { duration: 0.3, ease: softEase }
            }
            className="flex h-5 w-5 shrink-0 items-center justify-center text-foreground/60"
          >
            <Plus className="h-[18px] w-[18px]" />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`${id}-a`}
            role="region"
            aria-labelledby={`${id}-q`}
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={
              reducedMotion
                ? { duration: 0.1 }
                : { duration: 0.35, ease: softEase }
            }
            className="overflow-hidden"
          >
            <p className="max-w-2xl px-5 pb-6 text-[15px] leading-7 text-muted-foreground sm:px-6 sm:pb-7">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export function Faq(): ReactNode {
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="scroll-mt-20 py-24 sm:py-32"
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            id="faq-heading"
            title="Вопросы, которые задают до первой загрузки."
            description="Если не нашли ответ — напишите нам. Живой человек ответит в течение рабочего дня."
          />
        </div>
        <Reveal inView delay={0.1}>
          <ul className="flex flex-col gap-3">
            {FAQS.map((item, i) => (
              <Item
                key={item.q}
                {...item}
                id={`${baseId}-${i}`}
                open={open === i}
                onToggle={() => setOpen(open === i ? null : i)}
              />
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
