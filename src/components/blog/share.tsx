"use client";

import type { TableOfContentsItem } from "@/lib/markdown/types";
import { useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

type Props = { tocList: TableOfContentsItem[] };

function Share({ tocList }: Props) {
  const t = useTranslations("Share");
  const handleHeadingClick = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    navigator.clipboard
      .writeText(
        `${window.location.origin}${window.location.pathname}#${target.id}`,
      )
      .then(() => {
        toast.success(t("success"));
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
