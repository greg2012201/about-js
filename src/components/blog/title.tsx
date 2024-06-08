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

type TitleProps = {
  asChild?: boolean;
  className?: ClassNameValue;
  slug?: string;
  children: ReactElement;
};

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

function Title({ asChild, children, slug }: TitleProps) {
  const TitleComponent = asChild ? Slot : DefaultTitle;
  const hoverClass = slug
    ? "hover:cursor-pointer hover:opacity-8"
    : "hover:cursor-auto";
  return (
    <header className="flex flex-col">
      <MaybeWithLink slug={slug}>
        <TitleComponent
          className={twMerge(
            `text-3xl font-bold text-slate-300 transition-opacity`,
            hoverClass,
          )}
        >
          {children}
        </TitleComponent>
      </MaybeWithLink>
      <span className="mt-1 h-[7px] max-w-[80px] -skew-x-12 bg-purple-500" />
    </header>
  );
}

export default Title;
