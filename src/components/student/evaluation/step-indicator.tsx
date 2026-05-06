import { Check } from "lucide-react";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
  completedSteps?: number[];
}

export function StepIndicator({
  totalSteps,
  currentStep,
  completedSteps = [],
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => i).map((step) => {
        const isActive = step === currentStep;
        const isCompleted = completedSteps.includes(step);
        const stepNumber = step + 1;

        return (
          <div key={step} className="flex flex-col items-center gap-1">
            <div
              className={`flex size-[30px] items-center justify-center rounded-full font-heading text-[20px] font-bold leading-none transition-colors ${
                isActive || isCompleted
                  ? "bg-primary text-white"
                  : "border border-[#d1d5db] bg-white text-cu-grey"
              }`}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                stepNumber
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
