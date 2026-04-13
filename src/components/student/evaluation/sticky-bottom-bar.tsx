interface StickyBottomBarProps {
  onNext: () => void;
  onSkip?: () => void;
  nextLabel: string;
  skipLabel?: string;
  disabled?: boolean;
  loading?: boolean;
}

export function StickyBottomBar({
  onNext,
  onSkip,
  nextLabel,
  skipLabel,
  disabled,
  loading,
}: StickyBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-[0px_-4px_4px_0px_rgba(0,0,0,0.25)]">
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-4 py-6">
        <button
          type="button"
          onClick={onNext}
          disabled={disabled || loading}
          className="flex h-[53px] w-full max-w-[214px] items-center justify-center rounded-full bg-primary px-8 py-3 font-sans text-[16px] font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "กำลังบันทึก..." : nextLabel}
        </button>
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
