import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { QdrantService } from '../qdrant/qdrant.service';
import { AiService } from '../ai/ai.service';
import { R2Service } from '../storage/r2.service';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import {
  DocumentChunkDto,
  DocumentListItemDto,
  UploadDocumentResponseDto,
} from './dto/knowledge.dto';

// Collection name for user document chunks
const COLLECTION_NAME = 'user_documents';
const VECTOR_SIZE = 1536; // text-embedding-3-small

// Chunking configuration
const MAX_CHUNK_TOKENS = 512;
const CHUNK_OVERLAP_TOKENS = 50;
// Rough estimate: 1 token ~ 4 characters
const CHARS_PER_TOKEN = 4;
const MAX_CHUNK_CHARS = MAX_CHUNK_TOKENS * CHARS_PER_TOKEN;
const OVERLAP_CHARS = CHUNK_OVERLAP_TOKENS * CHARS_PER_TOKEN;

export const SUPPORTED_TYPES = ['pdf', 'txt', 'md', 'csv', 'docx'];

const MAX_FILENAME_LENGTH = 200;

function sanitizeFilename(raw: string): string {
  const base = path.basename(raw || '').replace(/\x00/g, '');
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/^\.+/, '');
  const fallback = cleaned.length > 0 ? cleaned : 'upload';
  return fallback.slice(0, MAX_FILENAME_LENGTH);
}

