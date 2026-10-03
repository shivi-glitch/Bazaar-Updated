import { useInView } from "motion/react";
import { useRef } from "react";

export function useReveal(once = true, amount: "some" | "all" | number = "some") {
  const ref = useRef<HTMLElement | SVGElement | any>(null);
  const isInView = useInView(ref, { once, amount });
  return { ref, isInView };
}
