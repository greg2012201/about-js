import AboutAuthor from "@/components/sections/about-author";
import ContentContainer from "@/components/sections/content-container";
import Profile from "@/components/sections/profile";
import Separator from "@/components/sections/separator";
import WithBackgroundIcons from "@/components/with-backround-icons";
import composeMetadata from "@/lib/compose-metadata";
import { Link } from "@/navigation";
import { getTranslations, unstable_setRequestLocale } from "next-intl/server";
import { RiRobot2Line } from "react-icons/ri";

export async function generateMetadata() {
  return composeMetadata({ canonical: "/about", intlNamespace: "About" });
}

type Props = {
  params: { locale: string };
};

async function About({ params: { locale } }: Props) {
  unstable_setRequestLocale(locale);

  const t = await getTranslations("AboutPageContent");
  return (
    <>
      <Profile />
      <AboutAuthor />
      <Separator />
      <WithBackgroundIcons>
        <div className="mx-auto flex w-full flex-col items-center space-y-28 p-4 pb-28 text-white ">
          <ContentContainer
            title={t("frontend.title")}
            content={t("frontend.content")}
            orientation="left"
            imageConfig={{
              src: "/frontend.svg",
              alt: "logos of the frontend technologies",
            }}
          />
          <ContentContainer
            title={t("backend.title")}
            content={t("backend.content")}
            orientation="right"
            imageConfig={{
              src: "/backend.svg",
              alt: "logos of the frontend technologies",
            }}
          />
          <ContentContainer
            title={t("webDevFullstack.title")}
            content={t("webDevFullstack.content")}
            orientation="left"
            imageConfig={{
              src: "/backend_frontend.svg",
              alt: "logos of the frontend technologies",
            }}
          />
          <ContentContainer
            title={t("webAI.title")}
            content={t("webAI.content")}
            orientation="right"
            renderImage={
              <RiRobot2Line
                width={175}
                height={100}
                className="row-span-2 w-[175px] self-center text-[400px] text-[#61dafb] md:w-full md:pr-4"
              />
            }
          />

          <div className="z-20">
            <Link
              className="col-start-2 w-full text-center text-2xl text-pink-100 hover:text-pink-200 sm:text-3xl"
              href="/posts"
            >
              {t("linkSection.link")}
            </Link>
          </div>
        </div>
      </WithBackgroundIcons>
    </>
  );
}

export default About;
