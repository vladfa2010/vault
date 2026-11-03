"use client";

import { softEase, useReducedMotion } from "@/lib/motion";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;

  inView?: boolean;

  when?: boolean;

  scale?: number;
  duration?: number;
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 16,
  inView = false,
  when = true,
  scale,
  duration = 0.8,
}: Props): ReactNode {
  const reducedMotion = useReducedMotion();
  const hidden =
    scale === undefined ? { opacity: 0, y } : { opacity: 0, y, scale };
  const target =
    scale === undefined ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 };
  return (
    <motion.div
      className={className}
      initial={reducedMotion ? false : hidden}
      {...(inView
        ? { whileInView: target, viewport: { once: true, margin: "-80px" } }
        : { animate: when || reducedMotion ? target : hidden })}
      transition={{ duration, ease: softEase, delay }}
    >
      {children}
    </motion.div>
  );
}
