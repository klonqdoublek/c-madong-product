import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const MAINTENANCE_PHOTOS_BUCKET = "maintenance-photos";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PHOTOS = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface UploadResult {
  url: string;
  path: string;
}

export interface UploadError {
  message: string;
  code: "INVALID_TYPE" | "TOO_LARGE" | "TOO_MANY" | "UPLOAD_FAILED";
}

/** Validate a file before upload */
export function validatePhoto(
  file: { size: number; type: string },
  existingCount: number
): UploadError | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      message: `Unsupported file type: ${file.type}`,
      code: "INVALID_TYPE",
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return {
      message: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 5MB)`,
      code: "TOO_LARGE",
    };
  }
  if (existingCount >= MAX_PHOTOS) {
    return {
      message: `Maximum ${MAX_PHOTOS} photos allowed`,
      code: "TOO_MANY",
    };
  }
  return null;
}

/** Upload a photo to the maintenance-photos bucket */
export async function uploadPhoto(
  supabase: SupabaseClient<Database>,
  file: File | Blob,
  userId: string,
  ticketId: string = "draft"
): Promise<UploadResult> {
  const timestamp = Date.now();
  const ext =
    file instanceof File
      ? file.name.split(".").pop() ?? "jpg"
      : file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
          ? "webp"
          : "jpg";
  const path = `${userId}/${ticketId}/${timestamp}.${ext}`;

  const { error } = await supabase.storage
    .from(MAINTENANCE_PHOTOS_BUCKET)
    .upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(MAINTENANCE_PHOTOS_BUCKET).getPublicUrl(path);

  return { url: publicUrl, path };
}

/** Upload a photo from a Buffer (used by chatbot for LINE image downloads) */
export async function uploadPhotoBuffer(
  supabase: SupabaseClient<Database>,
  buffer: Buffer,
  contentType: string,
  userId: string,
  ticketId: string = "draft"
): Promise<UploadResult> {
  const timestamp = Date.now();
  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const path = `${userId}/${ticketId}/${timestamp}.${ext}`;

  const { error } = await supabase.storage
    .from(MAINTENANCE_PHOTOS_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(MAINTENANCE_PHOTOS_BUCKET).getPublicUrl(path);

  return { url: publicUrl, path };
}

/** Delete a photo from storage */
export async function deletePhoto(
  supabase: SupabaseClient<Database>,
  path: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(MAINTENANCE_PHOTOS_BUCKET)
    .remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}
