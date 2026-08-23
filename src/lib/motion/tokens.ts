export const motionTokens = {
  duration: { fast: 0.25, page: 0.75, intro: 1.2, slow: 1.0 },
  ease: {
    paper: [0.22, 1, 0.36, 1],
    settle: [0.34, 1.2, 0.64, 1],
    ink: [0.4, 0, 0.2, 1],
  },
  spring: {
    soft: { type: "spring", stiffness: 280, damping: 28 },
    stamp: { type: "spring", stiffness: 420, damping: 22 },
  },
  perspective: 1400,
  tiltMax: 6, // degrees for cover pointer tilt
  cardTilt: 1.5,
  stagger: 0.06,
} as const;
