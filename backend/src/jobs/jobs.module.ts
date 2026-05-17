import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsGateway } from './jobs.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [JobsController],
  providers: [JobsService, JobsGateway],
})
export class JobsModule {}
