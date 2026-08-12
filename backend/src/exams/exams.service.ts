import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ContentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamDto, GenerateMatrixDto } from './dto/exam.dto';

const examInclude = {
  subject: true,
  creator: { select: { id: true, full_name: true } },
  examQuestions: {
    orderBy: { order_index: 'asc' },
    include: {
      question: {
        include: {
          chapter: { include: { subject: true } },
          options: { orderBy: { order_index: 'asc' } },
        },
      },
    },
  },
} satisfies Prisma.ExamInclude;

const DIFFICULTIES = [
  'nhan_biet',
  'thong_hieu',
  'van_dung',
  'van_dung_cao',
] as const;

@Injectable()
export class ExamsService {
  constructor(private readonly prisma: PrismaService) {}

  async list() {
    return this.prisma.exam.findMany({
      where: { status: ContentStatus.published },
      include: {
        subject: true,
        creator: { select: { id: true, full_name: true } },
        _count: { select: { examQuestions: true } },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async getById(id: string, withAnswers = false) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: examInclude,
    });
    if (!exam) {
      throw new NotFoundException('Đề thi không tồn tại');
    }
    if (!withAnswers) {
      return this.stripAnswers(exam);
    }
    return exam;
  }

  async create(dto: CreateExamDto, createdBy: string) {
    const { questions = [], ...data } = dto;
    const totalQuestions = questions.length;
    if (totalQuestions === 0) {
      throw new BadRequestException('Đề thi cần ít nhất 1 câu hỏi');
    }
    return this.prisma.exam.create({
      data: {
        ...data,
        created_by: createdBy,
        status: ContentStatus.published,
        duration_minutes: data.duration_minutes ?? 50,
        total_score: data.total_score ?? 10,
        examQuestions: {
          create: questions.map((q, i) => ({
            question_id: q.question_id,
            order_index: q.order_index ?? i,
            score_weight: q.score_weight ?? 1,
          })),
        },
      },
      include: examInclude,
    });
  }

  async generate(dto: GenerateMatrixDto, createdBy: string) {
    const total = DIFFICULTIES.reduce(
      (sum, d) => sum + (dto.matrix[d] ?? 0),
      0,
    );
    if (total === 0) {
      throw new BadRequestException('Ma trận phải có ít nhất 1 câu hỏi');
    }

    const where: Prisma.QuestionWhereInput = {
      status: ContentStatus.published,
      chapter: { subject: { id: dto.subject_id } },
    };
    if (dto.chapter_id) {
      where.chapter_id = dto.chapter_id;
    }

    const selected: { id: string }[] = [];
    for (const difficulty of DIFFICULTIES) {
      const count = dto.matrix[difficulty] ?? 0;
      if (count === 0) continue;
      const candidates = await this.prisma.question.findMany({
        where: { ...where, difficulty: difficulty as never },
        select: { id: true },
      });
      if (candidates.length < count) {
        throw new BadRequestException(
          `Không đủ câu hỏi mức "${difficulty}" (cần ${count}, chỉ có ${candidates.length})`,
        );
      }
      selected.push(...this.shuffle(candidates).slice(0, count));
    }

    return this.prisma.exam.create({
      data: {
        title: dto.title,
        subject_id: dto.subject_id,
        type: dto.type ?? 'practice',
        duration_minutes: dto.duration_minutes ?? 50,
        created_by: createdBy,
        status: ContentStatus.published,
        examQuestions: {
          create: selected.map((q, i) => ({
            question_id: q.id,
            order_index: i,
            score_weight: 1,
          })),
        },
      },
      include: examInclude,
    });
  }

  private shuffle<T>(arr: T[]): T[] {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  private stripAnswers<T extends { examQuestions: unknown[] }>(exam: T): T {
    return {
      ...exam,
      examQuestions: exam.examQuestions.map(
        (eq: { question?: { options?: unknown[] } }) => {
          if (!eq.question?.options) return eq;
          return {
            ...eq,
            question: {
              ...eq.question,
              options: eq.question.options.map((o: Record<string, unknown>) => {
                const { is_correct, ...rest } = o;
                void is_correct;
                return rest;
              }),
            },
          };
        },
      ),
    };
  }
}
