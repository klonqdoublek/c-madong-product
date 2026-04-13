import { ChevronLeft } from "lucide-react";

interface StickyBottomBarProps {
  onNext: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  nextLabel: string;
  backLabel?: string;
  skipLabel?: string;
  loading?: boolean;
}

export function StickyBottomBar({
  onNext,
  onBack,
  onSkip,
  nextLabel,
  backLabel,
  skipLabel,
  loading,
}: StickyBottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-[72px] z-50 bg-white shadow-[0px_-4px_4px_0px_rgba(0,0,0,0.25)]">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-5">
        <div className="flex w-full items-center justify-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex h-[53px] items-center justify-center rounded-full border-2 border-primary px-4 text-primary transition-colors hover:bg-primary/5"
            >
              <ChevronLeft className="h-5 w-5" />
              {backLabel && (
                <span className="ml-1 font-sans text-[14px] font-bold">
                  {backLabel}
                </span>
              )}
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="flex h-[53px] flex-1 max-w-[214px] items-center justify-center rounded-full bg-primary px-8 py-3 font-sans text-[16px] font-bold text-white transition-colors hover:bg-primary/90"
          >
            {loading ? "กำลังบันทึก..." : nextLabel}
          </button>
        </div>
        {skipLabel && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="font-sans text-[14px] font-bold text-black"
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
}
