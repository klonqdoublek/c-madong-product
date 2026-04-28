"use client"

import { cn } from "@/lib/utils"

interface AnnouncementStepperProps {
  currentStep: 1 | 2
}

const STEPS = [
  { n: 1, label: "สร้างประกาศใหม่" },
  { n: 2, label: "ยืนยันข้อมูล" },
]

export function AnnouncementStepper({ currentStep }: AnnouncementStepperProps) {
  return (
    <div className="flex items-start justify-center gap-0">
      {STEPS.map((step, i) => {
        const active = currentStep >= step.n
        const isLast = i === STEPS.length - 1

        return (
          <div key={step.n} className="flex items-start">
            {/* Step node */}
            <div className="flex flex-col items-center gap-2">
              {/* Circle */}
              <div
                className={cn(
                  "flex h-[52px] w-[52px] items-center justify-center rounded-full font-heading text-2xl font-bold text-white transition-all duration-300",
                  active
                    ? "bg-primary shadow-[0_4px_14px_rgba(221,89,139,0.35)]"
                    : "bg-muted-foreground/25 text-muted-foreground"
                )}
              >
                {step.n}
              </div>
              {/* Label */}
              <span
                className={cn(
                  "w-[100px] text-center text-xs font-medium leading-tight transition-colors duration-300",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last step) */}
            {!isLast && (
              <div className="mt-[26px] h-[2px] w-[64px] overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full w-full rounded-full transition-all duration-500",
                    currentStep === 2
                      ? "bg-primary"
                      : "bg-muted-foreground/20"
                  )}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
