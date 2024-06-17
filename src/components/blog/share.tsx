"use client";

import type { TableOfContentsItem } from "@/markdown/types";
import { useEffect } from "react";
import { useToast } from "../ui/use-toast";

type Props = { tocList: TableOfContentsItem[] };

function Share({ tocList }: Props) {
  const { toast } = useToast();
  useEffect(() => {
    tocList.forEach(({ href }: TableOfContentsItem) => {
      const headingElement = document.getElementById(href.replace("#", ""));
      if (!headingElement) {
        return;
      }
      headingElement.addEventListener("click", () => {
        navigator.clipboard
          .writeText(
            `${window.location.origin}${window.location.pathname}${href}`,
          )
          .then(() => {
            toast({
              title: "Link copied",
              description: "Thanks for sharing!",
              duration: 1500,
            });
          })
          .catch((err) => console.error("Failed to copy:", err));
      });
    });
  }, []);
  return null;
}

export default Share;
