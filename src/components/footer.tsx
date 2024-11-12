import Logo from "./logo";
import LanguagePicker from "./language-picker";
import SocialIcons from "./social-icons";

function Footer() {
  const date = new Date();

  return (
    <div className="flex min-h-[50px] w-full items-center justify-center bg-[rgba(0,0,0,0.60)]  p-4 text-white shadow-md">
      <div className="flex flex-col items-center space-y-1">
        <Logo />
        <a
          href="mailto:greg2012201@gmail.com"
          className=" text-sm text-slate-100 hover:underline"
        >
          greg2012201@gmail.com
        </a>
        <SocialIcons />
        <p className="text-sm italic">
          ©Grzegorz Dubiel | {date.getFullYear()}
        </p>
        <LanguagePicker />
      </div>
    </div>
  );
}

export default Footer;
