import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { PHOTOS, photoSrc } from "@/lib/photos";
import Image from "next/image";
import type { ReactNode } from "react";

const PHOTO = PHOTOS[1];

const FRAMES: {
  name: string;
  ratio: string;
  grow: string;
  aspect: string;
  position: string;
}[] = [
  {
    name: "Видеоинсталляция",
    ratio: "16:9",
    grow: "lg:flex-[1.7777777777777777_1_0%]",
    aspect: "aspect-[16/9]",
    position: "object-[50%_40%]",
  },
  {
    name: "Принт и проекция",
    ratio: "1:1",
    grow: "lg:flex-[1.0_1_0%]",
    aspect: "aspect-[1/1]",
    position: "object-[50%_50%]",
  },
  {
    name: "Портретный формат",
    ratio: "4:5",
    grow: "lg:flex-[0.8_1_0%]",
    aspect: "aspect-[4/5]",
    position: "object-[55%_50%]",
  },
  {
    name: "Вертикальный экран",
    ratio: "9:16",
    grow: "lg:flex-[0.5625_1_0%]",
    aspect: "aspect-[9/16]",
    position: "object-[60%_50%]",
  },
];

export function Formats(): ReactNode {
  return (
    <section aria-labelledby="formats-heading" className="py-24 sm:py-32">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
        <SectionHeading
          id="formats-heading"
          title="Любой формат — из одного оригинала."
          description="Храним TIFF, RAW, 16-бит и ProRes как есть, без пережатия. Виртуальный зал адаптирует показ под любой носитель — от музейного проектора до вертикального экрана."
        />

        <Reveal inView y={24} className="mt-12 lg:mt-14">
          <ul className="-mx-4 flex [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 md:gap-5 lg:mx-0 lg:overflow-visible lg:px-0 lg:pb-0 [&::-webkit-scrollbar]:hidden">
            {FRAMES.map((f) => (
              <li key={f.name} className={`min-w-0 flex-none ${f.grow}`}>
                <figure className="group flex flex-col">
                  <div
                    className={`relative isolate h-[180px] w-auto [transform:translateZ(0)] overflow-hidden rounded-2xl bg-muted sm:h-[260px] lg:h-auto lg:w-full ${f.aspect}`}
                  >
                    <Image
                      src={photoSrc(PHOTO, 1600, 1000)}
                      alt={`Цифровое произведение, показ в формате ${f.name} (${f.ratio}).`}
                      fill
                      sizes="(min-width: 1024px) 40vw, 100vw"
                      className={`object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.03] ${f.position}`}
                    />
                  </div>
                  <figcaption className="mt-4 flex items-baseline justify-between text-[15px]">
                    <span className="font-medium">{f.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {f.ratio}
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
