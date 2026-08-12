import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QueryQuestionsDto,
} from './dto/question.dto';
import { CurrentUser } from '../users/decorators';
import { Roles } from '../auth/decorators';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  list(@Query() query: QueryQuestionsDto) {
    return this.questionsService.list(query);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.questionsService.getById(id);
  }

  @Roles('teacher', 'admin')
  @Post()
  create(@Body() dto: CreateQuestionDto, @CurrentUser('sub') userId: string) {
    return this.questionsService.create(dto, userId);
  }

  @Roles('teacher', 'admin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
    @CurrentUser('sub') userId: string,
  ) {
    return this.questionsService.update(id, dto, userId);
  }

  @Roles('teacher', 'admin')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('sub') userId: string) {
    return this.questionsService.remove(id, userId);
  }
}
