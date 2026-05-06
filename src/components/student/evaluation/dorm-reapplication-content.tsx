"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { FileText } from "lucide-react";
import { StepIndicator } from "./step-indicator";
import { EvaluationHeader } from "./evaluation-header";
import { PersonalInfoCard } from "./personal-info-card";
import { StickyBottomBar } from "./sticky-bottom-bar";

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
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const busyRef = useRef(false);

  const handleNext = async () => {
    if (busyRef.current) return;

    if (currentStep === 0) {
      setCurrentStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      busyRef.current = true;
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/student/evaluation/${formId}/submit`, {
          method: "POST",
        });
        if (!res.ok) throw new Error("Submit failed");
        toast.success(t("completedNotice"), { duration: 3000 });
        router.push("/events");
      } catch {
        toast.error("เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
      } finally {
        busyRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#fffdf3] pb-52">
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
              <p className="mb-2 font-heading text-[16px] font-bold text-cu-grey">
                {t("conditions")}
              </p>
              <ul className="list-disc space-y-2 pl-6">
                {conditions.map((condition, i) => (
                  <li key={i} className="text-[14px] leading-relaxed text-cu-grey">
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
            <p className="font-heading text-[18px] font-bold text-cu-grey">
              {t("confirmInfo")}
            </p>
            <p className="mt-2 text-[14px] text-muted-foreground">
              กรุณาตรวจสอบข้อมูลของคุณให้ถูกต้องก่อนยืนยัน
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <StickyBottomBar
        onNext={handleNext}
        onBack={currentStep > 0 ? handleBack : undefined}
        nextLabel={currentStep === 0 ? t("nextStep") : t("submit")}
        loading={isSubmitting}
      />
    </div>
  );
}
