type Props = {
  children: string;
};

function Italic({ children }: Props) {
  return <p className="text-base italic text-white">{children}</p>;
}

export default Italic;
