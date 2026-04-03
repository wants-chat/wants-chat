/**
 * Utility functions for handling image URLs
 */

/**
 * Handles S3 URLs by preserving presigned URL parameters when needed
 * @param url - The S3 URL with or without query parameters
 * @returns The URL with presigned parameters preserved if present, otherwise cleaned
 */
export function cleanS3Url(url: string | undefined | null): string | undefined {
  if (!url) return undefined;

  // Check if this is a presigned S3 URL (contains AWS authentication parameters)
  const isPresignedUrl = url.includes('X-Amz-Algorithm') ||
                         url.includes('X-Amz-Credential') ||
                         url.includes('X-Amz-Signature');

  // If it's a presigned URL, keep it as-is to maintain access
  if (isPresignedUrl) {
    return url;
  }

  // For non-presigned URLs, remove query parameters
  const cleanUrl = url.split('?')[0];


  return cleanUrl;
}

/**
 * Compares two image URLs, ignoring query parameters
 * @param url1 - First URL to compare
 * @param url2 - Second URL to compare
 * @returns True if the base URLs match
 */
export function compareImageUrls(url1?: string | null, url2?: string | null): boolean {
  const clean1 = cleanS3Url(url1);
  const clean2 = cleanS3Url(url2);
  return clean1 === clean2;
}

/**
 * Extracts the filename from an S3 URL
 * @param url - The S3 URL
 * @returns The filename or undefined
 */
export function getImageFilename(url?: string | null): string | undefined {
  if (!url) return undefined;
  
  const cleanUrl = cleanS3Url(url);
  if (!cleanUrl) return undefined;
  
  const parts = cleanUrl.split('/');
  return parts[parts.length - 1];
}