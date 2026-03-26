"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useStudents } from "@/hooks/use-students";
import { useBuildings } from "@/hooks/use-buildings";
import { useTags } from "@/hooks/use-tags";
import { StudentEditDialog } from "./student-edit-dialog";
import type { StudentWithRelations } from "@/types/students";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

export function StudentsPageContent() {
  const t = useTranslations("admin.studentsPage");
  const tCommon = useTranslations("common");

  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");
  const [editingStudent, setEditingStudent] = useState<StudentWithRelations | null>(null);

  const { data: students, isLoading } = useStudents({
    search: search || undefined,
    building: buildingFilter,
    tag: tagFilter,
  });
  const { data: buildings } = useBuildings();
  const { data: tags } = useTags();

  return (
    <div className="space-y-6">
      <AdminBreadcrumb />
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
        <span className="text-sm text-muted-foreground">
          {students ? t("totalCount", { count: students.length }) : ""}
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder={tCommon("search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-xs rounded-lg border bg-background px-3 py-2 text-sm"
        />
        <select
          value={buildingFilter}
          onChange={(e) => setBuildingFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="all">{t("allBuildings")}</option>
          {buildings?.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name_th}
            </option>
          ))}
        </select>
        <select
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="all">{t("allTags")}</option>
          {tags?.map((tag) => (
            <option key={tag.id} value={tag.name}>
              {tag.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">{t("name")}</th>
              <th className="px-4 py-3 text-left font-medium">{t("studentId")}</th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                {t("building")}
              </th>
              <th className="hidden px-4 py-3 text-left font-medium md:table-cell">
                {t("room")}
              </th>
              <th className="hidden px-4 py-3 text-left font-medium lg:table-cell">
                {t("tags")}
              </th>
              <th className="px-4 py-3 text-left font-medium">{t("status")}</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-4 py-3">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  </td>
                </tr>
              ))
            ) : students && students.length > 0 ? (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {student.avatar_url ? (
                        <img
                          src={student.avatar_url}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {student.full_name_th.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">{student.full_name_th}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {student.student_id ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {student.building?.name_th ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {student.room?.room_number ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {student.tags?.map((tag) => {
                        const tagDef = tags?.find((t) => t.name === tag);
                        return (
                          <span
                            key={tag}
                            className="rounded-full px-2 py-0.5 text-xs text-white"
                            style={{
                              backgroundColor: tagDef?.color ?? "#6B7280",
                            }}
                          >
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        student.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {student.status === "active"
                        ? t("statusActive")
                        : t("statusInactive")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditingStudent(student)}
                      className="text-sm text-primary hover:underline"
                    >
                      {tCommon("edit")}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-muted-foreground"
                >
                  {tCommon("noData")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Dialog */}
      {editingStudent && (
        <StudentEditDialog
          student={editingStudent}
          open={!!editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}
    </div>
  );
}
