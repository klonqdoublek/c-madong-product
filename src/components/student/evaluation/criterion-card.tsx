import { useState } from "react";
import { useTranslations } from "next-intl";
import { Textarea } from "@/components/ui/textarea";
import { RatingScale } from "./rating-scale";
import type { CriteriaType } from "@/lib/supabase/types";

interface CriterionCardProps {
  orderNumber: number;
  title: string;
  description?: string | null;
  type: CriteriaType;
  isSkippable: boolean;
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  onSkip?: () => void;
  backgroundColor?: string;
}

const BG_COLORS = ["#fffdf3", "#fefaee", "#fbf6e9"];

export function CriterionCard({
  orderNumber,
  title,
  description,
  type,
  isSkippable,
  value,
  onChange,
  onSkip,
  backgroundColor,
}: CriterionCardProps) {
  const t = useTranslations("evaluation");
  const [isSkipped, setIsSkipped] = useState(false);

  const handleSkip = () => {
    setIsSkipped(true);
    onChange(null);
    onSkip?.();
  };

  const bgColor = backgroundColor ?? BG_COLORS[(orderNumber - 1) % 3];

  return (
    <div
      className="flex flex-col gap-3 rounded-[9px] border border-[#fbf6e9] px-4 py-3"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <ol className="list-none font-heading text-[16px] font-bold text-[#565655]" start={orderNumber}>
            <li className="flex gap-2">
              <span>{orderNumber}.</span>
              <span>{title}</span>
            </li>
          </ol>
          {description && (
            <p className="mt-1 text-[12px] leading-[21px] text-[#565655]">
              {description}
            </p>
          )}
        </div>
        {isSkippable && !isSkipped && (
          <button
            type="button"
            onClick={handleSkip}
            className="whitespace-nowrap text-[12px] font-bold text-[#565655] underline"
          >
            {t("skipCriterion")}
          </button>
        )}
      </div>

      {/* Content */}
      {!isSkipped && (
        <div>
          {type === "rating" ? (
            <RatingScale
              value={typeof value === "number" ? value : null}
              onChange={(rating) => onChange(rating)}
            />
          ) : (
            <Textarea
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={t("suggestion")}
              className="min-h-[122px] resize-none rounded-[11px] border border-[rgba(88,88,86,0.24)]"
            />
          )}
        </div>
      )}
    </div>
  );
}
