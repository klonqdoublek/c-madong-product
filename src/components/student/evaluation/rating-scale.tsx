import { useTranslations } from "next-intl";

interface RatingScaleProps {
  value: number | null;
  onChange: (rating: number) => void;
  disabled?: boolean;
}

export function RatingScale({ value, onChange, disabled }: RatingScaleProps) {
  const t = useTranslations("evaluation");
  const ratings = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => !disabled && onChange(1)}
          disabled={disabled}
          className={`flex size-[40px] items-center justify-center rounded-full border font-heading text-[16px] font-bold transition-colors ${
            value === 1
              ? "border-primary bg-primary text-white"
              : "border-[rgba(88,88,86,0.24)] text-[rgba(88,88,86,0.24)]"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          1
        </button>
        <p className="text-center text-[12px] text-[#565655]">{t("worst")}</p>
      </div>

      {ratings.slice(1, 4).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => !disabled && onChange(rating)}
          disabled={disabled}
          className={`flex size-[40px] items-center justify-center rounded-full border font-heading text-[16px] font-bold transition-colors ${
            value === rating
              ? "border-primary bg-primary text-white"
              : "border-[rgba(88,88,86,0.24)] text-[rgba(88,88,86,0.24)]"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {rating}
        </button>
      ))}

      <div className="flex flex-col items-center gap-1.5">
        <button
          type="button"
          onClick={() => !disabled && onChange(5)}
          disabled={disabled}
          className={`flex size-[40px] items-center justify-center rounded-full border font-heading text-[16px] font-bold transition-colors ${
            value === 5
              ? "border-primary bg-primary text-white"
              : "border-[rgba(88,88,86,0.24)] text-[#d4d0c6]"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          5
        </button>
        <p className="text-center text-[12px] text-[#565655]">{t("best")}</p>
      </div>
    </div>
  );
}
