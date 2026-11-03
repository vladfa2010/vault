"use client";

import { quickEase, softEase, useReducedMotion } from "@/lib/motion";
import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

export function LogoMark({ className }: { className?: string }): ReactNode {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <rect x="2" y="2" width="16" height="16" rx="4" />
      <path
        d="M10 5.5 14.5 10 10 14.5 5.5 10Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

export function Logo({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}): ReactNode {
  const reducedMotion = useReducedMotion();
  return (
    <a
      href="#top"
      aria-label="CIFRA Vault — на главную"
      className={`inline-flex items-center rounded-lg text-[15px] font-medium tracking-[-0.01em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${className ?? ""}`}
    >
      <LogoMark className="h-5 w-5 shrink-0" />
      <AnimatePresence initial={false}>
        {!compact && (
          <motion.span
            key="wordmark"
            className="overflow-hidden whitespace-nowrap"
            initial={reducedMotion ? false : { width: 0, opacity: 0 }}
            animate={{
              width: "auto",
              opacity: 1,
              transition: reducedMotion
                ? { duration: 0 }
                : { duration: 0.4, ease: softEase },
            }}
            exit={{
              width: 0,
              opacity: 0,
              transition: reducedMotion
                ? { duration: 0 }
                : { duration: 0.25, ease: quickEase },
            }}
          >
            <span className="block pl-2">CIFRA Vault</span>
          </motion.span>
        )}
      </AnimatePresence>
    </a>
  );
}
