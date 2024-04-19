import { Prettify } from "@/types";
import { useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

type AnimationConfigTuple = Record<
  "moveY" | "moveX" | "rotateX" | "rotateY",
  [number[], number[]] | undefined
>;

type Props = Prettify<
  {
    mouseMoveTriggerElementId: string;
  } & (AnimationConfigTuple | undefined)
>;

function useEyesIconAnimation({
  mouseMoveTriggerElementId,
  moveX = [
    [0, 1000],
    [-8, 8],
  ],
  moveY = [
    [0, 1000],
    [-8, 8],
  ],
  rotateX = [
    [0, 0],
    [30, -15],
  ],
  rotateY = [
    [0, 1000],
    [-15, 15],
  ],
}: Props) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const moveXTransform = useTransform(x, ...moveX);
  const moveYTransform = useTransform(y, ...moveY);

  const rotateYTransform = useTransform(x, ...rotateY);
  const rotateXTransform = useTransform(y, ...rotateX);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      x.set(e.pageX);
      y.set(e.pageY);
    };
    const triggerElement: HTMLDivElement | null = document.getElementById(
      mouseMoveTriggerElementId,
    ) as HTMLDivElement;
    if (!triggerElement) {
      return;
    }
    triggerElement.addEventListener("mousemove", handleMouseMove);

    return () =>
      triggerElement.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return { moveYTransform, moveXTransform, rotateXTransform, rotateYTransform };
}

export default useEyesIconAnimation;
