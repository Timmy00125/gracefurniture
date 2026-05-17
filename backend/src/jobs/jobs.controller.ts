import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { IsString } from 'class-validator';
import { JobsService } from './jobs.service';

class ConfirmJobDto {
  @IsString()
  itemId: string;
}

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('confirm')
  async confirmJob(@Body() dto: ConfirmJobDto) {
    return this.jobsService.createAndDispatchJob(dto.itemId);
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    return this.jobsService.getJobStatus(id);
  }
}
