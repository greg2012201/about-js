import { ReactElement } from "react";

type Props = {
  children: ReactElement;
};

function Layout({ children }: Props) {
  return <div className="mx-auto max-w-[950px] pt-4">{children}</div>;
}

export default Layout;
