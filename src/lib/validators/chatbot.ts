import { z } from "zod/v4"

/** LINE webhook body validation */
export const lineWebhookBodySchema = z.object({
  destination: z.string(),
  events: z.array(
    z.object({
      type: z.string(),
      replyToken: z.string().optional(),
      source: z.object({
        type: z.enum(["user", "group", "room"]),
        userId: z.string().optional(),
        groupId: z.string().optional(),
        roomId: z.string().optional(),
      }),
      timestamp: z.number(),
      mode: z.enum(["active", "standby"]).optional(),
      message: z
        .object({
          type: z.string(),
          id: z.string(),
          text: z.string().optional(),
        })
        .optional(),
      postback: z
        .object({
          data: z.string(),
          params: z.record(z.string(), z.string()).optional(),
        })
        .optional(),
    })
  ),
})

export type LineWebhookBodyInput = z.infer<typeof lineWebhookBodySchema>
