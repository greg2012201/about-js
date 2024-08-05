"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Languages } from "lucide-react";
import { useParams } from "next/navigation";
import { useRouter, usePathname } from "@/navigation";
import { useLocale } from "next-intl";

const config = [
  { label: "Polski", value: "pl" },
  { label: "English", value: "en" },
] as const;

function LanguagePicker() {
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Select
      defaultValue={locale}
      onValueChange={(lang) => {
        router.replace(
          // @ts-expect-error -- TypeScript will validate that only known `params`
          // are used in combination with a given `pathname`. Since the two will
          // always match for the current route, we can skip runtime checks.
          { pathname, params },
          { locale: lang },
        );
      }}
    >
      <SelectTrigger
        disableChevron
        icon={<Languages className="h-4 w-4" />}
        className="h-[30px] w-[90px] border-slate-900 bg-[#0b101a] text-[13px] font-semibold sm:h-[36px] sm:w-[94px] sm:text-sm"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[#0b101a] font-semibold">
        {config.map(({ label, value }) => (
          <SelectItem className="flex" key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default LanguagePicker;
