import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import {
  ListQuestionsDto,
  ListUsersDto,
  ModerateQuestionDto,
  UpdateUserDto,
} from './dto/admin.dto';
import { Roles } from '../auth/decorators';

@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('overview')
  overview() {
    return this.adminService.overview();
  }

  @Get('users')
  listUsers(@Query() query: ListUsersDto) {
    return this.adminService.listUsers(query);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.adminService.updateUser(id, dto);
  }

  @Get('questions')
  listQuestions(@Query() query: ListQuestionsDto) {
    return this.adminService.listQuestions(query);
  }

  @Patch('questions/:id/moderate')
  moderateQuestion(@Param('id') id: string, @Body() dto: ModerateQuestionDto) {
    return this.adminService.moderateQuestion(id, dto);
  }
}
