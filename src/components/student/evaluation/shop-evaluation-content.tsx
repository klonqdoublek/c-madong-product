"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { Store } from "lucide-react";
import { StepIndicator } from "./step-indicator";
import { CriterionCard } from "./criterion-card";
import { StickyBottomBar } from "./sticky-bottom-bar";
import { useEvaluationCriteria, useMyResponses } from "@/hooks/use-evaluation";

interface ShopEvaluationContentProps {
  formId: string;
  totalSteps: number;
  shops: Array<{ name_th: string; name_en?: string; icon?: string }>;
}

export function ShopEvaluationContent({
  formId,
  totalSteps,
  shops,
}: ShopEvaluationContentProps) {
  const t = useTranslations("evaluation");
  const router = useRouter();
  const { data: criteria = [] } = useEvaluationCriteria(formId);
  const { data: responses = [] } = useMyResponses(formId);

  const [currentStep, setCurrentStep] = useState(0);
  const [criteriaValues, setCriteriaValues] = useState<
    Record<string, number | string | null>
  >({});
  const [skippedCriteria, setSkippedCriteria] = useState<Set<string>>(
    new Set()
  );
  const [loadingLabel, setLoadingLabel] = useState(false);

  // Use ref for busy guard — NOT state — so React batching can never leave buttons stuck
  const busyRef = useRef(false);

  // Restore saved responses when switching steps
  const lastRestoredStep = useRef(-1);
  if (lastRestoredStep.current !== currentStep) {
    const stepResponses = responses.filter(
      (r: any) => r.step_index === currentStep
    );
    const values: Record<string, number | string | null> = {};
    const skipped = new Set<string>();
    stepResponses.forEach((r: any) => {
      if (r.criterion_id) {
        if (r.skipped) {
          skipped.add(r.criterion_id);
          values[r.criterion_id] = null;
        } else {
          values[r.criterion_id] = r.rating ?? r.text_response ?? null;
        }
      }
    });
    setCriteriaValues(values);
    setSkippedCriteria(skipped);
    lastRestoredStep.current = currentStep;
  }

  const currentShop = shops[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  const buildStepResponses = () =>
    criteria.map((criterion) => ({
      criterion_id: criterion.id,
      rating:
        criterion.criteria_type === "rating"
          ? (criteriaValues[criterion.id] as number) ?? null
          : null,
      text_response:
        criterion.criteria_type === "text"
          ? (criteriaValues[criterion.id] as string) ?? null
          : null,
      skipped:
        skippedCriteria.has(criterion.id) ||
        criteriaValues[criterion.id] == null,
    }));

  const saveStep = async (stepIndex: number, stepResponses: any[]) => {
    const res = await fetch(`/api/student/evaluation/${formId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stepIndex, responses: stepResponses }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Save failed: ${text}`);
    }
  };

  const handleNext = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoadingLabel(true);

    try {
      const stepIndex = currentStep;
      const stepResponses = buildStepResponses();

      await saveStep(stepIndex, stepResponses);

      if (stepIndex === totalSteps - 1) {
        // Submit
        const submitRes = await fetch(
          `/api/student/evaluation/${formId}/submit`,
          { method: "POST" }
        );
        if (!submitRes.ok) {
          const text = await submitRes.text();
          throw new Error(`Submit failed: ${text}`);
        }
        toast.success(t("completedNotice"), { duration: 3000 });
        router.push("/events");
      } else {
        // Go to next step
        lastRestoredStep.current = -1;
        setCurrentStep(stepIndex + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      console.error("Evaluation error:", err);
      toast.error("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      busyRef.current = false;
      setLoadingLabel(false);
    }
  };

  const handleBack = () => {
    if (currentStep <= 0) return;
    lastRestoredStep.current = -1;
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSkipStep = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setLoadingLabel(true);

    try {
      const skipResponses = criteria.map((criterion) => ({
        criterion_id: criterion.id,
        skipped: true,
      }));
      await saveStep(currentStep, skipResponses);

      if (!isLastStep) {
        lastRestoredStep.current = -1;
        setCurrentStep(currentStep + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch {
      toast.error("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      busyRef.current = false;
      setLoadingLabel(false);
    }
  };

  const handleSkipCriterion = (criterionId: string) => {
    setSkippedCriteria((prev) => new Set(prev).add(criterionId));
    setCriteriaValues((prev) => ({ ...prev, [criterionId]: null }));
  };

  const handleUndoSkipCriterion = (criterionId: string) => {
    setSkippedCriteria((prev) => {
      const next = new Set(prev);
      next.delete(criterionId);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#fffdf3] pb-52">
      {/* Step Indicator */}
      <div className="py-6">
        <StepIndicator totalSteps={totalSteps} currentStep={currentStep} />
      </div>

      {/* Shop Info */}
      <div className="px-4">
        <div className="flex items-center gap-3 pb-6">
          <div className="flex size-[52px] items-center justify-center rounded-lg bg-primary/10">
            <Store className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-heading text-[20px] font-bold text-cu-grey">
              {t("shopInfo", { number: currentStep + 1 })}
            </p>
            <p className="text-[14px] text-cu-grey">
              {currentShop?.name_th}
            </p>
          </div>
        </div>

        {/* Criteria Cards */}
        <div className="space-y-4">
          {criteria.map((criterion, index) => (
            <CriterionCard
              key={criterion.id}
              orderNumber={index + 1}
              title={criterion.title_th}
              description={criterion.description_th}
              type={criterion.criteria_type}
              isSkippable={criterion.is_skippable}
              isSkipped={skippedCriteria.has(criterion.id)}
              value={criteriaValues[criterion.id] ?? null}
              onChange={(value) =>
                setCriteriaValues((prev) => ({
                  ...prev,
                  [criterion.id]: value,
                }))
              }
              onSkip={() => handleSkipCriterion(criterion.id)}
              onUndoSkip={() => handleUndoSkipCriterion(criterion.id)}
            />
          ))}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar
        onNext={handleNext}
        onBack={currentStep > 0 ? handleBack : undefined}
        onSkip={!isLastStep ? handleSkipStep : undefined}
        nextLabel={isLastStep ? t("submitEvaluation") : t("nextStep")}
        skipLabel={!isLastStep ? t("skipStep") : undefined}
        loading={loadingLabel}
      />
    </div>
  );
}
