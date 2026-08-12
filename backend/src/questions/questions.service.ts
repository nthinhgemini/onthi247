import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateQuestionDto,
  UpdateQuestionDto,
  QueryQuestionsDto,
} from './dto/question.dto';

const questionInclude = {
  chapter: { include: { subject: true } },
  options: { orderBy: { order_index: 'asc' } },
  creator: { select: { id: true, full_name: true } },
} satisfies Prisma.QuestionInclude;

@Injectable()
export class QuestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: QueryQuestionsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;

    const where: Prisma.QuestionWhereInput = {};
    if (query.chapter) where.chapter_id = query.chapter;
    if (query.difficulty) where.difficulty = query.difficulty as never;
    if (query.type) where.type = query.type as never;
    if (query.status) where.status = query.status as never;
    if (query.subject) {
      where.chapter = { subject: { id: query.subject } };
    }
    if (query.search) {
      where.content = { contains: query.search };
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        include: questionInclude,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.question.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async getById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: questionInclude,
    });
    if (!question) {
      throw new NotFoundException('Câu hỏi không tồn tại');
    }
    return question;
  }

  async create(dto: CreateQuestionDto, createdBy: string) {
    const { options = [], ...data } = dto;
    return this.prisma.question.create({
      data: {
        ...data,
        created_by: createdBy,
        status: dto.status ?? 'draft',
        options: options.length
          ? {
              create: options.map((o, i) => ({
                content: o.content,
                is_correct: o.is_correct,
                order_index: o.order_index ?? i,
              })),
            }
          : undefined,
      },
      include: questionInclude,
    });
  }

  async update(id: string, dto: UpdateQuestionDto, userId: string) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Câu hỏi không tồn tại');
    }
    if (existing.created_by !== userId) {
      throw new ForbiddenException('Bạn không phải người tạo câu hỏi này');
    }

    const { options, ...data } = dto;
    const ops: Prisma.PrismaPromise<unknown>[] = [];
    if (options) {
      ops.push(
        this.prisma.questionOption.deleteMany({
          where: { question_id: id },
        }),
      );
    }
    ops.push(
      this.prisma.question.update({
        where: { id },
        data: {
          ...data,
          options: options?.length
            ? {
                create: options.map((o, i) => ({
                  content: o.content,
                  is_correct: o.is_correct,
                  order_index: o.order_index ?? i,
                })),
              }
            : undefined,
        },
      }),
    );
    await this.prisma.$transaction(ops);
    return this.getById(id);
  }

  async remove(id: string, userId: string) {
    const existing = await this.prisma.question.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('Câu hỏi không tồn tại');
    }
    if (existing.created_by !== userId) {
      throw new ForbiddenException('Bạn không phải người tạo câu hỏi này');
    }
    await this.prisma.question.delete({ where: { id } });
    return { success: true };
  }
}
