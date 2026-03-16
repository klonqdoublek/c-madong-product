import type { FlexMessagePayload } from "@/lib/line/flex-builders/bill-reminder"

const PRIMARY = "#DD598B"

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

/** Score breakdown Flex bubble — compact chatbot version */
export function buildScoreSummaryFlex(data: ScoreSummaryData): FlexMessagePayload {
  const percentage = Math.round((data.totalScore / data.maxTotal) * 100)

  return {
    type: "flex",
    altText: `📊 คะแนนหอ: ${data.totalScore}/${data.maxTotal} (${percentage}%)`,
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: "📊 สรุปคะแนนหอพัก",
                size: "xs",
                color: "#FFFFFF",
                weight: "bold",
              },
              {
                type: "text",
                text: data.studentName,
                size: "xxs",
                color: "#FFFFFFAA",
                margin: "xs",
              },
            ],
            flex: 3,
          },
          {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "text",
                text: `${data.totalScore}`,
                size: "xl",
                weight: "bold",
                color: "#FFFFFF",
                align: "end",
              },
              {
                type: "text",
                text: `/ ${data.maxTotal}`,
                size: "xxs",
                color: "#FFFFFFAA",
                align: "end",
              },
            ],
            flex: 1,
          },
        ],
        backgroundColor: PRIMARY,
        paddingAll: "md",
        alignItems: "center",
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          // Progress indicator text
          {
            type: "text",
            text: `${percentage}% ของคะแนนเต็ม`,
            size: "xxs",
            color: "#999999",
            align: "end",
          },
          { type: "separator", color: "#F3F4F6" },
          // Category breakdown
          ...data.categories.map((cat) => ({
            type: "box" as const,
            layout: "horizontal" as const,
            contents: [
              {
                type: "text" as const,
                text: cat.name,
                size: "xs" as const,
                color: "#555555",
                flex: 4,
                wrap: true,
              },
              {
                type: "text" as const,
                text: `${cat.score}/${cat.maxScore}`,
                size: "xs" as const,
                color: "#333333",
                weight: "bold" as const,
                align: "end" as const,
                flex: 1,
              },
            ],
          })),
        ],
        paddingAll: "md",
      },
    },
  }
}
