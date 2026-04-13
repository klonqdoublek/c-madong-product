"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { StepIndicator } from "./step-indicator";
import { EvaluationHeader } from "./evaluation-header";
import { PersonalInfoCard } from "./personal-info-card";
import { StickyBottomBar } from "./sticky-bottom-bar";
import { useCompleteEvaluation } from "@/hooks/use-evaluation";

interface DormReapplicationContentProps {
  formId: string;
  title: string;
  description?: string;
  dateRange?: string;
  conditions: string[];
}

export function DormReapplicationContent({
  formId,
  title,
  description,
  dateRange,
  conditions,
}: DormReapplicationContentProps) {
  const t = useTranslations("evaluation");
  const completeEvaluation = useCompleteEvaluation();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Submit
      await completeEvaluation.mutateAsync(formId);
      alert(t("completedNotice"));
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf3] pb-32">
      {/* Header */}
      <EvaluationHeader
        icon={<FileText className="h-8 w-8 text-primary" />}
        title={title}
        dateRange={dateRange}
        description={description}
        showImportantBadge
      />

      {/* Step Indicator */}
      <div className="py-6">
        <StepIndicator totalSteps={2} currentStep={currentStep} />
      </div>

      {/* Content */}
      <div className="space-y-4 px-4">
        {currentStep === 0 ? (
          <>
            {/* Conditions */}
            <div>
              <p className="mb-2 text-[14px] text-[#565655]">{t("conditions")}</p>
              <ul className="list-disc space-y-1 pl-6">
                {conditions.map((condition, i) => (
                  <li key={i} className="text-[14px] text-[#565655]">
                    {condition}
                  </li>
                ))}
              </ul>
            </div>

            {/* Personal Info */}
            <PersonalInfoCard />
          </>
        ) : (
          <div className="rounded-lg border bg-white p-6 text-center">
            <p className="text-lg font-medium">{t("confirmInfo")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              กรุณาตรวจสอบข้อมูลของคุณให้ถูกต้องก่อนยืนยัน
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar
        onNext={handleNext}
        nextLabel={currentStep === 0 ? t("nextStep") : t("submit")}
        loading={completeEvaluation.isPending}
      />
    </div>
  );
}
