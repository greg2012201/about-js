import { ReactElement } from "react";

function Layout({ children }: { children: ReactElement }) {
  return (
    <html>
      <main>
        <body>{children}</body>
      </main>
    </html>
  );
}

export default Layout;
