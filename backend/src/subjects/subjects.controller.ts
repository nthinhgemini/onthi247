import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('subjects')
export class SubjectsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  list() {
    return this.prisma.subject.findMany({
      orderBy: { code: 'asc' },
      include: { _count: { select: { chapters: true, exams: true } } },
    });
  }

  @Get(':id/chapters')
  async chapters(@Param('id') id: string) {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
    });
    if (!subject) {
      throw new NotFoundException('Môn học không tồn tại');
    }
    return this.prisma.chapter.findMany({
      where: { subject_id: id },
      orderBy: { order_index: 'asc' },
      include: {
        _count: { select: { questions: true } },
      },
    });
  }
}
