import Link from "next/link";
import { Children, ReactElement, cloneElement, isValidElement } from "react";
import { ClassNameValue, twMerge } from "tailwind-merge";

function Slot({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
}) {
  if (isValidElement(children)) {
    return cloneElement(children, {
      ...props,
      ...children.props,
      className: twMerge(props.className, children.props.className),
    });
  }
  if (Children.count(children) > 1) {
    Children.only(null);
  }
  return null;
}

function DefaultTitle({
  children,
  className,
}: {
  children: ReactElement;
  className?: string;
}) {
  return <h5 className={className}>{children}</h5>;
}

function MaybeWithLink({
  children,
  slug,
}: {
  children: ReactElement;
  slug?: string;
}) {
  return slug ? <Link href={`posts/${slug}`}>{children}</Link> : children;
}
type TitleProps = {
  asChild?: boolean;
  className?: ClassNameValue;
  slug?: string;
  size?: "default" | "large";
  children: ReactElement;
};

function Title({ asChild, children, slug, size = "default" }: TitleProps) {
  const TitleComponent = asChild ? Slot : DefaultTitle;
  const hoverClass = slug
    ? "hover:cursor-pointer hover:opacity-80"
    : "hover:cursor-auto";

  const fontSizeClass =
    size === "default" ? "text-3xl" : "text-4xl md:text-5xl";
  const underlineClass =
    size === "default"
      ? "mt-1 h-[7px] max-w-[80px]"
      : "mt-2 h-[10px] max-w-[100px] md:h-[12px] md:max-w-[120px]";

  return (
    <header className="flex flex-col">
      <MaybeWithLink slug={slug}>
        <TitleComponent
          className={twMerge(
            `font-bold text-slate-300 transition-opacity`,
            hoverClass,
            fontSizeClass,
          )}
        >
          {children}
        </TitleComponent>
      </MaybeWithLink>
      <span className={twMerge(`-skew-x-12 bg-purple-500`, underlineClass)} />
    </header>
  );
}

export default Title;
