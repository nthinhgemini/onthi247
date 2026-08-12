import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { UpsertNoteDto } from './dto/notes.dto';
import { CurrentUser } from '../users/decorators';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Get()
  list(
    @CurrentUser('sub') userId: string,
    @Query('subject_id') subjectId?: string,
  ) {
    return this.notesService.list(userId, subjectId);
  }

  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: UpsertNoteDto) {
    return this.notesService.create(userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() dto: UpsertNoteDto,
  ) {
    return this.notesService.update(userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.notesService.remove(userId, id);
  }
}
