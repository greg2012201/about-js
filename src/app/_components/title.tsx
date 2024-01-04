import generateRandomGradient from "@/utils/generate-random-gradient";

type Props = {
  children: string;
};

function Title({ children }: Props) {
  return (
    <h2
      className={`${generateRandomGradient(
        ["indigo-500", "purple-500", "pink-500"],
        "to-r",
      )} bg-clip-text text-2xl font-semibold text-transparent`}
    >
      {children}
    </h2>
  );
}

export default Title;
