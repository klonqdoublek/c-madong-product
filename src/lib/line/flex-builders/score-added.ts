import type { FlexMessagePayload } from "./bill-reminder"

/** Data needed to build a Score Added Flex Message */
export interface ScoreAddedData {
  /** Student display name */
  studentName: string
  /** Name of the activity/event */
  activityName: string
  /** Points change — positive (+1) or negative (-2) */
  pointsChange: number
  /** Formatted date string, e.g. "10 มีนาคม 2569" */
  updatedAt: string
}

const MASCOT_URL = "https://c-madong-product.vercel.app/images/mascot.svg"
const SCORE_PAGE_URL = "https://c-madong-product.vercel.app/th/score"

const COLOR_GREEN = "#23BE47"
const COLOR_RED = "#E53E3E"

export function buildScoreAddedFlex(
  data: ScoreAddedData
): FlexMessagePayload {
  const isPositive = data.pointsChange >= 0
  const bgColor = isPositive ? COLOR_GREEN : COLOR_RED
  const pointsText = isPositive
    ? `+${data.pointsChange} คะแนน!`
    : `${data.pointsChange} คะแนน`
  const altPrefix = isPositive ? "ได้รับ" : "ถูกหัก"

  const bubble = {
    type: "bubble",
    size: "kilo",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        // --- Colored top section ---
        {
          type: "box",
          layout: "vertical",
          contents: [
            // Text content column (left side via horizontal wrapper)
            {
              type: "box",
              layout: "horizontal",
              contents: [
                // Left: text stack
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "text",
                      text: `🌟 คะแนนหอพักของพี่ ${data.studentName} :)`,
                      color: "#FFFFFF",
                      size: "sm",
                      weight: "bold",
                      wrap: true,
                    },
                    {
                      type: "text",
                      text: data.activityName,
                      color: "#FFFFFF",
                      size: "sm",
                      weight: "bold",
                      wrap: true,
                      margin: "sm",
                    },
                    {
                      type: "text",
                      text: pointsText,
                      color: "#FFFFFF",
                      size: "3xl",
                      weight: "bold",
                      margin: "lg",
                    },
                    {
                      type: "text",
                      text: `อัปเดทล่าสุด: ${data.updatedAt}`,
                      color: "#FFFFFF80",
                      size: "xxs",
                      margin: "md",
                    },
                  ],
                  flex: 3,
                },
                // Right: mascot image
                {
                  type: "box",
                  layout: "vertical",
                  contents: [
                    {
                      type: "image",
                      url: MASCOT_URL,
                      size: "80px",
                      aspectMode: "fit",
                      aspectRatio: "1:1",
                    },
                  ],
                  flex: 1,
                  justifyContent: "flex-end",
                  alignItems: "flex-end",
                },
              ],
              alignItems: "flex-end",
            },
          ],
          backgroundColor: bgColor,
          cornerRadius: "10px",
          paddingAll: "xl",
        },
      ],
      paddingAll: "0px",
      backgroundColor: "#FFFFFF",
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
              size: "sm",
              weight: "bold",
              align: "center",
            },
          ],
          paddingAll: "md",
          action: {
            type: "uri",
            label: "ดูรายละเอียด",
            uri: SCORE_PAGE_URL,
          },
        },
      ],
      paddingAll: "sm",
      backgroundColor: "#FFFFFF",
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
    altText: `🌟 ${data.studentName} ${altPrefix} ${Math.abs(data.pointsChange)} คะแนนจากกิจกรรม${data.activityName}`,
    contents: bubble,
  }
}

/** Sample data for demo/preview */
export const DEMO_SCORE_ADDED: ScoreAddedData = {
  studentName: "พิชญา",
  activityName: "กิจกรรมซ้อมหนีไฟ",
  pointsChange: 1,
  updatedAt: "10 มีนาคม 2569",
}
