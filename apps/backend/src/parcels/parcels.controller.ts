import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';
import { ParcelsService } from './parcels.service';

@ApiTags('applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('applications')
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @Post()
  @Roles(UserRole.CITIZEN, UserRole.SURVEYOR, UserRole.REGISTRAR)
  @ApiOperation({ summary: 'Submit a new land registration application' })
  async submit(@Body() body: any, @Request() req: any) {
    return this.parcelsService.submitApplication({
      ...body,
      applicantId: req.user.id,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  async getOne(@Param('id') id: string) {
    return this.parcelsService.findApplicationById(id);
  }

  @Patch(':id/approve')
  @Roles(UserRole.REGISTRAR, UserRole.LAND_ADMINISTRATOR)
  @ApiOperation({ summary: 'Approve an application' })
  async approve(@Param('id') id: string, @Request() req: any) {
    return this.parcelsService.approveApplication(id, req.user.id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.REGISTRAR, UserRole.LAND_ADMINISTRATOR)
  @ApiOperation({ summary: 'Reject an application' })
  async reject(@Param('id') id: string, @Body() body: { stage: string; reason: string }, @Request() req: any) {
    return this.parcelsService.rejectApplication(id, body.stage, body.reason, req.user.id);
  }
}
