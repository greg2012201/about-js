type Props = {
  children: string;
};

function Title({ children }: Props) {
  return <h2 className="text-2xl font-thin text-accent">{children}</h2>;
}

export default Title;
