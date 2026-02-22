import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"

const PRIMARY = "#7C3AED"

interface ScoreCategory {
  name: string
  score: number
  maxScore: number
}

interface ScoreSummaryData {
  studentName: string
  totalScore: number
  maxTotal: number
  categories: ScoreCategory[]
}

/** Score breakdown Flex bubble */
export function buildScoreSummaryFlex(data: ScoreSummaryData): FlexMessagePayload {
  const percentage = Math.round((data.totalScore / data.maxTotal) * 100)

  return {
    type: "flex",
    altText: `📊 คะแนนหอ: ${data.totalScore}/${data.maxTotal} (${percentage}%)`,
    contents: {
      type: "bubble",
      size: "mega",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "📊 สรุปคะแนนหอพัก",
            size: "sm",
            color: "#FFFFFF",
            weight: "bold",
          },
          {
            type: "text",
            text: data.studentName,
            size: "xs",
            color: "#FFFFFFCC",
            margin: "xs",
          },
        ],
        backgroundColor: PRIMARY,
        paddingAll: "lg",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          // Total score
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: `${data.totalScore}`,
                size: "3xl",
                weight: "bold",
                color: PRIMARY,
              },
              {
                type: "text",
                text: `/ ${data.maxTotal} คะแนน (${percentage}%)`,
                size: "sm",
                color: "#888888",
                gravity: "bottom",
                margin: "md",
              },
            ],
            alignItems: "baseline",
          },
          { type: "separator", color: "#E5E7EB" },
          // Category breakdown
          ...data.categories.map((cat) => ({
            type: "box" as const,
            layout: "horizontal" as const,
            contents: [
              {
                type: "text" as const,
                text: cat.name,
                size: "sm" as const,
                color: "#555555",
                flex: 5,
              },
              {
                type: "text" as const,
                text: `${cat.score}/${cat.maxScore}`,
                size: "sm" as const,
                color: "#333333",
                weight: "bold" as const,
                align: "end" as const,
                flex: 2,
              },
            ],
          })),
        ],
        paddingAll: "xl",
      },
    },
  }
}
