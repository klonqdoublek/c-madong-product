"use client";

import { useTranslations } from "next-intl";
import { useTemplates } from "@/hooks/use-templates";
import type { MessageTemplate } from "@/types/announcements";

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (template: MessageTemplate) => void;
}

export function TemplateSelector({ open, onClose, onSelect }: Props) {
  const t = useTranslations("admin.flexEditor");
  const { data: templates, isLoading } = useTemplates();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-lg bg-background p-6 shadow-lg">
        <h2 className="font-heading text-lg font-bold">{t("selectTemplate")}</h2>

        <div className="mt-4 space-y-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg border bg-muted" />
            ))
          ) : templates && templates.length > 0 ? (
            templates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => {
                  onSelect(tmpl);
                  onClose();
                }}
                className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-muted/50"
              >
                <p className="font-medium">{tmpl.name}</p>
                {tmpl.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {tmpl.description}
                  </p>
                )}
              </button>
            ))
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {t("noTemplates")}
            </p>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
