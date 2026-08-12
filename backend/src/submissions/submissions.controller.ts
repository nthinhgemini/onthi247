import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { SubmitExamDto, SaveProgressDto } from './dto/submission.dto';
import { CurrentUser } from '../users/decorators';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('exams/:examId/start')
  start(@CurrentUser('sub') userId: string, @Param('examId') examId: string) {
    return this.submissionsService.start(userId, examId);
  }

  @Post(':id/save')
  save(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: SaveProgressDto,
  ) {
    return this.submissionsService.save(userId, id, dto, false);
  }

  @Post(':id/submit')
  submit(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: SubmitExamDto,
  ) {
    return this.submissionsService.save(userId, id, dto, true);
  }

  @Get()
  mine(@CurrentUser('sub') userId: string) {
    return this.submissionsService.listMine(userId);
  }

  @Get(':id')
  get(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.submissionsService.getOwnedPublic(userId, id);
  }

  @Get(':id/review')
  review(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.submissionsService.review(userId, id);
  }
}
