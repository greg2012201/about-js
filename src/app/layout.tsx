import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import TopBar from "@/components/top-bar";
import Footer from "@/components/footer";

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={lato.className}>
        <main className="relative  min-h-screen overflow-hidden bg-gradient-to-b from-[#141e30] via-[#243b55] to-[#243b55]">
          <TopBar />
          {children}
          <Footer />
        </main>
      </body>
    </html>
  );
}
