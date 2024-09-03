import { ReactElement } from "react";

type Props = {
  children: ReactElement;
};

function Layout({ children }: Props) {
  return (
    <div className="mx-auto flex max-w-[950px] flex-col px-2 pt-4">
      {children}
    </div>
  );
}

export default Layout;
