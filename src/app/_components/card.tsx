import { ReactNode } from "react";
import BaseText from "./base-text";

type Props = {
  children: ReactNode;
};

function Card({ children }: Props) {
  return (
    <div className=" relative z-50 h-full w-full overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-indigo-800 to-pink-800/[0.2]  group-hover:border-slate-700">
      <div className="h-full rounded-2xl p-4 bg-dot-white/[0.2]">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-800  [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]"></div>
        <div className="relative z-50">
          <div className="p-4">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default Card;
