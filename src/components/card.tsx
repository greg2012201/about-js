import { ReactNode } from "react";
import { ClassNameValue, twMerge } from "tailwind-merge";

type Props = {
  children: ReactNode;
  contentClassName?: ClassNameValue;
  wrapperClassName?: ClassNameValue;
};

function Card({ children, contentClassName, wrapperClassName }: Props) {
  return (
    <div
      className={typeof wrapperClassName === "string" ? wrapperClassName : ""}
    >
      <div
        className={`relative z-50 h-fit w-full overflow-hidden rounded-2xl border border-transparent bg-gradient-to-br from-indigo-800 to-pink-800/[0.2] group-hover:border-slate-700`}
      >
        <div className="bg-dot-white/[0.2] h-full self-center rounded-2xl p-4">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-slate-800  [mask-image:radial-gradient(ellipse_at_center,transparent_10%,black)]"></div>
          <div className="relative z-50">
            <div className={twMerge(contentClassName, `p-4`)}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Card;
