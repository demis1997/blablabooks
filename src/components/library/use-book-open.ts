"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export function useBookOpen(amount = 0.28) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const inView = useInView(ref, { once: true, amount });
  return {
    ref,
    open: reduceMotion || inView,
    inView,
    reduceMotion,
  };
}
