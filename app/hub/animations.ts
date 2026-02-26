import { Variants, Transition } from "framer-motion"

export const cardVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -4, 
    scale: 1.02,
  },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 20,
      mass: 0.7,
    } as Transition,
  },
};

export const cardBlurVariants: Variants = {
  hidden: { 
    filter: "blur(6px)",
  },
  show: {
    filter: "blur(0px)",
    transition: { duration: 0.3 },
  },
};

export const rowVariants = (delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: {
      delayChildren: delay,
      staggerChildren: 0, // No stagger - all cards animate together
    },
  },
});

export const contentFade: Variants = {
  hidden: { opacity: 0, y: 6, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.35, ease: "easeOut" as const },
  },
};
