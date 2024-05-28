import { fromHtml } from "hast-util-from-html";
import dedent from "dedent";
import { BundledLanguage } from "shiki";

type HeaderProps = {
  lang: BundledLanguage;
  textToCopy: string;
};

export const headerTemplate = ({ lang, textToCopy }: HeaderProps) => {
  return ` 
<div className="flex items-center border-b-[1px] border-slate-500 px-6 py-4 text-neutral-400">
    <div className="flex flex-grow items-center space-x-1">    
        {renderIcon}
        <p className="text-sm font-semibold capitalize ">
            {transformLanguge}
        </p>
    </div>
</div>

`;
};

export const wrapperTemplate = ({
  children,
  renderHeader,
}: {
  children: string;
  renderHeader: string;
}) => {
  return dedent`
<div className="flex flex-col rounded-md border-[1px] border-slate-500 bg-[#0f111a]">
    <div>${children}</div>
</div>`;
};
