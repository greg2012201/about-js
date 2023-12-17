import Image from "next/image";
import Link from "next/link";

type Props = {
  handleClick?: VoidFunction;
};

function Logo({ handleClick }: Props) {
  return (
    <Link onClick={handleClick} href="/">
      <Image
        width={74.6}
        height={26}
        src="./logo.svg"
        alt="typescript and javascript logo"
      />
    </Link>
  );
}

export default Logo;
