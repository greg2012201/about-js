import { ClassNameValue, twMerge } from "tailwind-merge";

type Props = {
  children: string;
  className?: ClassNameValue;
};

function BaseText({ children, className }: Props) {
  return (
    <p className={twMerge(`text-xl  text-slate-300`, className)}>{children}</p>
  );
}

export default BaseText;
