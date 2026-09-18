import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import * as crypto from 'crypto';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);
  private minioClient: Minio.Client;
  private readonly bucket: string;

  constructor(
    @InjectRepository(Document)
    private readonly docRepo: Repository<Document>,
    private readonly config: ConfigService,
  ) {
    this.minioClient = new Minio.Client({
      endPoint:  this.config.get('MINIO_ENDPOINT', 'localhost'),
      port:      this.config.get<number>('MINIO_PORT', 9000),
      useSSL:    this.config.get('MINIO_USE_SSL', 'false') === 'true',
      accessKey: this.config.get('MINIO_ROOT_USER', 'anagu_minio'),
      secretKey: this.config.get('MINIO_ROOT_PASSWORD', 'anagu_minio_secret'),
    });
    this.bucket = this.config.get('MINIO_BUCKET_DOCUMENTS', 'land-documents');
  }

  async uploadDocument(params: {
    applicationId: string;
    documentType:  string;
    fileName:      string;
    fileBuffer:    Buffer;
    mimeType:      string;
    uploadedBy:    string;
  }): Promise<Document> {
    const fileHash  = crypto.createHash('sha256').update(params.fileBuffer).digest('hex');
    const minioKey  = `${params.applicationId}/${params.documentType}/${Date.now()}-${params.fileName}`;

    await this.minioClient.putObject(
      this.bucket,
      minioKey,
      params.fileBuffer,
      params.fileBuffer.length,
      { 'Content-Type': params.mimeType, 'x-amz-meta-hash': fileHash },
    );

    const doc = this.docRepo.create({
      applicationId: params.applicationId,
      documentType:  params.documentType,
      fileName:      params.fileName,
      minioKey,
      fileHash,
      fileSizeBytes: String(params.fileBuffer.length),
      uploadedBy:    params.uploadedBy,
    });

    await this.docRepo.save(doc);
    this.logger.log(`Document uploaded: ${minioKey}`);
    return doc;
  }

  async getPresignedUrl(minioKey: string, expirySeconds = 3600): Promise<string> {
    return this.minioClient.presignedGetObject(this.bucket, minioKey, expirySeconds);
  }

  async getByApplication(applicationId: string): Promise<Document[]> {
    return this.docRepo.find({ where: { applicationId }, order: { createdAt: 'ASC' } });
  }
}
