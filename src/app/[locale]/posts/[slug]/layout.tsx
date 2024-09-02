import { ReactElement } from "react";
import dynamic from "next/dynamic";

const Toaster = dynamic(() =>
  import("@/components/ui/sonner").then((module) => module.Toaster),
);

type Props = {
  children: ReactElement;
};

function Layout({ children }: Props) {
  return (
    <div className="mx-auto flex max-w-[950px] flex-col px-2 pt-4">
      {children}
      <Toaster />
    </div>
  );
}

export default Layout;