interface UserDocument {
  id: string;
  user_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  chunk_count: number;
  storage_path: string;
  qdrant_collection: string;
  status: string;
  error_message?: string;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class DocumentIngestionService {
  private readonly logger = new Logger(DocumentIngestionService.name);
  private collectionReady = false;

  constructor(
    private readonly db: DatabaseService,
    private readonly qdrantService: QdrantService,
    private readonly aiService: AiService,
    private readonly r2Service: R2Service,
  ) {}

  /**
   * Ensure the Qdrant collection and DB table exist
   */
  async ensureInfrastructure(): Promise<void> {
    if (this.collectionReady) return;

    // Ensure DB table
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS user_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL,
        filename VARCHAR(500) NOT NULL,
        file_type VARCHAR(20) NOT NULL,
        file_size BIGINT NOT NULL DEFAULT 0,
        chunk_count INTEGER NOT NULL DEFAULT 0,
        storage_path TEXT,
        qdrant_collection VARCHAR(100) NOT NULL DEFAULT 'user_documents',
        status VARCHAR(50) NOT NULL DEFAULT 'processing',
        error_message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await this.db.query(
      `CREATE INDEX IF NOT EXISTS idx_user_documents_user_id ON user_documents(user_id)`,
    );
    await this.db.query(
      `CREATE INDEX IF NOT EXISTS idx_user_documents_status ON user_documents(status)`,
    );

    // Ensure Qdrant collection
    const ready = await this.qdrantService.waitForInit();
    if (ready) {
      await this.qdrantService.createCollection(
        COLLECTION_NAME,
        VECTOR_SIZE,
        'Cosine',
      );
    }

    this.collectionReady = true;
    this.logger.log('Knowledge infrastructure ready');
  }

  // ============================================
  // Ingest Document
  // ============================================

  async ingestDocument(
    userId: string,
    file: Express.Multer.File,
  ): Promise<UploadDocumentResponseDto> {
    await this.ensureInfrastructure();

    const safeFilename = sanitizeFilename(file.originalname);
    const ext = this.getFileExtension(safeFilename);
    if (!SUPPORTED_TYPES.includes(ext)) {
      throw new BadRequestException(
        `Unsupported file type: .${ext}. Supported: ${SUPPORTED_TYPES.join(', ')}`,
      );
    }

    // Create document record with "processing" status
    const docId = uuidv4();
    const doc = await this.db.insert<UserDocument>('user_documents', {
      id: docId,
      user_id: userId,
      filename: safeFilename,
      file_type: ext,
      file_size: file.size,
      chunk_count: 0,
      storage_path: '',
      qdrant_collection: COLLECTION_NAME,
      status: 'processing',
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Process asynchronously so upload returns immediately
    this.processDocumentAsync(userId, docId, file, ext, safeFilename).catch((err) => {
      this.logger.error(
        `Failed to process document ${docId}: ${err.message}`,
      );
    });

    return {
      id: doc.id,
      userId: doc.user_id,
      filename: doc.filename,
      fileType: doc.file_type,
      fileSize: doc.file_size,
      chunkCount: 0,
      storagePath: '',
      status: 'processing',
      createdAt: doc.created_at,
    };
  }

  private async processDocumentAsync(
    userId: string,
    docId: string,
    file: Express.Multer.File,
    ext: string,
    safeFilename: string,
  ): Promise<void> {
    try {
      // 1. Upload raw file to R2
      let storagePath = '';
      try {
        const uploadResult = await this.r2Service.uploadFile(file, userId, {
          path: 'documents',
        });
        storagePath = uploadResult.key;
      } catch (err) {
        this.logger.warn(`R2 upload skipped (not configured?): ${err.message}`);
      }

      // 2. Extract text
      const text = await this.extractText(file.buffer, ext, safeFilename);
      if (!text || text.trim().length === 0) {
        await this.markDocumentError(docId, 'No text content could be extracted');
        return;
      }

      // 3. Chunk
      const chunks = this.chunkText(text);
      if (chunks.length === 0) {
        await this.markDocumentError(docId, 'Document produced no chunks');
        return;
      }

      // 4. Generate embeddings in batches
      const BATCH_SIZE = 20;
      const allVectors: Array<{
        id: string;
        vector: number[];
        payload: Record<string, any>;
      }> = [];

      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batch = chunks.slice(i, i + BATCH_SIZE);
        const embeddings = await this.aiService.generateEmbeddings(batch);

        for (let j = 0; j < batch.length; j++) {
          const chunkIndex = i + j;
          allVectors.push({
            id: uuidv4(),
            vector: embeddings[j],
            payload: {
              document_id: docId,
              user_id: userId,
              chunk_index: chunkIndex,
              source_filename: safeFilename,
              content: batch[j],
            },
          });
        }
      }

      // 5. Store in Qdrant
      const qdrantReady = this.qdrantService.isConfigured();
      if (qdrantReady) {
        await this.qdrantService.bulkInsertVectors(
          COLLECTION_NAME,
          allVectors,
          100,
        );
      } else {
        await this.markDocumentError(docId, 'Qdrant not available');
        return;
      }

      // 6. Update document status to ready
      await this.db.update(
        'user_documents',
        { id: docId },
        {
          status: 'ready',
          chunk_count: chunks.length,
          storage_path: storagePath,
          updated_at: new Date(),
        },
      );

      this.logger.log(
        `Document ${docId} ingested: ${chunks.length} chunks for user ${userId}`,
      );
    } catch (error) {
      this.logger.error(`Document ingestion failed for ${docId}: ${error.message}`);
      await this.markDocumentError(docId, error.message);
    }
  }

  private async markDocumentError(
    docId: string,
    message: string,
  ): Promise<void> {
    try {
      await this.db.update(
        'user_documents',
        { id: docId },
        {
          status: 'error',
          error_message: message,
          updated_at: new Date(),
        },
      );
    } catch (err) {
      this.logger.error(`Failed to mark document error: ${err.message}`);
    }
  }

  // ============================================
  // Text Extraction
  // ============================================

  private async extractText(
    buffer: Buffer,
    ext: string,
    filename: string,
  ): Promise<string> {
    switch (ext) {
      case 'txt':
      case 'md':
        return buffer.toString('utf-8');

      case 'csv':
        return this.extractCSV(buffer);

      case 'pdf':
        return this.extractPDF(buffer);

      case 'docx':
        return this.extractDOCX(buffer);

      default:
        throw new BadRequestException(`Unsupported file type: ${ext}`);
    }
  }

  private async extractPDF(buffer: Buffer): Promise<string> {
    try {
      const pdfParse = require('pdf-parse');
      const result = await pdfParse(buffer);
      return result.text || '';
    } catch (error) {
      this.logger.error(`PDF extraction failed: ${error.message}`);
      throw new Error('Failed to extract text from PDF');
    }
  }

  private extractCSV(buffer: Buffer): string {
    try {
      const Papa = require('papaparse');
      const csvText = buffer.toString('utf-8');
      const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });

      if (!result.data || result.data.length === 0) {
        return csvText; // Fallback to raw text
      }

      // Convert rows to readable text
      const headers = Object.keys(result.data[0]);
      const lines = result.data.map((row: Record<string, any>) =>
        headers.map((h) => `${h}: ${row[h] ?? ''}`).join(', '),
      );

      return `Columns: ${headers.join(', ')}\n\n${lines.join('\n')}`;
    } catch (error) {
      this.logger.error(`CSV extraction failed: ${error.message}`);
      return buffer.toString('utf-8');
    }
  }

