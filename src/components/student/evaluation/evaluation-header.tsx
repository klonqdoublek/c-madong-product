import { Calendar } from "lucide-react";

interface EvaluationHeaderProps {
  icon?: React.ReactNode;
  title: string;
  dateRange?: string;
  description?: string;
  showImportantBadge?: boolean;
}

export function EvaluationHeader({
  icon,
  title,
  dateRange,
  description,
  showImportantBadge,
}: EvaluationHeaderProps) {
  return (
    <div className="rounded-bl-[20px] rounded-br-[20px] bg-[#fbf6e9] px-4 pb-6 pt-4">
      {/* Icon + Badge */}
      <div className="flex items-start justify-between">
        {icon && (
          <div className="flex size-[50px] items-center justify-center rounded-full bg-white">
            {icon}
          </div>
        )}
        {showImportantBadge && (
          <div className="flex h-[22px] items-center justify-center rounded-full bg-[#565655] px-3">
            <p className="text-[14px] font-normal leading-[18px] text-[#fffdf3]">
              สำคัญ
            </p>
          </div>
        )}
      </div>

      {/* Title */}
      <h1 className="mt-4 font-heading text-[24px] font-bold leading-[21px] text-[#565655]">
        {title}
      </h1>

      {/* Date Range */}
      {dateRange && (
        <div className="mt-2 flex items-center gap-1.5 text-[#565655]">
          <Calendar className="h-4 w-4" />
          <p className="text-[14px] leading-[21px]">{dateRange}</p>
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="mt-2 text-[14px] leading-[21px] text-[#565655]">
          {description}
        </p>
      )}
    </div>
  );
}
