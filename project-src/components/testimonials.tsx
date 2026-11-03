"use client";

import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { softEase, useReducedMotion } from "@/lib/motion";
import { PHOTOS, photoSrc, type PhotoId } from "@/lib/photos";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

interface Story {
  quote: string;
  name: string;
  role: string;
  company: string;
  photo: PhotoId;
  caption: string;
}

const STORIES: Story[] = [
  {
    quote:
      "Раньше мои работы жили на внешних дисках и в переписках. Теперь у каждой есть сертификат, история и витрина: я продаю тиражи прямо с платформы, а роялти приходит с каждой сделки и каждой перепродажи.",
    name: "Анна Соколова",
    role: "Художница, медиаарт",
    company: "Анна Соколова",
    photo: PHOTOS[9],
    caption: "Серия «Световые поля», сертифицированный оригинал.",
  },
  {
    quote:
      "Покупая цифровую работу, я покупаю не файл, а уверенность. Провенанс виден целиком — от первого хеша до моего имени владельца.",
    name: "Дмитрий Волков",
    role: "Коллекционер",
    company: "Частная коллекция",
    photo: PHOTOS[3],
    caption: "Приобретение с полной историей владения.",
  },
  {
    quote:
      "Мы перевели архив новых медиа в CIFRA Vault за один семестр. Интеграция с каталогом заняла недели, а не годы — и провенанс больше не ведётся вручную.",
    name: "Марина Огнева",
    role: "Куратор отдела новых медиа",
    company: "Музей современного искусства",
    photo: PHOTOS[6],
    caption: "Цифровой архив музея, стандарт 3-2-1.",
  },
  {
    quote:
      "Передача работы покупателю стала делом пяти минут: права переходят вместе с файлом, а галерея получает документ, который не оспорить.",
    name: "Игорь Савельев",
    role: "Директор галереи",
    company: "Галерея Точка",
    photo: PHOTOS[0],
    caption: "Сделка с сертификатом подлинности, день продажи.",
  },
];

const AUTO_MS = 7000;

export function Testimonials(): ReactNode {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const baseId = useId();
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (paused || reducedMotion) return;
    const t = window.setTimeout(
      () => setIndex((i) => (i + 1) % STORIES.length),
      AUTO_MS
    );
    return () => window.clearTimeout(t);
  }, [index, paused, reducedMotion]);

  const select = useCallback((i: number): void => {
    setIndex(i);
    setPaused(true);
  }, []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>): void => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (index + dir + STORIES.length) % STORIES.length;
    select(next);
    tabsRef.current
      ?.querySelectorAll<HTMLButtonElement>("[role=tab]")
      [next]?.focus();
  };

  const story = STORIES[index] ?? STORIES[0];
  if (!story) return null;

  const fade = reducedMotion
    ? { initial: false as const, animate: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
      };
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.5, ease: softEase };

  return (
    <section
      id="stories"
      aria-labelledby="stories-heading"
      className="scroll-mt-20 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="stories-heading"
          title="Те, кто уже хранит искусство у нас."
          description="Художники, коллекционеры и институты — о том, что изменилось, когда подлинность и провенанс стали частью инфраструктуры."
        />

        <Reveal inView y={24} className="mt-12 lg:mt-14">
          <div
            onPointerEnter={() => setPaused(true)}
            className="grid gap-6 rounded-2xl border border-border bg-muted p-2 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8"
          >
            <div className="flex min-w-0 flex-col justify-between px-4 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pt-10 lg:pb-8">
              <div className="relative min-h-[14rem] sm:min-h-[12rem]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.blockquote
                    key={index}
                    id={`${baseId}-panel-${index}`}
                    role="tabpanel"
                    aria-labelledby={`${baseId}-tab-${index}`}
                    {...fade}
                    transition={transition}
                  >
                    <p className="font-serif text-[clamp(1.75rem,2.8vw,2.625rem)] leading-[1.15] tracking-[-0.015em] text-pretty">
                      &ldquo;{story.quote}&rdquo;
                    </p>
                    <footer className="mt-8 text-[15px]">
                      <span className="font-medium">{story.name}</span>
                      <span className="text-muted-foreground">
                        , {story.role}, {story.company}
                      </span>
                    </footer>
                  </motion.blockquote>
                </AnimatePresence>
              </div>

              <div
                ref={tabsRef}
                role="tablist"
                aria-label="Stories"
                onKeyDown={onKeyDown}
                className="-mx-6 mt-12 flex [scrollbar-width:none] gap-x-7 overflow-x-auto px-6 pt-5 whitespace-nowrap sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
              >
                {STORIES.map((s, i) => {
                  const active = i === index;
                  return (
                    <button
                      key={s.name}
                      type="button"
                      role="tab"
                      id={`${baseId}-tab-${i}`}
                      aria-selected={active}
                      aria-controls={`${baseId}-panel-${i}`}
                      tabIndex={active ? 0 : -1}
                      onClick={() => select(i)}
                      className={`relative -mt-5 shrink-0 rounded-sm pt-5 text-[15px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
                        active
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="story-tab"
                          aria-hidden="true"
                          className="absolute inset-x-0 -top-px h-px bg-foreground"
                          transition={
                            reducedMotion
                              ? { duration: 0 }
                              : { type: "spring", stiffness: 400, damping: 40 }
                          }
                        />
                      )}
                      {s.company}
                    </button>
                  );
                })}
              </div>
            </div>

            <figure className="relative aspect-[4/5] overflow-hidden rounded-[8px] bg-background sm:aspect-[5/4] lg:aspect-auto lg:min-h-[420px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={story.photo}
                  initial={reducedMotion ? false : { opacity: 0, scale: 1.03 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
                  transition={
                    reducedMotion
                      ? { duration: 0 }
                      : { duration: 0.7, ease: softEase }
                  }
                  className="absolute inset-0"
                >
                  <Image
                    src={photoSrc(story.photo, 1200, 1400)}
                    alt={story.caption}
                    fill
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent"
              />
              <AnimatePresence mode="wait" initial={false}>
                <motion.figcaption
                  key={index}
                  {...fade}
                  transition={transition}
                  className="absolute inset-x-0 bottom-0 p-5 text-[15px] text-white sm:p-6"
                >
                  {story.caption}
                </motion.figcaption>
              </AnimatePresence>
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
