import { ReactElement } from "react";
import "./globals.css";

function Layout({ children }: { children: ReactElement }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}

export default Layout;
