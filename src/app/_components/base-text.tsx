type Props = {
  children: string;
};

function BaseText({ children }: Props) {
  return <p className="text-base font-light text-white">{children}</p>;
}

export default BaseText;
