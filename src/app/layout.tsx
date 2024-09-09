import { ReactElement } from "react";
import "./globals.css";

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
