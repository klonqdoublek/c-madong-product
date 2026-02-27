import type { FlexMessagePayload } from "./bill-reminder";

interface BookingConfirmationData {
  ticketTitle: string;
  date: string;
  time: string;
}

export function buildBookingConfirmationFlex(
  data: BookingConfirmationData
): FlexMessagePayload {
  return {
    type: "flex",
    altText: `ยืนยันนัดหมายซ่อม: ${data.date} ${data.time}`,
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "ยืนยันนัดหมายซ่อม",
            weight: "bold",
            size: "lg",
            color: "#E5487A",
          },
          { type: "separator", margin: "md" },
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            spacing: "sm",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "หัวข้อ", size: "sm", color: "#888888", flex: 3 },
                  { type: "text", text: data.ticketTitle, size: "sm", flex: 7, wrap: true },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "วันที่", size: "sm", color: "#888888", flex: 3 },
                  { type: "text", text: data.date, size: "sm", flex: 7 },
                ],
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "เวลา", size: "sm", color: "#888888", flex: 3 },
                  { type: "text", text: data.time, size: "sm", flex: 7 },
                ],
              },
            ],
          },
          {
            type: "text",
            text: "กรุณาเตรียมห้องให้พร้อมก่อนเวลานัดหมายนะ",
            size: "xs",
            color: "#888888",
            margin: "lg",
            wrap: true,
          },
        ],
      },
    },
  };
}
