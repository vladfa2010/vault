import type { ReactNode } from "react";

const MODULES: { mark: string; title: string; text: string; href: string; cta: string }[] = [
  {
    mark: "f(x)",
    title: "Генеративный арт",
    text: "Храним не только финальный рендер, но и исходный код, сиды, параметры и датасеты. Подлинник — это код, параметры и вывод: работу можно воспроизвести заново в любой момент.",
    href: "https://generativelab.onrender.com",
    cta: "Открыть Generative Lab",
  },
  {
    mark: "1-UP",
    title: "Гейм-арт",
    text: "Ассеты, сцены, шейдеры, версии проекта — хранение целиком, с историей версий. Игровое искусство получает статус классических медиа: сертификаты, тиражи, провенанс.",
    href: "https://gameartlab.onrender.com",
    cta: "Открыть Game Art Lab",
  },
];

export function Nonstandard(): ReactNode {
  return (
    <section aria-labelledby="nonstandard-heading" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2
              id="nonstandard-heading"
              className="max-w-3xl font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.02] tracking-[-0.02em] text-balance"
            >
              Нестандартное хранение.
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-pretty text-muted-foreground sm:text-base">
              Специализация под запрос креатора: не загоняем нестандартные
              форматы в общий знаменатель. Код, сиды, ассеты и проекты хранятся
              как есть — с полной верификацией и стандартом 3-2-1.
            </p>
          </div>
        </div>

        <div className="nonstd-reveal mt-12 lg:mt-14">
          <div className="rounded-2xl border border-border bg-muted p-6 sm:p-8 lg:p-10">
            <ul className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              {MODULES.map((m) => (
                <li key={m.title} className="flex items-baseline gap-6">
                  <span
                    className="font-serif whitespace-nowrap text-[3rem] leading-none"
                    style={{ width: "6.5rem" }}
                  >
                    {m.mark}
                  </span>
                  <div>
                    <p className="text-lg font-medium">{m.title}</p>
                    <p className="mt-1 max-w-md text-[15px] leading-7 text-muted-foreground">
                      {m.text}
                    </p>
                    <a
                      href={m.href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      {m.cta}
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
