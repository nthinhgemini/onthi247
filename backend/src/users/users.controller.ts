import { Controller, Get, Patch, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CurrentUser } from './decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  me(@CurrentUser('sub') userId: string) {
    return this.usersService.findMe(userId);
  }

  @Patch('me')
  updateMe(@CurrentUser('sub') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateMe(userId, dto);
  }

  @Get('me/notifications')
  notifications(@CurrentUser('sub') userId: string) {
    return this.usersService.notifications(userId);
  }

  @Patch('me/notifications/:id/read')
  markNotificationRead(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    return this.usersService.markNotificationRead(userId, id);
  }

  @Patch('me/notifications/read')
  markAllNotificationsRead(@CurrentUser('sub') userId: string) {
    return this.usersService.markAllNotificationsRead(userId);
  }

  @Get(':id/profile')
  profile(@Param('id') id: string) {
    return this.usersService.publicProfile(id);
  }
}