  private async extractDOCX(buffer: Buffer): Promise<string> {
    try {
      const { Document, Packer } = require('docx');
      // docx package is for generation, not parsing. Use raw XML extraction.
      const JSZip = require('jszip');
      const zip = await JSZip.loadAsync(buffer);
      const documentXml = await zip.file('word/document.xml')?.async('string');

      if (!documentXml) {
        throw new Error('No document.xml found in DOCX');
      }

      // Strip XML tags to get plain text
      const text = documentXml
        .replace(/<w:br[^>]*\/>/gi, '\n')
        .replace(/<\/w:p>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      return text;
    } catch (error) {
      this.logger.error(`DOCX extraction failed: ${error.message}`);
      throw new Error('Failed to extract text from DOCX');
    }
  }

  // ============================================
  // Chunking
  // ============================================

  private chunkText(text: string): string[] {
    const chunks: string[] = [];
    const sentences = this.splitIntoSentences(text);

    let currentChunk = '';

    for (const sentence of sentences) {
      if (
        currentChunk.length + sentence.length > MAX_CHUNK_CHARS &&
        currentChunk.length > 0
      ) {
        chunks.push(currentChunk.trim());

        // Keep overlap from the end of the current chunk
        if (OVERLAP_CHARS > 0 && currentChunk.length > OVERLAP_CHARS) {
          currentChunk = currentChunk.slice(-OVERLAP_CHARS) + sentence;
        } else {
          currentChunk = sentence;
        }
      } else {
        currentChunk += (currentChunk ? ' ' : '') + sentence;
      }
    }

    // Push the last chunk
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  private splitIntoSentences(text: string): string[] {
    // Split on sentence boundaries, paragraph breaks, etc.
    const raw = text.split(/(?<=[.!?])\s+|\n{2,}/);
    return raw
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  // ============================================
  // Query Documents (RAG Retrieval)
  // ============================================

  async queryDocuments(
    userId: string,
    query: string,
    topK: number = 5,
  ): Promise<DocumentChunkDto[]> {
    await this.ensureInfrastructure();

    if (!this.qdrantService.isConfigured()) {
      return [];
    }

    // Generate query embedding
    const queryVector = await this.aiService.generateEmbedding(query);

    // Search Qdrant filtered by user_id
    const results = await this.qdrantService.searchVectors(
      COLLECTION_NAME,
      queryVector,
      topK,
      0.3, // minimum similarity threshold
      { user_id: userId },
    );

    return results.map((r) => ({
      content: r.payload?.content || '',
      score: r.score,
      documentId: r.payload?.document_id || '',
      filename: r.payload?.source_filename || '',
      chunkIndex: r.payload?.chunk_index ?? 0,
    }));
  }

  // ============================================
  // Delete Document
  // ============================================

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    await this.ensureInfrastructure();

    const doc = await this.db.findOne<UserDocument>('user_documents', {
      id: documentId,
      user_id: userId,
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    // Delete chunks from Qdrant
    if (this.qdrantService.isConfigured()) {
      await this.qdrantService.deleteByFilter(COLLECTION_NAME, {
        document_id: documentId,
        user_id: userId,
      });
    }

    // Delete file from R2 if stored
    if (doc.storage_path) {
      try {
        await this.r2Service.deleteFile(doc.storage_path);
      } catch (err) {
        this.logger.warn(`Failed to delete R2 file: ${err.message}`);
      }
    }

    // Delete DB record
    await this.db.query('DELETE FROM user_documents WHERE id = $1 AND user_id = $2', [documentId, userId]);

    this.logger.log(`Deleted document ${documentId} for user ${userId}`);
  }

  // ============================================
  // List Documents
  // ============================================

  async listDocuments(userId: string): Promise<DocumentListItemDto[]> {
    await this.ensureInfrastructure();

    const docs = await this.db.findMany<UserDocument>(
      'user_documents',
      { user_id: userId },
      { orderBy: 'created_at', order: 'DESC' },
    );

    return docs.map((d) => ({
      id: d.id,
      filename: d.filename,
      fileType: d.file_type,
      fileSize: d.file_size,
      chunkCount: d.chunk_count,
      status: d.status,
      errorMessage: d.error_message,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  // ============================================
  // Check if user has documents (for chat integration)
  // ============================================

  async userHasDocuments(userId: string): Promise<boolean> {
    try {
      const result = await this.db.query(
        `SELECT EXISTS(SELECT 1 FROM user_documents WHERE user_id = $1 AND status = 'ready') AS has_docs`,
        [userId],
      );
      return result.rows[0]?.has_docs === true;
    } catch {
      return false;
    }
  }

  // ============================================
  // Helpers
  // ============================================

  private getFileExtension(filename: string): string {
    return (filename.split('.').pop() || '').toLowerCase();
  }
}
