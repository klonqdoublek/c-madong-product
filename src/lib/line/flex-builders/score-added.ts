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
    ? `+${data.pointsChange}`
    : `${data.pointsChange}`
  const altPrefix = isPositive ? "ได้รับ" : "ถูกหัก"
  const emoji = isPositive ? "🎉" : "⚠️"

  const bubble = {
    type: "bubble",
    size: "micro",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        // Points change + mascot row
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
                  text: `${emoji} ${data.studentName}`,
                  color: "#FFFFFF",
                  size: "xxs",
                  weight: "bold",
                },
                {
                  type: "text",
                  text: pointsText,
                  color: "#FFFFFF",
                  size: "xxl",
                  weight: "bold",
                  margin: "xs",
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
              size: "45px",
              aspectMode: "fit",
              aspectRatio: "1:1",
              flex: 0,
              gravity: "bottom",
            },
          ],
          alignItems: "flex-end",
        },
        // Activity name
        {
          type: "text",
          text: data.activityName,
          color: "#FFFFFFCC",
          size: "xxs",
          wrap: true,
          margin: "md",
          maxLines: 2,
        },
        // Date
        {
          type: "text",
          text: data.updatedAt,
          color: "#FFFFFF80",
          size: "xxs",
          margin: "xs",
        },
      ],
      backgroundColor: bgColor,
      paddingAll: "lg",
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "ดูรายละเอียด →",
          color: bgColor,
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
    altText: `${emoji} ${data.studentName} ${altPrefix} ${Math.abs(data.pointsChange)} คะแนนจาก${data.activityName}`,
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
