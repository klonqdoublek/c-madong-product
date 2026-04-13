"use client";

import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/layout/page-header";
import { useEvaluationForm, useMySubmission } from "@/hooks/use-evaluation";
import { ShopEvaluationContent } from "./shop-evaluation-content";
import { DormReapplicationContent } from "./dorm-reapplication-content";
import { DocumentUploadContent } from "./document-upload-content";

interface EvaluationPageContentProps {
  eventId: string;
}

export function EvaluationPageContent({ eventId }: EvaluationPageContentProps) {
  const t = useTranslations("evaluation");
  const { data: form, isLoading } = useEvaluationForm(eventId);
  const { data: submission } = useMySubmission(form?.id ?? null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">ไม่พบแบบประเมิน</p>
      </div>
    );
  }

  // Show completion notice if already submitted
  if (submission?.status === "completed") {
    return (
      <>
        <PageHeader title={form.title_th} backHref={`/events/${eventId}`} />
        <div className="p-4">
          <div className="rounded-lg border bg-white p-6 text-center">
            <p className="text-lg font-medium">{t("completedNotice")}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              ส่งเมื่อ {new Date(submission.submitted_at!).toLocaleDateString("th-TH")}
            </p>
          </div>
        </div>
      </>
    );
  }

  // Render appropriate content based on form_type
  switch (form.form_type) {
    case "shop_evaluation":
      return (
        <>
          <PageHeader title={form.title_th} backHref={`/events/${eventId}`} />
          <ShopEvaluationContent
            formId={form.id}
            totalSteps={form.total_steps}
            shops={form.config.items ?? []}
          />
        </>
      );

    case "dorm_reapplication":
      return (
        <>
          <PageHeader title={form.title_th} backHref={`/events/${eventId}`} />
          <DormReapplicationContent
            formId={form.id}
            title={form.title_th}
            description={form.description_th ?? undefined}
            dateRange="19 ก.พ. - 28 ก.พ. 23.59" // TODO: Format from event dates
            conditions={form.config.conditions_th ?? []}
          />
        </>
      );

    case "document_upload":
      return (
        <>
          <PageHeader title={form.title_th} backHref={`/events/${eventId}`} />
          <DocumentUploadContent
            formId={form.id}
            title={form.title_th}
            description={form.description_th ?? undefined}
            dateRange="1 ส.ค. - 31 ส.ค. 23.59" // TODO: Format from event dates
            config={form.config}
          />
        </>
      );

    default:
      return (
        <div className="p-4 text-center">
          <p className="text-muted-foreground">ประเภทแบบประเมินไม่ถูกต้อง</p>
        </div>
      );
  }
}
