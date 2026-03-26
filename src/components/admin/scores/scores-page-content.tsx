"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useStudentScores } from "@/hooks/use-score";
import { getScoreColor, getScoreProgressColor } from "@/lib/utils/score-constants";
import { AddScoreDialog } from "./add-score-dialog";
import { Trophy, AlertTriangle, TrendingUp, Hash, Plus, Search } from "lucide-react";
import { AdminBreadcrumb } from "@/components/layout/admin-breadcrumb";

export function AdminScoresPageContent() {
  const t = useTranslations("admin.scoresPage");
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState<string>("");
  const [showAddScore, setShowAddScore] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{
    studentId: string;
    name: string;
  } | null>(null);

  const { data: students, isLoading } = useStudentScores({
    buildingId: buildingFilter || undefined,
    search: search || undefined,
  });

  const allStudents = students ?? [];
  const scoresWithValues = allStudents.filter((s) => s.composite_score !== null);
  const avgScore =
    scoresWithValues.length > 0
      ? scoresWithValues.reduce(
          (sum, s) => sum + (s.composite_score ?? 0),
          0
        ) / scoresWithValues.length
      : 0;
  const belowThreshold = scoresWithValues.filter(
    (s) => (s.composite_score ?? 0) < 60
  ).length;
  const topScore = scoresWithValues.length > 0
    ? Math.max(...scoresWithValues.map((s) => s.composite_score ?? 0))
    : 0;

  return (
    <div className="space-y-6">
      <AdminBreadcrumb />
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{t("title")}</h1>
        <button
          onClick={() => {
            setSelectedStudent(null);
            setShowAddScore(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          {t("addEntry")}
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label={t("avgComposite")}
          value={avgScore > 0 ? Math.round(avgScore).toString() : "-"}
          icon={<Trophy className="h-5 w-5 text-primary" />}
        />
        <StatCard
          label={t("belowThreshold")}
          value={belowThreshold}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        />
        <StatCard
          label={t("topScorer")}
          value={topScore > 0 ? Math.round(topScore).toString() : "-"}
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
        />
        <StatCard
          label={t("totalEntries")}
          value={allStudents.length}
          icon={<Hash className="h-5 w-5 text-blue-500" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ หรือ รหัสนิสิต..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-card py-2 pl-9 pr-3 text-sm"
          />
        </div>
      </div>

      {/* Students Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : allStudents.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Trophy className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">ไม่พบข้อมูลนิสิต</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">ชื่อนิสิต</th>
                <th className="hidden px-4 py-3 text-left font-medium sm:table-cell">
                  รหัสนิสิต
                </th>
                <th className="px-4 py-3 text-center font-medium">
                  คะแนนรวม
                </th>
                <th className="hidden px-4 py-3 text-center font-medium md:table-cell">
                  หมวดหมู่
                </th>
                <th className="px-4 py-3 text-right font-medium">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {allStudents.map((student) => {
                const score = student.composite_score ?? 0;
                const scoreColor = getScoreColor(score);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const building = (student as any).buildings;

                return (
                  <tr key={student.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-medium">
                          {student.full_name_th}
                        </span>
                        {building?.name_th && (
                          <p className="text-xs text-muted-foreground">
                            {building.name_th}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {student.student_id}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`font-heading text-lg font-bold ${scoreColor}`}
                      >
                        {student.composite_score !== null
                          ? Math.round(score)
                          : "-"}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex justify-center gap-1">
                        {(student.categories ?? []).slice(0, 4).map((cat) => {
                          const pct =
                            cat.max_score > 0
                              ? (cat.score / cat.max_score) * 100
                              : 0;
                          return (
                            <div
                              key={cat.category_id}
                              className="w-12"
                              title={`${cat.name}: ${Math.round(cat.score)}/${cat.max_score}`}
                            >
                              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={`h-full rounded-full ${getScoreProgressColor(pct)}`}
                                  style={{
                                    width: `${Math.min(pct, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedStudent({
                            studentId: student.student_id!,
                            name: student.full_name_th,
                          });
                          setShowAddScore(true);
                        }}
                        className="rounded-md px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10"
                      >
                        {t("addEntry")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Score Dialog */}
      {showAddScore && (
        <AddScoreDialog
          studentId={selectedStudent?.studentId ?? null}
          studentName={selectedStudent?.name ?? null}
          onClose={() => {
            setShowAddScore(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon}
      </div>
      <p className="mt-2 font-heading text-2xl font-bold">{value}</p>
    </div>
  );
}
