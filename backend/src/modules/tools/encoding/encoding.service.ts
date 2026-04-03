import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import {
  HashAlgorithm,
  UuidVersion,
  Base64EncodeDto,
  Base64DecodeDto,
  UrlEncodeDto,
  UrlDecodeDto,
  HashGenerateDto,
  UuidGenerateDto,
  JwtDecodeDto,
  Base64EncodeResponseDto,
  Base64DecodeResponseDto,
  UrlEncodeResponseDto,
  UrlDecodeResponseDto,
  HashGenerateResponseDto,
  UuidGenerateResponseDto,
  JwtDecodeResponseDto,
} from './dto/encoding.dto';

@Injectable()
export class EncodingService {
  encodeBase64(dto: Base64EncodeDto): Base64EncodeResponseDto {
    const buffer = Buffer.from(dto.text, 'utf8');
    let encoded = buffer.toString('base64');

    if (dto.urlSafe) {
      encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }

    return {
      encoded,
      originalLength: dto.text.length,
      encodedLength: encoded.length,
    };
  }

  decodeBase64(dto: Base64DecodeDto): Base64DecodeResponseDto {
    try {
      // Handle URL-safe Base64
      let base64 = dto.base64.replace(/-/g, '+').replace(/_/g, '/');

      // Add padding if necessary
      const padding = base64.length % 4;
      if (padding) {
        base64 += '='.repeat(4 - padding);
      }

      const buffer = Buffer.from(base64, 'base64');
      const decoded = buffer.toString('utf8');

      return {
        decoded,
        valid: true,
      };
    } catch (error) {
      return {
        decoded: '',
        valid: false,
        error: 'Invalid Base64 string',
      };
    }
  }

  encodeUrl(dto: UrlEncodeDto): UrlEncodeResponseDto {
    const encoded = dto.encodeFullUrl
      ? encodeURI(dto.text)
      : encodeURIComponent(dto.text);

    return { encoded };
  }

  decodeUrl(dto: UrlDecodeDto): UrlDecodeResponseDto {
    try {
      const decoded = decodeURIComponent(dto.encoded);
      return { decoded };
    } catch (error) {
      throw new BadRequestException('Invalid URL-encoded string');
    }
  }

  generateHash(dto: HashGenerateDto): HashGenerateResponseDto {
    const hash = crypto
      .createHash(dto.algorithm)
      .update(dto.text)
      .digest('hex');

    return {
      hash,
      algorithm: dto.algorithm,
      inputLength: dto.text.length,
    };
  }

  generateUuid(dto: UuidGenerateDto): UuidGenerateResponseDto {
    const version = dto.version || UuidVersion.V4;
    const count = dto.count || 1;
    const uuids: string[] = [];

    for (let i = 0; i < count; i++) {
      if (version === UuidVersion.V7) {
        uuids.push(uuidv7());
      } else {
        uuids.push(uuidv4());
      }
    }

    return {
      uuids,
      version,
      count,
    };
  }

  decodeJwt(dto: JwtDecodeDto): JwtDecodeResponseDto {
    try {
      const parts = dto.token.split('.');

      if (parts.length !== 3) {
        throw new BadRequestException('Invalid JWT format');
      }

      const [headerB64, payloadB64, signature] = parts;

      // Decode header
      const headerBuffer = Buffer.from(headerB64, 'base64');
      const header = JSON.parse(headerBuffer.toString('utf8'));

      // Decode payload
      const payloadBuffer = Buffer.from(payloadB64, 'base64');
      const payload = JSON.parse(payloadBuffer.toString('utf8'));

      // Check expiration
      let expired: boolean | undefined;
      let expiresAt: string | undefined;

      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        expiresAt = expDate.toISOString();
        expired = expDate < new Date();
      }

      return {
        header,
        payload,
        signature,
        valid: true,
        expired,
        expiresAt,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException(`Failed to decode JWT: ${error.message}`);
    }
  }

  // Additional helper methods
  generateMultipleHashes(text: string): Record<string, string> {
    const algorithms: HashAlgorithm[] = [
      HashAlgorithm.MD5,
      HashAlgorithm.SHA1,
      HashAlgorithm.SHA256,
      HashAlgorithm.SHA512,
    ];

    const result: Record<string, string> = {};
    for (const algo of algorithms) {
      result[algo] = crypto.createHash(algo).update(text).digest('hex');
    }

    return result;
  }
}
