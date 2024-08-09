type Props = {
  children: React.ReactNode;
  params: { locale: string };
};

function Layout({ children }: Props) {
  return <div className="flex flex-col items-center">{children}</div>;
}

export default Layout;
