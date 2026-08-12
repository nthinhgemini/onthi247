import { Controller, Get, Query } from '@nestjs/common';
import { StatsService } from './stats.service';
import { CurrentUser } from '../users/decorators';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('me/overview')
  overview(@CurrentUser('sub') userId: string) {
    return this.statsService.overview(userId);
  }

  @Get('me/progress')
  progress(@CurrentUser('sub') userId: string, @Query('days') days?: string) {
    return this.statsService.progress(userId, days ? Number(days) : 30);
  }

  @Get('me/weak-chapters')
  weakChapters(@CurrentUser('sub') userId: string) {
    return this.statsService.weakChapters(userId);
  }

  @Get('me/badges')
  badges(@CurrentUser('sub') userId: string) {
    return this.statsService.badges(userId);
  }

  @Get('leaderboard')
  leaderboard(@Query('limit') limit?: string) {
    return this.statsService.leaderboard(limit ? Number(limit) : 20);
  }
}
