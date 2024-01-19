type Props = {
  children: string;
};

function Title({ children }: Props) {
  return (
    <h2
      className={` bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-3xl font-semibold text-transparent`}
    >
      {children}
    </h2>
  );
}

export default Title;
