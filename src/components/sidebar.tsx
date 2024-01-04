import { ReactNode, forwardRef } from "react";
import { twMerge } from "tailwind-merge";
import Logo from "./logo";
import { IoCloseSharp } from "react-icons/io5";

type Props = {
  open: boolean;
  handleClose: VoidFunction;
  navList: ReactNode;
};

const Sidebar = forwardRef<HTMLDivElement, Props>(
  ({ open, handleClose, navList }, ref) => {
    const openClass = open ? "translate-x-[-300px]" : "translate-x-0";
    return (
      <nav
        ref={ref}
        className={twMerge(
          "fixed right-[-300px] top-0 z-20 bg-gradient-to-b from-[#141e30] via-[#243b55] to-[#243b55] shadow-lg duration-150",
          openClass,
        )}
      >
        <div className="flex h-screen w-[300px] flex-col gap-4 bg-[rgba(0,0,0,0.47)] px-4 py-2 pr-2">
          <div className="flex items-center justify-between">
            <Logo handleClick={handleClose} />
            <button type="button" onClick={handleClose}>
              <IoCloseSharp className="h-[25px] w-[25px] text-purple-500" />
            </button>
          </div>
          {navList}
        </div>
      </nav>
    );
  },
);

Sidebar.displayName = "Sidebar";

export default Sidebar;
