import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertNoteDto } from './dto/notes.dto';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, subjectId?: string) {
    return this.prisma.note.findMany({
      where: {
        user_id: userId,
        ...(subjectId ? { subject_id: subjectId } : {}),
      },
      orderBy: { updated_at: 'desc' },
      include: { subject: { select: { id: true, name: true } } },
    });
  }

  async create(userId: string, dto: UpsertNoteDto) {
    return this.prisma.note.create({
      data: {
        user_id: userId,
        title: dto.title,
        content: dto.content,
        subject_id: dto.subject_id || null,
      },
      include: { subject: { select: { id: true, name: true } } },
    });
  }

  async update(userId: string, noteId: string, dto: UpsertNoteDto) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundException('Ghi chú không tồn tại');
    if (note.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa ghi chú này');
    }
    return this.prisma.note.update({
      where: { id: noteId },
      data: {
        title: dto.title,
        content: dto.content,
        subject_id: dto.subject_id || null,
      },
      include: { subject: { select: { id: true, name: true } } },
    });
  }

  async remove(userId: string, noteId: string) {
    const note = await this.prisma.note.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundException('Ghi chú không tồn tại');
    if (note.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa ghi chú này');
    }
    await this.prisma.note.delete({ where: { id: noteId } });
    return { ok: true };
  }
}
