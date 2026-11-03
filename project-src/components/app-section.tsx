import { Device } from "@/components/device";
import type { ReactNode } from "react";

const FEATURES: string[] = [
  "Коллекция, сертификаты и провенанс — всегда под рукой",
  "Доступ по ссылкам: открыть или закрыть в один клик",
  "Уведомления о просмотрах, продажах и начислениях роялти",
  "Показ работ на большом экране через Apple TV",
];

const PLATFORMS: { label: string; icon: ReactNode }[] = [
  {
    label: "iOS",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <path d="M12 6.528V3a1 1 0 0 1 1-1h0" />
        <path d="M18.237 21A15 15 0 0 0 22 11a6 6 0 0 0-10-4.472A6 6 0 0 0 2 11a15.1 15.1 0 0 0 3.763 10 3 3 0 0 0 3.648.648 5.5 5.5 0 0 1 5.178 0A3 3 0 0 0 18.237 21" />
      </svg>
    ),
  },
  {
    label: "Android",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <rect width="14" height="20" x="5" y="2" rx="2" ry="2" />
        <path d="M12 18h.01" />
      </svg>
    ),
  },
  {
    label: "Apple TV",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <rect width="20" height="15" x="2" y="7" rx="2" />
        <path d="m17 2-5 5-5-5" />
      </svg>
    ),
  },
  {
    label: "Веб",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M10 4v4" />
        <path d="M2 8h20" />
        <path d="M6 4v4" />
      </svg>
    ),
  },
];

export function AppSection(): ReactNode {
  return (
    <section aria-labelledby="apps-heading" className="overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
          <div className="nonstd-reveal">
            <h2
              id="apps-heading"
              className="max-w-3xl font-serif text-[clamp(2.25rem,4.5vw,3.5rem)] leading-[1.02] tracking-[-0.02em] text-balance"
            >
              Вся коллекция — в кармане.
            </h2>
            <p className="mt-5 max-w-xl text-[15px] leading-7 text-pretty text-muted-foreground sm:text-base">
              Приложение CIFRA Vault для iOS и Android: работы, сертификаты,
              провенанс и продажи под полным контролем. Показывайте коллекцию на
              большом экране, управляйте доступом и следите за роялти из любой
              точки. Веб-версия — с любого компьютера.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-3 text-[15px]">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-foreground/10">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <ul className="mt-8 flex flex-wrap gap-3">
              {PLATFORMS.map((p) => (
                <li
                  key={p.label}
                  className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm text-muted-foreground"
                >
                  {p.icon}
                  <span>{p.label}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="nonstd-reveal flex justify-center pb-10 pt-4">
            <Device
              image="/device-screen.webp"
              finish="titanium"
              rotateX={22}
              rotateY={-10}
              rotateZ={6}
              float={2}
              lift={1.4}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
