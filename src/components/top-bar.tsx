import Image from "next/image";
import { CgMenu } from "react-icons/cg";
function TopBar() {
  return (
    <div className="flex h-[40px] w-screen items-center justify-between bg-[rgba(0,0,0,0.47)] p-2">
      <Image
        width={74.6}
        height={26}
        src="./logo.svg"
        alt="typescript and javascript logo"
      />
      <CgMenu className="text-accent text-[25px]" />
    </div>
  );
}

export default TopBar;
