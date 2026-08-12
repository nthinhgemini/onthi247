import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  ListQuestionsDto,
  ListUsersDto,
  ModerateQuestionDto,
  UpdateUserDto,
} from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async overview() {
    const [
      users,
      teachers,
      questions,
      publishedQuestions,
      exams,
      submissions,
      submissionsToday,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: UserRole.teacher } }),
      this.prisma.question.count(),
      this.prisma.question.count({ where: { status: 'published' } }),
      this.prisma.exam.count(),
      this.prisma.submission.count({ where: { status: 'submitted' } }),
      this.prisma.submission.count({
        where: {
          status: 'submitted',
          submitted_at: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    const recentUsers = await this.prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
    });

    const recentQuestions = await this.prisma.question.findMany({
      where: { status: 'draft' },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: {
        chapter: { include: { subject: true } },
        creator: { select: { id: true, full_name: true } },
      },
    });

    return {
      counts: {
        users,
        teachers,
        questions,
        publishedQuestions,
        pendingQuestions: recentQuestions.length,
        exams,
        submissions,
        submissionsToday,
      },
      recentUsers,
      recentQuestions,
    };
  }

  async listUsers(query: ListUsersDto) {
    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.search) {
      where.OR = [
        { full_name: { contains: query.search } },
        { email: { contains: query.search } },
      ];
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
          school: true,
          target_block: true,
          avatar_url: true,
          xp: true,
          streak_count: true,
          is_active: true,
          created_at: true,
          _count: {
            select: { submissions: { where: { status: 'submitted' } } },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async updateUser(userId: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.role !== undefined && { role: dto.role }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        xp: true,
        streak_count: true,
        created_at: true,
      },
    });
  }

  async listQuestions(query: ListQuestionsDto) {
    const where: Prisma.QuestionWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.subject) where.chapter = { subject: { id: query.subject } };
    if (query.search) where.content = { contains: query.search };

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.question.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          chapter: { include: { subject: true } },
          options: { orderBy: { order_index: 'asc' } },
          creator: { select: { id: true, full_name: true } },
        },
      }),
      this.prisma.question.count({ where }),
    ]);
    return { items, total, page, pageSize };
  }

  async moderateQuestion(questionId: string, dto: ModerateQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) {
      throw new NotFoundException('Câu hỏi không tồn tại');
    }
    const updated = await this.prisma.question.update({
      where: { id: questionId },
      data: { status: dto.status },
      include: {
        chapter: { include: { subject: true } },
        creator: { select: { id: true, full_name: true } },
      },
    });

    if (dto.status === 'rejected' && dto.reason) {
      await this.prisma.notification.create({
        data: {
          user_id: question.created_by,
          type: 'moderation',
          content: `Câu hỏi "${question.content.slice(0, 60)}…" đã bị từ chối. Lý do: ${dto.reason}`,
        },
      });
    }

    return updated;
  }
}
