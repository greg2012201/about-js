type Props = {
  children: React.ReactNode;
};

function Layout({ children }: Props) {
  return <div className="flex flex-col">{children}</div>;
}

export default Layout;
