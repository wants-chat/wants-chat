import { IsString, IsOptional, IsNumber } from 'class-validator';

export class QueryDocumentsDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsNumber()
  topK?: number;
}

export class UploadDocumentResponseDto {
  id: string;
  userId: string;
  filename: string;
  fileType: string;
  fileSize: number;
  chunkCount: number;
  storagePath: string;
  status: string;
  createdAt: Date;
}

export class DocumentListItemDto {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  chunkCount: number;
  status: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DocumentChunkDto {
  content: string;
  score: number;
  documentId: string;
  filename: string;
  chunkIndex: number;
}

export class QueryResultDto {
  query: string;
  chunks: DocumentChunkDto[];
}
