import { ClassNameValue, twMerge } from "tailwind-merge";

type Props = {
  children: string;
  className?: ClassNameValue;
};

function Title({ children, className }: Props) {
  return (
    <h2
      className={twMerge(
        className,
        `text-3xl font-semibold text-indigo-400  md:text-5xl`,
      )}
    >
      {children}
    </h2>
  );
}

export default Title;
