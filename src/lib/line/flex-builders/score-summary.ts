import type { FlexMessagePayload } from "./bill-reminder"

/** Data needed to build the Score Summary Flex card */
export interface ScoreSummaryData {
  /** Display name of the student */
  studentName: string
  /** Composite dorm score */
  score: number
  /** Formatted Thai date string, e.g. "10 มีนาคม 2569" */
  updatedAt: string
}

const MASCOT_URL =
  "https://c-madong-product.vercel.app/images/mascot.svg"

const SCORE_PAGE_URL =
  "https://c-madong-product.vercel.app/th/score"

export function buildScoreSummaryFlex(
  data: ScoreSummaryData
): FlexMessagePayload {
  const bubble = {
    type: "bubble",
    size: "micro",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        // Header row: text + mascot
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "box",
              layout: "vertical",
              contents: [
                {
                  type: "text",
                  text: `🌟 ${data.studentName}`,
                  color: "#FFFFFF",
                  size: "xs",
                  weight: "bold",
                  wrap: true,
                },
                {
                  type: "text",
                  text: `${data.score}`,
                  color: "#FFFFFF",
                  size: "xxl",
                  weight: "bold",
                  margin: "sm",
                },
                {
                  type: "text",
                  text: "คะแนน",
                  color: "#FFFFFFCC",
                  size: "xxs",
                },
              ],
              flex: 3,
            },
            {
              type: "image",
              url: MASCOT_URL,
              size: "50px",
              aspectRatio: "1:1",
              aspectMode: "fit",
              flex: 0,
              gravity: "bottom",
            },
          ],
          alignItems: "flex-end",
        },
        // Updated date
        {
          type: "text",
          text: `อัปเดท ${data.updatedAt}`,
          color: "#FFFFFF80",
          size: "xxs",
          margin: "md",
        },
      ],
      backgroundColor: "#DD598B",
      paddingAll: "lg",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "ดูรายละเอียด →",
          color: "#DD598B",
          size: "xs",
          weight: "bold",
          align: "center",
        },
      ],
      paddingAll: "sm",
      action: {
        type: "uri",
        label: "ดูรายละเอียด",
        uri: SCORE_PAGE_URL,
      },
    },
    styles: {
      footer: {
        separator: true,
      },
    },
  }

  return {
    type: "flex",
    altText: `🌟 คะแนนหอพักของ ${data.studentName}: ${data.score} คะแนน`,
    contents: bubble,
  }
}

/** Sample data for demo/preview */
export const DEMO_SCORE_SUMMARY: ScoreSummaryData = {
  studentName: "พิชญา",
  score: 18,
  updatedAt: "10 มีนาคม 2569",
}
