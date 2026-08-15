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

/**
 * Cấu trúc đề thi THPT Quốc gia từ 2025 trở đi (Quyết định 764/QĐ-BGDĐT).
 * Mỗi "part" là một phần của đề: I (trắc nghiệm 4 chọn 1), II (Đúng/Sai 4 ý),
 * III (trả lời ngắn). Số câu, trọng số điểm và thời gian theo chuẩn Bộ GD-ĐT.
 */
const OFFICIAL_2029: Record<
  string,
  {
    duration_minutes: number;
    parts: { type: string; count: number; weight: number }[];
  }
> = {
  // Toán: 90 phút, 22 câu: Phần I 12 câu x0.25 + Phần II 4 câu x1.0 + Phần III 6 câu x0.5 = 10đ
  toan: {
    duration_minutes: 90,
    parts: [
      { type: 'single_choice', count: 12, weight: 0.25 },
      { type: 'multi_true_false', count: 4, weight: 1 },
      { type: 'short_answer', count: 6, weight: 0.5 },
    ],
  },
  // Vật lý/Hóa/Sinh/Địa: 50 phút, 28 câu: 18 x0.25 + 4 x1.0 + 6 x0.25 = 10đ
  vatly: {
    duration_minutes: 50,
    parts: [
      { type: 'single_choice', count: 18, weight: 0.25 },
      { type: 'multi_true_false', count: 4, weight: 1 },
      { type: 'short_answer', count: 6, weight: 0.25 },
    ],
  },
  hoa: {
    duration_minutes: 50,
    parts: [
      { type: 'single_choice', count: 18, weight: 0.25 },
      { type: 'multi_true_false', count: 4, weight: 1 },
      { type: 'short_answer', count: 6, weight: 0.25 },
    ],
  },
  sinh: {
    duration_minutes: 50,
    parts: [
      { type: 'single_choice', count: 18, weight: 0.25 },
      { type: 'multi_true_false', count: 4, weight: 1 },
      { type: 'short_answer', count: 6, weight: 0.25 },
    ],
  },
  dia: {
    duration_minutes: 50,
    parts: [
      { type: 'single_choice', count: 18, weight: 0.25 },
      { type: 'multi_true_false', count: 4, weight: 1 },
      { type: 'short_answer', count: 6, weight: 0.25 },
    ],
  },
  // Lịch sử / GDKT-PL / Công nghệ: 50 phút, 28 câu: 24 x0.25 + 4 x1.0 = 10đ
  su: {
    duration_minutes: 50,
    parts: [
      { type: 'single_choice', count: 24, weight: 0.25 },
      { type: 'multi_true_false', count: 4, weight: 1 },
    ],
  },
  gdktpl: {
    duration_minutes: 50,
    parts: [
      { type: 'single_choice', count: 24, weight: 0.25 },
      { type: 'multi_true_false', count: 4, weight: 1 },
    ],
  },
  // Ngoại ngữ: 50 phút, 40 câu, mỗi câu 0.25đ
  anh: {
    duration_minutes: 50,
    parts: [{ type: 'single_choice', count: 40, weight: 0.25 }],
  },
};

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

  /**
   * Sinh đề thi theo đúng cấu trúc Kỳ thi tốt nghiệp THPT từ 2025/2029.
   * Mỗi phần lấy ngẫu nhiên câu hỏi đã duyệt đúng loại, trọng số điểm theo Bộ GD-ĐT.
   */
  async generateOfficial(
    dto: { title: string; subject_id: string },
    createdBy: string,
  ) {
    const subject = await this.prisma.subject.findUnique({
      where: { id: dto.subject_id },
    });
    if (!subject) {
      throw new NotFoundException('Môn học không tồn tại');
    }
    const spec = OFFICIAL_2029[subject.code];
    if (!spec) {
      throw new BadRequestException(
        `Môn "${subject.name}" chưa có cấu trúc đề chuẩn 2029`,
      );
    }

    const where: Prisma.QuestionWhereInput = {
      status: ContentStatus.published,
      chapter: { subject: { id: dto.subject_id } },
    };

    const selected: { id: string; weight: number }[] = [];
    for (const part of spec.parts) {
      const candidates = await this.prisma.question.findMany({
        where: { ...where, type: part.type as never },
        select: { id: true },
      });
      if (candidates.length < part.count) {
        throw new BadRequestException(
          `Không đủ câu hỏi loại "${part.type}" (cần ${part.count}, chỉ có ${candidates.length})`,
        );
      }
      selected.push(
        ...this.shuffle(candidates)
          .slice(0, part.count)
          .map((q) => ({ id: q.id, weight: part.weight })),
      );
    }

    return this.prisma.exam.create({
      data: {
        title: dto.title,
        subject_id: dto.subject_id,
        type: 'official',
        duration_minutes: spec.duration_minutes,
        total_score: 10,
        created_by: createdBy,
        status: ContentStatus.published,
        examQuestions: {
          create: selected.map((q, i) => ({
            question_id: q.id,
            order_index: i,
            score_weight: q.weight,
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
