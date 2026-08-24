import type { TargetAndTransition, Transition } from "framer-motion";
import { motionTokens } from "@/lib/motion/tokens";
import type { BookEntrance } from "./types";

type EntrancePair = {
  hidden: TargetAndTransition;
  shown: TargetAndTransition;
};

export const ENTRANCES: Record<BookEntrance, EntrancePair> = {
  rise: {
    hidden: { opacity: 0, y: 72, rotateX: 7 },
    shown: { opacity: 1, y: 0, rotateX: 0 },
  },
  fromLeft: {
    hidden: { opacity: 0, x: -80, rotate: -6 },
    shown: { opacity: 1, x: 0, rotate: 0 },
  },
  fromStack: {
    hidden: { opacity: 0, x: 56, y: 40, rotate: 9 },
    shown: { opacity: 1, x: 0, y: 0, rotate: 0 },
  },
  drop: {
    hidden: { opacity: 0, y: -56, rotateX: -8 },
    shown: { opacity: 1, y: 0, rotateX: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: 88, rotate: 5 },
    shown: { opacity: 1, x: 0, rotate: 0 },
  },
  spin: {
    hidden: { opacity: 0, rotate: 14, scale: 0.93 },
    shown: { opacity: 1, rotate: 0, scale: 1 },
  },
};

export const FADE_ENTRANCE: EntrancePair = {
  hidden: { opacity: 0 },
  shown: { opacity: 1 },
};

export const entranceTransition = (delay = 0): Transition => ({
  duration: motionTokens.duration.page,
  ease: motionTokens.ease.paper,
  delay,
});
