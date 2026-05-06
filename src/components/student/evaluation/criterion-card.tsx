import { useTranslations } from "next-intl";
import { Undo2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { RatingScale } from "./rating-scale";
import type { CriteriaType } from "@/lib/supabase/types";

interface CriterionCardProps {
  orderNumber: number;
  title: string;
  description?: string | null;
  type: CriteriaType;
  isSkippable: boolean;
  isSkipped: boolean;
  value: number | string | null;
  onChange: (value: number | string | null) => void;
  onSkip: () => void;
  onUndoSkip: () => void;
  backgroundColor?: string;
}

const BG_COLORS = ["#fffdf3", "#fefaee", "#fbf6e9"];

export function CriterionCard({
  orderNumber,
  title,
  description,
  type,
  isSkippable,
  isSkipped,
  value,
  onChange,
  onSkip,
  onUndoSkip,
  backgroundColor,
}: CriterionCardProps) {
  const t = useTranslations("evaluation");

  const bgColor = backgroundColor ?? BG_COLORS[(orderNumber - 1) % 3];

  return (
    <div
      className="flex flex-col gap-3 rounded-[9px] border border-[#fbf6e9] px-4 py-3"
      style={{ backgroundColor: bgColor }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <ol className="list-none font-heading text-[16px] font-bold text-cu-grey" start={orderNumber}>
            <li className="flex gap-2">
              <span>{orderNumber}.</span>
              <span>{title}</span>
            </li>
          </ol>
          {description && (
            <p className="mt-1 text-[12px] leading-[21px] text-cu-grey">
              {description}
            </p>
          )}
        </div>
        {isSkippable && !isSkipped && (
          <button
            type="button"
            onClick={onSkip}
            className="whitespace-nowrap text-[12px] font-bold text-cu-grey underline"
          >
            {t("skipCriterion")}
          </button>
        )}
      </div>

      {/* Content */}
      {isSkipped ? (
        <div className="flex items-center justify-between rounded-lg bg-[rgba(88,88,86,0.08)] px-4 py-3">
          <p className="text-[13px] text-[#8a8a88]">{t("skippedCriterion")}</p>
          <button
            type="button"
            onClick={onUndoSkip}
            className="flex items-center gap-1 text-[12px] font-bold text-primary"
          >
            <Undo2 className="h-3.5 w-3.5" />
            {t("undoSkip")}
          </button>
        </div>
      ) : (
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
              className="min-h-[122px] resize-none rounded-[11px] border border-cu-grey/25"
            />
          )}
        </div>
      )}
    </div>
  );
}
