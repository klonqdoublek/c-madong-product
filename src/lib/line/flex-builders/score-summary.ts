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
    size: "kilo",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        // Greeting text
        {
          type: "text",
          text: `🌟 คะแนนหอพักของพี่ ${data.studentName} :)`,
          color: "#FFFFFF",
          size: "md",
          weight: "bold",
          wrap: true,
        },
        // Score display
        {
          type: "text",
          text: `${data.score} คะแนน`,
          color: "#FFFFFF",
          size: "3xl",
          weight: "bold",
          margin: "md",
        },
        // Updated date
        {
          type: "text",
          text: `อัปเดทล่าสุด: ${data.updatedAt}`,
          color: "#FFFFFF80",
          size: "xs",
          margin: "sm",
        },
        // Spacer + mascot overlay area
        {
          type: "box",
          layout: "horizontal",
          contents: [
            { type: "filler" },
            {
              type: "image",
              url: MASCOT_URL,
              size: "80px",
              aspectRatio: "1:1",
              aspectMode: "fit",
              flex: 0,
            },
          ],
          margin: "md",
          position: "relative",
        },
      ],
      backgroundColor: "#DD598B",
      paddingAll: "xl",
      cornerRadius: "10px",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "box",
          layout: "vertical",
          contents: [
            {
              type: "text",
              text: "ดูรายละเอียดเพิ่มเติม",
              color: "#565655",
              size: "md",
              weight: "bold",
              align: "center",
            },
          ],
          paddingAll: "lg",
          action: {
            type: "uri",
            label: "ดูรายละเอียดเพิ่มเติม",
            uri: SCORE_PAGE_URL,
          },
        },
      ],
      backgroundColor: "#FFFFFF",
      paddingAll: "none",
    },
    styles: {
      body: {
        separator: false,
      },
      footer: {
        separator: true,
      },
    },
  }

  return {
    type: "flex",
    altText: `🌟 คะแนนหอพักของพี่ ${data.studentName}: ${data.score} คะแนน`,
    contents: bubble,
  }
}

/** Sample data for demo/preview */
export const DEMO_SCORE_SUMMARY: ScoreSummaryData = {
  studentName: "พิชญา",
  score: 18,
  updatedAt: "10 มีนาคม 2569",
}
