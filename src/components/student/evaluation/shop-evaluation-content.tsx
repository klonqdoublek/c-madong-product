"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Store } from "lucide-react";
import { StepIndicator } from "./step-indicator";
import { CriterionCard } from "./criterion-card";
import { StickyBottomBar } from "./sticky-bottom-bar";
import {
  useEvaluationCriteria,
  useMySubmission,
  useMyResponses,
  useSaveStepResponses,
  useCompleteEvaluation,
} from "@/hooks/use-evaluation";

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
  const { data: criteria = [] } = useEvaluationCriteria(formId);
  const { data: submission } = useMySubmission(formId);
  const { data: responses = [] } = useMyResponses(formId);
  const saveResponses = useSaveStepResponses();
  const completeEvaluation = useCompleteEvaluation();

  const [currentStep, setCurrentStep] = useState(0);
  const [criteriaValues, setCriteriaValues] = useState<
    Record<string, number | string | null>
  >({});

  // Load existing responses for current step
  useEffect(() => {
    const stepResponses = responses.filter((r) => r.step_index === currentStep);
    const values: Record<string, number | string | null> = {};
    stepResponses.forEach((r) => {
      if (r.criterion_id) {
        values[r.criterion_id] = r.rating ?? r.text_response ?? null;
      }
    });
    setCriteriaValues(values);
  }, [currentStep, responses]);

  // Restore step from submission
  useEffect(() => {
    if (submission && submission.current_step !== currentStep) {
      setCurrentStep(Math.min(submission.current_step, totalSteps - 1));
    }
  }, [submission, currentStep, totalSteps]);

  const currentShop = shops[currentStep];
  const isLastStep = currentStep === totalSteps - 1;

  const handleNext = async () => {
    // Save current step responses
    const stepResponses = criteria.map((criterion) => ({
      criterion_id: criterion.id,
      rating:
        criterion.criteria_type === "rating"
          ? (criteriaValues[criterion.id] as number) ?? null
          : null,
      text_response:
        criterion.criteria_type === "textarea"
          ? (criteriaValues[criterion.id] as string) ?? null
          : null,
      skipped: criteriaValues[criterion.id] === null,
    }));

    await saveResponses.mutateAsync({
      formId,
      stepIndex: currentStep,
      responses: stepResponses,
    });

    if (isLastStep) {
      // Complete evaluation
      await completeEvaluation.mutateAsync(formId);
      // Show completion message or redirect
      alert(t("completedNotice"));
    } else {
      // Go to next step
      setCurrentStep(currentStep + 1);
      setCriteriaValues({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSkipStep = async () => {
    // Save all as skipped
    const skipResponses = criteria.map((criterion) => ({
      criterion_id: criterion.id,
      skipped: true,
    }));

    await saveResponses.mutateAsync({
      formId,
      stepIndex: currentStep,
      responses: skipResponses,
    });

    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
      setCriteriaValues({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf3] pb-32">
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
            <p className="font-heading text-[20px] font-bold text-[#565655]">
              {t("shopInfo", { number: currentStep + 1 })}
            </p>
            <p className="text-[14px] text-[#565655]">{currentShop?.name_th}</p>
          </div>
        </div>

        {/* Criteria Cards */}
        <div className="space-y-4 overflow-y-auto">
          {criteria.map((criterion, index) => (
            <CriterionCard
              key={criterion.id}
              orderNumber={index + 1}
              title={criterion.title_th}
              description={criterion.description_th}
              type={criterion.criteria_type}
              isSkippable={criterion.is_skippable}
              value={criteriaValues[criterion.id] ?? null}
              onChange={(value) =>
                setCriteriaValues({ ...criteriaValues, [criterion.id]: value })
              }
            />
          ))}
        </div>
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar
        onNext={handleNext}
        onSkip={!isLastStep ? handleSkipStep : undefined}
        nextLabel={isLastStep ? t("submit") : t("nextStep")}
        skipLabel={!isLastStep ? t("skipStep") : undefined}
        loading={saveResponses.isPending || completeEvaluation.isPending}
      />
    </div>
  );
}
