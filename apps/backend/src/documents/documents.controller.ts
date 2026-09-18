import {
  Controller, Get, Param, Post, Request,
  UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DocumentsService } from './documents.service';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post(':applicationId/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a land document for an application' })
  async upload(
    @Param('applicationId') applicationId: string,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.documentsService.uploadDocument({
      applicationId,
      documentType:  req.body?.documentType ?? 'OTHER',
      fileName:      file.originalname,
      fileBuffer:    file.buffer,
      mimeType:      file.mimetype,
      uploadedBy:    req.user.id,
    });
  }

  @Get(':applicationId')
  @ApiOperation({ summary: 'List all documents for an application' })
  async list(@Param('applicationId') applicationId: string) {
    return this.documentsService.getByApplication(applicationId);
  }
}
