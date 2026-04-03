import { BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/tiff',
  'image/bmp',
];

export const ALLOWED_VIDEO_MIMES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/x-flv',
  'video/avi',
];

export const ALLOWED_AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/aac',
  'audio/ogg',
  'audio/flac',
  'audio/x-m4a',
  'audio/mp4',
];

export const ALLOWED_DOC_MIMES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
];

export const FILE_SIZE_LIMITS = {
  IMAGE: 10 * 1024 * 1024, // 10MB
  VIDEO: 100 * 1024 * 1024, // 100MB
  AUDIO: 100 * 1024 * 1024, // 100MB
  DOCUMENT: 50 * 1024 * 1024, // 50MB
};

export function generateUniqueFileName(
  originalName: string,
  userId: string,
): string {
  const ext = originalName.split('.').pop() || '';
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0];
  return `${userId}/${timestamp}-${uuid}.${ext}`;
}

export function generateToolOutputPath(
  userId: string,
  toolCategory: string,
  toolName: string,
  extension: string,
): string {
  const timestamp = Date.now();
  const uuid = uuidv4().split('-')[0];
  return `tools/${toolCategory}/${userId}/${toolName}-${timestamp}-${uuid}.${extension}`;
}

export function validateImageFile(file: Express.Multer.File): void {
  if (!file) {
    throw new BadRequestException('No file provided');
  }
  if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Allowed: ${ALLOWED_IMAGE_MIMES.join(', ')}`,
    );
  }
  if (file.size > FILE_SIZE_LIMITS.IMAGE) {
    throw new BadRequestException(
      `File too large. Max size: ${FILE_SIZE_LIMITS.IMAGE / (1024 * 1024)}MB`,
    );
  }
}

export function validateVideoFile(file: Express.Multer.File): void {
  if (!file) {
    throw new BadRequestException('No file provided');
  }
  if (!ALLOWED_VIDEO_MIMES.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Allowed: ${ALLOWED_VIDEO_MIMES.join(', ')}`,
    );
  }
  if (file.size > FILE_SIZE_LIMITS.VIDEO) {
    throw new BadRequestException(
      `File too large. Max size: ${FILE_SIZE_LIMITS.VIDEO / (1024 * 1024)}MB`,
    );
  }
}

export function validateAudioFile(file: Express.Multer.File): void {
  if (!file) {
    throw new BadRequestException('No file provided');
  }
  if (!ALLOWED_AUDIO_MIMES.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Allowed: ${ALLOWED_AUDIO_MIMES.join(', ')}`,
    );
  }
  if (file.size > FILE_SIZE_LIMITS.AUDIO) {
    throw new BadRequestException(
      `File too large. Max size: ${FILE_SIZE_LIMITS.AUDIO / (1024 * 1024)}MB`,
    );
  }
}

export function validateDocumentFile(file: Express.Multer.File): void {
  if (!file) {
    throw new BadRequestException('No file provided');
  }
  if (!ALLOWED_DOC_MIMES.includes(file.mimetype)) {
    throw new BadRequestException(
      `Invalid file type. Allowed: ${ALLOWED_DOC_MIMES.join(', ')}`,
    );
  }
  if (file.size > FILE_SIZE_LIMITS.DOCUMENT) {
    throw new BadRequestException(
      `File too large. Max size: ${FILE_SIZE_LIMITS.DOCUMENT / (1024 * 1024)}MB`,
    );
  }
}

export function validatePdfFile(file: Express.Multer.File): void {
  if (!file) {
    throw new BadRequestException('No file provided');
  }
  if (file.mimetype !== 'application/pdf') {
    throw new BadRequestException('Only PDF files are allowed');
  }
  if (file.size > FILE_SIZE_LIMITS.DOCUMENT) {
    throw new BadRequestException(
      `File too large. Max size: ${FILE_SIZE_LIMITS.DOCUMENT / (1024 * 1024)}MB`,
    );
  }
}

export function getExtensionFromMime(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'image/tiff': 'tiff',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/aac': 'aac',
    'application/pdf': 'pdf',
  };
  return mimeToExt[mimeType] || 'bin';
}

export function getMimeFromExtension(extension: string): string {
  const extToMime: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    avif: 'image/avif',
    tiff: 'image/tiff',
    mp4: 'video/mp4',
    webm: 'video/webm',
    mov: 'video/quicktime',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    aac: 'audio/aac',
    pdf: 'application/pdf',
  };
  return extToMime[extension.toLowerCase()] || 'application/octet-stream';
}
