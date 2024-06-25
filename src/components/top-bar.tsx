import Logo from "./logo";
import NavList from "./nav-list";

const NAV_CONFIG = [
  { label: "home", path: "/" },
  { label: "about", path: "/about" },
  { label: "posts", path: "/posts" },
];

function TopBar() {
  return (
    <>
      <div className="flex min-h-[40px] w-full flex-wrap items-center justify-center bg-[rgba(0,0,0,0.47)] p-2 shadow-md sm:min-h-[60px] [@media(min-width:243px)]:justify-between">
        <Logo />

        <NavList navConfig={NAV_CONFIG} />
      </div>
    </>
  );
}

export default TopBar;
