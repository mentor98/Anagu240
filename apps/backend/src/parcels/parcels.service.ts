import {
  Injectable, Logger, NotFoundException, BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Application } from './entities/application.entity';
import { Parcel } from './entities/parcel.entity';
import { SpatialVerificationService } from '../gis/spatial-verification.service';
import { AuditService } from '../audit/audit.service';
import { MqttService } from '../mqtt/mqtt.service';

/**
 * Integration — Unified Registration Workflow
 *
 * Orchestrates the full pipeline:
 *   submission → spatial → ownership → legal → approval → blockchain → NFT → MQTT
 *
 * State machine:
 *   SUBMITTED → SPATIAL_VERIFIED → OWNERSHIP_VERIFIED → LEGAL_VERIFIED
 *   → APPROVED → BLOCKCHAIN_REGISTERED → NFT_ISSUED → COMPLETED
 *   → REJECTED (at any stage)
 */
@Injectable()
export class ParcelsService {
  private readonly logger = new Logger(ParcelsService.name);

  constructor(
    @InjectRepository(Application) private readonly appRepo: Repository<Application>,
    @InjectRepository(Parcel)      private readonly parcelRepo: Repository<Parcel>,
    private readonly gisService:   SpatialVerificationService,
    private readonly auditService: AuditService,
    private readonly mqttService:  MqttService,
    private readonly dataSource:   DataSource,
  ) {}

  /** Submit a new land registration application (step 1 of pipeline). */
  async submitApplication(params: {
    applicantId:        string;
    ownerName:          string;
    nationalId:         string;
    surveyPlanNumber?:  string;
    communityWitnesses?: string[];
    legalClearanceHash?: string;
    coordinates:        [number, number][];
    lga?:               string;
    state?:             string;
    addressDesc?:       string;
  }): Promise<{ applicationId: string; parcelId: string; spatialResult: any }> {
    // ── Stage 1: Spatial verification ─────────────────────────────────
    const spatialResult = await this.gisService.verifyParcel(params.coordinates);

    if (!spatialResult.valid) {
      throw new BadRequestException({
        message: 'Spatial verification failed',
        reason:  spatialResult.reason,
        detail:  spatialResult.diagnosticMessage,
      });
    }

    // Save parcel (using raw SQL for the geometry column)
    const parcelResult = await this.dataSource.query(
      `INSERT INTO parcels (geom, spatial_hash, status, lga, state, address_desc)
       VALUES (ST_GeomFromText($1, 4326), decode($2, 'hex'), 'PENDING', $3, $4, $5)
       RETURNING id`,
      [
        spatialResult.wkt!,
        spatialResult.spatialHash!.replace('0x', ''),
        params.lga    ?? null,
        params.state  ?? null,
        params.addressDesc ?? null,
      ],
    );
    const parcelId = parcelResult[0].id;

    // Save application
    const application = this.appRepo.create({
      parcelId,
      applicantId:       params.applicantId,
      ownerName:         params.ownerName,
      nationalId:        params.nationalId,
      surveyPlanNumber:  params.surveyPlanNumber  ?? null,
      communityWitnesses: params.communityWitnesses ?? null,
      legalClearanceHash: params.legalClearanceHash ?? null,
      status: 'SPATIAL_VERIFIED',
    });
    await this.appRepo.save(application);

    // Audit
    await this.auditService.log({
      entityType: 'application',
      entityId:   application.id,
      eventType:  'SPATIAL_VERIFIED',
      fromStatus: 'SUBMITTED',
      toStatus:   'SPATIAL_VERIFIED',
      actorRole:  'CITIZEN',
      actorId:    params.applicantId,
    });

    // MQTT
    await this.mqttService.publishSpatialVerified(application.id, parcelId);

    return { applicationId: application.id, parcelId, spatialResult };
  }

  async findApplicationById(id: string): Promise<Application> {
    const app = await this.appRepo.findOne({ where: { id } });
    if (!app) throw new NotFoundException(`Application ${id} not found`);
    return app;
  }

  async approveApplication(
    applicationId: string,
    registrarId:   string,
  ): Promise<Application> {
    const app = await this.findApplicationById(applicationId);

    if (app.status !== 'OWNERSHIP_VERIFIED' && app.status !== 'LEGAL_VERIFIED') {
      throw new BadRequestException(
        `Cannot approve application in status: ${app.status}`
      );
    }

    app.status      = 'APPROVED';
    app.registrarId = registrarId;
    app.approvedAt  = new Date();
    await this.appRepo.save(app);

    await this.auditService.log({
      entityType: 'application',
      entityId:   app.id,
      eventType:  'APPROVED',
      fromStatus: 'LEGAL_VERIFIED',
      toStatus:   'APPROVED',
      actorRole:  'REGISTRAR',
      actorId:    registrarId,
    });

    await this.mqttService.publishApproved(app.id, registrarId);
    return app;
  }

  async rejectApplication(
    applicationId: string,
    stage:         string,
    reason:        string,
    actorId:       string,
  ): Promise<Application> {
    const app = await this.findApplicationById(applicationId);
    app.status          = 'REJECTED';
    app.rejectionStage  = stage;
    app.rejectionReason = reason;
    await this.appRepo.save(app);

    await this.auditService.log({
      entityType: 'application',
      entityId:   app.id,
      eventType:  'REJECTED',
      fromStatus: app.status,
      toStatus:   'REJECTED',
      actorRole:  'REGISTRAR',
      actorId:    actorId,
      metadata:   { stage, reason },
    });

    await this.mqttService.publishRejected(app.id, stage, reason);
    return app;
  }
}
