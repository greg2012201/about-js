import AnimatedIcons from "./animated-icons";
import BaseText from "@/components/base-text";
import { Subtitle, Title } from "@/components/brand-title";
import { getTranslations } from "next-intl/server";

async function Intro() {
  const t = await getTranslations("Intro");

  return (
    <div className="mb-20 flex h-[calc(100vh-55px)] max-w-[930px] flex-col justify-around pb-4 [@media(min-width:660px)]:h-[calc(100vh-75px)]">
      <header className="space-y-2">
        <Title>{t("title")}</Title>
        <Subtitle>{t("subtitle")}</Subtitle>
      </header>
      <AnimatedIcons />
      <BaseText>{t("introduction")}</BaseText>
    </div>
  );
}

export default Intro;
