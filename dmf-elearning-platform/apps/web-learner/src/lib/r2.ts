// Cloudflare R2 Storage Configuration
// For DMF Listening Module - Audio File Storage

import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// R2 is S3-compatible, so we use AWS SDK
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'dmf-audio-files';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://audio.dmf-elearning.com`;

/**
 * Upload audio file to R2
 * @param file - File buffer
 * @param filename - Desired filename (e.g., "listening/A1/exercise-1.mp3")
 * @param contentType - MIME type (e.g., "audio/mpeg")
 * @returns Public URL of uploaded file
 */
export async function uploadAudioFile(
  file: Buffer,
  filename: string,
  contentType: string = 'audio/mpeg'
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename,
    Body: file,
    ContentType: contentType,
    // Make publicly accessible (or use signed URLs)
    // ACL: 'public-read', // R2 doesn't support ACLs, use bucket policy
  });

  await r2Client.send(command);
  
  // Return public URL
  return `${PUBLIC_URL}/${filename}`;
}

/**
 * Get signed URL for private audio file
 * @param filename - File key in R2
 * @param expiresIn - URL expiration time in seconds (default: 1 hour)
 * @returns Signed URL
 */
export async function getSignedAudioUrl(
  filename: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filename,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Check if audio file exists
 * @param filename - File key in R2
 * @returns Boolean indicating existence
 */
export async function audioFileExists(filename: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
    });
    await r2Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get public URL for audio file
 * @param filename - File key in R2
 * @returns Public URL
 */
export function getPublicAudioUrl(filename: string): string {
  return `${PUBLIC_URL}/${filename}`;
}

/**
 * Generate standardized audio filename
 * @param exerciseId - Exercise ID
 * @param level - CEFR level (A1, A2, B1, B2, C1, C2)
 * @param index - Exercise index within level
 * @returns Standardized filename
 */
export function generateAudioFilename(
  exerciseId: string,
  level: string,
  index: number
): string {
  return `listening/${level}/exercise-${index}-${exerciseId}.mp3`;
}

export { r2Client, BUCKET_NAME, PUBLIC_URL };
