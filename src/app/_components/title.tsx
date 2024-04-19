type Props = {
  children: string;
};

function Title({ children }: Props) {
  return (
    <h2 className={`text-3xl font-semibold text-indigo-400  md:text-5xl`}>
      {children}
    </h2>
  );
}

export default Title;
