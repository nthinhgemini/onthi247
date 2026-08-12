import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto, GenerateMatrixDto } from './dto/exam.dto';
import { CurrentUser } from '../users/decorators';
import { Roles } from '../auth/decorators';

@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Get()
  list() {
    return this.examsService.list();
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.examsService.getById(id);
  }

  @Roles('teacher', 'admin')
  @Post()
  create(@Body() dto: CreateExamDto, @CurrentUser('sub') userId: string) {
    return this.examsService.create(dto, userId);
  }

  @Roles('teacher', 'admin')
  @Post('generate')
  generate(@Body() dto: GenerateMatrixDto, @CurrentUser('sub') userId: string) {
    return this.examsService.generate(dto, userId);
  }
}
