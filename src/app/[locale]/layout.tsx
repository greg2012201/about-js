import { Lato } from "next/font/google";
import "../globals.css";
import TopBar from "@/components/top-bar";
import Footer from "@/components/footer";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { unstable_setRequestLocale } from "next-intl/server";
import { LOCALES } from "@/next-intl-config";
import { getRootMetadata } from "@/lib/compose-metadata";
import { type Locale } from "@/types";

type Params = { locale: Locale };

type Props = {
  children: React.ReactNode;
  params: Params;
};

const lato = Lato({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
});

export async function generateMetadata() {
  return await getRootMetadata();
}

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params: { locale },
}: Props) {
  unstable_setRequestLocale(locale);

  const messages = await getMessages();
  return (
    <html className="dark" style={{ colorScheme: "dark" }} lang={locale}>
      <body className={lato.className}>
        <NextIntlClientProvider messages={messages}>
          <main className="relative flex min-h-screen flex-col justify-between bg-gradient-to-b from-[#141e30] via-[#243b55] to-[#243b55] text-white">
            <TopBar />
            {children}
            <Footer />
          </main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
