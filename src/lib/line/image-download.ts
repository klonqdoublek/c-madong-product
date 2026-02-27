import { messagingApi } from "@line/bot-sdk";

let blobClient: messagingApi.MessagingApiBlobClient | null = null;

function getBlobClient(): messagingApi.MessagingApiBlobClient {
  if (blobClient) return blobClient;

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  if (!token) {
    throw new Error("LINE_CHANNEL_ACCESS_TOKEN is not set");
  }

  blobClient = new messagingApi.MessagingApiBlobClient({
    channelAccessToken: token,
  });
  return blobClient;
}

/** Download an image from LINE Content API and return as Buffer */
export async function downloadLineImage(
  messageId: string
): Promise<{ buffer: Buffer; contentType: string }> {
  const client = getBlobClient();
  const response = await client.getMessageContent(messageId);

  // The response is a Readable stream
  const chunks: Uint8Array[] = [];
  for await (const chunk of response as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }

  const buffer = Buffer.concat(chunks);
  // LINE images are typically JPEG
  const contentType = "image/jpeg";

  return { buffer, contentType };
}
