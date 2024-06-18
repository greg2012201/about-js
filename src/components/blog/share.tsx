"use client";

import type { TableOfContentsItem } from "@/markdown/types";
import { MouseEvent, useCallback, useEffect } from "react";
import { useToast } from "../ui/use-toast";

type Props = { tocList: TableOfContentsItem[] };

function Share({ tocList }: Props) {
  const { toast } = useToast();
  const handleHeadingClick = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    navigator.clipboard
      .writeText(
        `${window.location.origin}${window.location.pathname}#${target.id}`,
      )
      .then(() => {
        toast({
          title: "Link copied",
          description: "Thanks for sharing!",
          duration: 1500,
        });
      })
      .catch((err) => console.error("Failed to copy:", err));
  }, []);
  useEffect(() => {
    const headingElements: HTMLElement[] = [];
    tocList.forEach(({ href }: TableOfContentsItem) => {
      const headingElement = document.getElementById(href.replace("#", ""));
      if (!headingElement) {
        return;
      }
      headingElements.push(headingElement);
    });
    headingElements.forEach((headingElement) =>
      headingElement.addEventListener("click", handleHeadingClick),
    );
    return () =>
      headingElements.forEach((headingElement) =>
        headingElement.removeEventListener("click", handleHeadingClick),
      );
  }, []);
  return null;
}

export default Share;
