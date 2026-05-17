import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobsGateway } from './jobs.gateway';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_GLB = 'https://modelviewer.dev/shared-assets/models/Astronaut.glb';
const DEFAULT_USDZ = 'https://modelviewer.dev/shared-assets/models/Astronaut.usdz';

// Map item names (case-insensitive) to real food models
const FOOD_MODEL_MAP: Record<string, { glb: string; usdz?: string }> = {
  'zinger burger': {
    glb: '/models/zinger-burger.glb',
  },
  't-bone steak': {
    glb: '/models/t-bone-steak.glb',
  },
  'sourdough bread': {
    glb: '/models/sourdough-bread.glb',
  },
  'spicy ramen': {
    glb: '/models/spicy-ramen.glb',
  },
};

function resolveModel(itemName: string): { glb: string; usdz?: string } {
  const key = Object.keys(FOOD_MODEL_MAP).find((k) =>
    itemName.toLowerCase().includes(k),
  );
  if (key) return FOOD_MODEL_MAP[key];
  return { glb: DEFAULT_GLB, usdz: DEFAULT_USDZ };
}

@Injectable()
export class JobsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: JobsGateway,
  ) {}

  async createAndDispatchJob(itemId: string) {
    const jobId = uuidv4();

    const job = await this.prisma.processingJob.create({
      data: {
        jobId,
        status: 'QUEUED',
        progressPct: 0,
        item: { connect: { id: itemId } },
      },
    });

    await this.prisma.menuItem.update({
      where: { id: itemId },
      data: { status: 'QUEUED' },
    });

    // Emit initial status
    this.gateway.emitJobUpdate(jobId, {
      job_id: jobId,
      state: 'QUEUED',
      progress_pct: 0,
      message: 'Job queued for processing',
    });

    // Start simulated processing
    this.simulateProcessing(jobId, itemId);

    return { jobId, status: 'QUEUED' };
  }

  async getJobStatus(jobId: string) {
    const job = await this.prisma.processingJob.findUnique({
      where: { jobId },
    });
    if (!job) return { status: 'NOT_FOUND' };
    return {
      job_id: job.jobId,
      state: job.status,
      progress_pct: job.progressPct,
      message: job.errorMessage || '',
    };
  }

  private async simulateProcessing(jobId: string, itemId: string) {
    const steps = [
      { state: 'PROCESSING', progress: 10, message: 'Downloading video...', delay: 1500 },
      { state: 'PROCESSING', progress: 25, message: 'Extracting frames...', delay: 2000 },
      { state: 'PROCESSING', progress: 40, message: 'Running photogrammetry...', delay: 2500 },
      { state: 'PROCESSING', progress: 60, message: 'Building mesh...', delay: 2000 },
      { state: 'PROCESSING', progress: 75, message: 'Optimizing 3D model...', delay: 2000 },
      { state: 'PROCESSING', progress: 90, message: 'Applying Draco compression...', delay: 1500 },
      { state: 'COMPLETED', progress: 100, message: '3D model ready!', delay: 1000 },
    ];

    for (const step of steps) {
      await this.delay(step.delay);

      await this.prisma.processingJob.update({
        where: { jobId },
        data: {
          status: step.state as any,
          progressPct: step.progress,
        },
      });

      this.gateway.emitJobUpdate(jobId, {
        job_id: jobId,
        state: step.state,
        progress_pct: step.progress,
        message: step.message,
      });
    }

    // Look up the item name so we can assign the correct real-food model
    const item = await this.prisma.menuItem.findUnique({
      where: { id: itemId },
      select: { name: true },
    });

    const model = resolveModel(item?.name || '');

    // Update menu item with model URL
    await this.prisma.menuItem.update({
      where: { id: itemId },
      data: {
        status: 'COMPLETED',
        modelUrl: model.glb,
        usdzUrl: model.usdz || null,
      },
    });
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
