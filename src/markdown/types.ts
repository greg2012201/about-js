import { Node } from "unist";

export interface HastNode extends Node {
  type: string;
  tagName?: string;
  properties?: Record<string, any>;
  children?: HastNode[];
  value?: string;
  position?: {
    start: { line: number; column: number; offset?: number };
    end: { line: number; column: number; offset?: number };
  };
}

export type TableOfContentsItem = {
  title: string;
  href: string;
  level: number;
  children?: TableOfContentsItem[];
};
