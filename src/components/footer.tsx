import Link from "next/link";
import Logo from "./logo";
import { FaGithub } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";

const ICONS = [
  {
    id: "github",
    icon: <FaGithub className="text-slate-100" size={30} />,
    url: "https://github.com/greg2012201",
  },
  {
    id: "linkedin",
    icon: <FaLinkedinIn size={30} />,
    url: "https://www.linkedin.com/in/grzegorz-dubiel-software-developer/",
  },
];

function SocialIcons() {
  return (
    <div className="flex space-x-4 py-2">
      {ICONS.map(({ icon, id, url }) => {
        return (
          <Link key={id} href={url} target="_blank" rel="noopener noreferrer">
            {icon}
          </Link>
        );
      })}
    </div>
  );
}

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
      </div>
    </div>
  );
}

export default Footer;
