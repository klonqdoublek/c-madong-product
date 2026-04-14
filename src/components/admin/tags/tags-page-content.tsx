"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from "@/hooks/use-tags";
import { TAG_COLORS, type Tag } from "@/types/tags";
import { tagSchema, type TagFormData } from "@/lib/validators/tags";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

export function TagsPageContent() {
  const t = useTranslations("admin.tags");
  const tCommon = useTranslations("common");
  const { data: tags, isLoading } = useTags();
  const createTag = useCreateTag();
  const updateTag = useUpdateTag();
  const deleteTag = useDeleteTag();

  const [search, setSearch] = useState("");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState<string>(TAG_COLORS[0].value);
  const [formError, setFormError] = useState("");

  const filtered = (tags ?? []).filter(
    (tag) =>
      tag.name.toLowerCase().includes(search.toLowerCase()) ||
      (tag.description ?? "").toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditingTag(null);
    setFormName("");
    setFormDescription("");
    setFormColor(TAG_COLORS[0].value);
    setFormError("");
    setShowDialog(true);
  }

  function openEdit(tag: Tag) {
    setEditingTag(tag);
    setFormName(tag.name);
    setFormDescription(tag.description ?? "");
    setFormColor(tag.color ?? "#6B7280");
    setFormError("");
    setShowDialog(true);
  }

  async function handleSave() {
    const result = tagSchema.safeParse({
      name: formName,
      description: formDescription || undefined,
      color: formColor,
    });
    if (!result.success) {
      setFormError(t("nameRequired"));
      return;
    }
    const data: TagFormData = result.data;

    if (editingTag) {
      await updateTag.mutateAsync({ id: editingTag.id, ...data });
    } else {
      await createTag.mutateAsync(data);
    }
    setShowDialog(false);
  }

  async function handleDelete(id: string) {
    await deleteTag.mutateAsync(id);
    setDeleteConfirmId(null);
  }

  return (
    <div className="space-y-6">
      <AdminBreadcrumb />
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {t("add")}
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder={tCommon("search")}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm rounded-lg border bg-background px-3 py-2 text-sm"
      />

      {/* Tag Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-lg border bg-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">{t("noTags")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tag) => (
            <div
              key={tag.id}
              className="flex items-start gap-3 rounded-lg border bg-card p-4"
            >
              <div
                className="mt-0.5 h-4 w-4 shrink-0 rounded-full"
                style={{ backgroundColor: tag.color ?? undefined }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{tag.name}</p>
                {tag.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {tag.description}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(tag)}
                  className="rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                </button>
                <button
                  onClick={() => setDeleteConfirmId(tag.id)}
                  className="rounded p-1 text-muted-foreground hover:text-destructive"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-background p-6 shadow-lg">
            <h2 className="font-heading text-lg font-bold">
              {editingTag ? t("edit") : t("add")}
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">{t("name")}</label>
                <input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder={t("namePlaceholder")}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t("description")}
                </label>
                <input
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                  placeholder={t("descriptionPlaceholder")}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">{t("color")}</label>
                <div className="flex flex-wrap gap-2">
                  {TAG_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setFormColor(c.value)}
                      className={`h-8 w-8 rounded-full border-2 ${
                        formColor === c.value
                          ? "border-foreground"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowDialog(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={createTag.isPending || updateTag.isPending}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {tCommon("save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-background p-6 shadow-lg">
            <h2 className="font-heading text-lg font-bold">{t("deleteConfirm")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("deleteWarning")}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleteTag.isPending}
                className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
              >
                {tCommon("delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
