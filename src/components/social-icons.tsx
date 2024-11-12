import { Link } from "@/navigation";
import { FaGithub } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";

const ICONS = [
  {
    id: "github",
    icon: <FaGithub className="text-slate-100" size={30} />,
    url: "https://github.com/greg2012201",
    label: "Go to the GitHub Profile",
  },
  {
    id: "linkedin",
    icon: <FaLinkedinIn size={30} />,
    url: "https://www.linkedin.com/in/grzegorz-dubiel-software-developer/",
    label: "Go to the linkedin profile",
  },
];

function SocialIcons() {
  return (
    <div className="flex space-x-4 py-2">
      {ICONS.map(({ icon, id, url, label }) => {
        return (
          <Link
            key={id}
            href={url}
            aria-label={label}
            target="_blank"
            rel="noopener noreferrer"
          >
            {icon}
          </Link>
        );
      })}
    </div>
  );
}

export default SocialIcons;
