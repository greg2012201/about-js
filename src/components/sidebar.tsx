import { ReactNode, forwardRef } from "react";
import { ClassNameValue, twMerge } from "tailwind-merge";
import Logo from "./logo";
import { IoCloseSharp } from "react-icons/io5";

type Props = {
  open: boolean;
  handleClose: VoidFunction;
  navList: ReactNode;
  className?: ClassNameValue;
};

const Sidebar = forwardRef<HTMLDivElement, Props>(
  ({ open, handleClose, navList, className }, ref) => {
    const openClass = open ? "translate-x-[-300px]" : "translate-x-0";
    return (
      <nav
        ref={ref}
        className={twMerge(
          "fixed right-[-300px] top-0 z-50 bg-gradient-to-b from-[#141e30] via-[#243b55] to-[#243b55] shadow-lg duration-150",
          openClass,
          className,
        )}
      >
        <div className="flex h-screen w-screen flex-col gap-4 bg-[rgba(0,0,0,0.47)] px-4 py-2 pr-2 [@media(min-width:300px)]:w-[300px]">
          <div className="flex items-center justify-between">
            <Logo handleClick={handleClose} />
            <button type="button" onClick={handleClose}>
              <IoCloseSharp className="h-[34px] w-[34px] text-purple-500" />
            </button>
          </div>
          <hr className="w-full border-purple-300" />
          {navList}
        </div>
      </nav>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
