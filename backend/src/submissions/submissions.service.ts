import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitExamDto } from './dto/submission.dto';

@Injectable()
export class SubmissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async start(userId: string, examId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examQuestions: {
          include: { question: { select: { id: true } } },
        },
      },
    });
    if (!exam) {
      throw new NotFoundException('Đề thi không tồn tại');
    }

    const existing = await this.prisma.submission.findFirst({
      where: { user_id: userId, exam_id: examId },
      orderBy: { started_at: 'desc' },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.submission.create({
      data: {
        user_id: userId,
        exam_id: examId,
        answers: {
          create: exam.examQuestions.map((eq) => ({
            question_id: eq.question_id,
          })),
        },
      },
    });
  }

  async save(
    userId: string,
    submissionId: string,
    dto: SubmitExamDto,
    isSubmit = false,
  ) {
    const submission = await this.getOwned(userId, submissionId);
    if (submission.status === 'submitted' && !isSubmit) {
      throw new BadRequestException('Bài thi đã nộp, không thể chỉnh sửa');
    }

    const ops: Prisma.PrismaPromise<unknown>[] = [];

    const flaggedSet = new Set(dto.flagged ?? []);
    for (const [questionId, answers] of Object.entries(dto.answers ?? {})) {
      const serialized = answers.map((a) => a.answer).join('|');
      ops.push(
        this.prisma.submissionAnswer.updateMany({
          where: { submission_id: submissionId, question_id: questionId },
          data: { answer: serialized, is_correct: null },
        }),
      );
    }

    if (flaggedSet.size > 0) {
      ops.push(
        this.prisma.submissionAnswer.updateMany({
          where: {
            submission_id: submissionId,
            question_id: { in: Array.from(flaggedSet) },
          },
          data: { flagged: true },
        }),
      );
      ops.push(
        this.prisma.submissionAnswer.updateMany({
          where: {
            submission_id: submissionId,
            question_id: { notIn: Array.from(flaggedSet) },
          },
          data: { flagged: false },
        }),
      );
    }

    if (isSubmit) {
      await this.prisma.$transaction(ops);
      const graded = await this.grade(submission.id);
      ops.length = 0;
      for (const g of graded.answers) {
        ops.push(
          this.prisma.submissionAnswer.update({
            where: { id: g.id },
            data: { is_correct: g.is_correct, score: g.score },
          }),
        );
      }

      const correctCount = graded.answers.filter((a) => a.is_correct).length;
      const xpEarned = this.computeXp(graded.totalScore, correctCount);
      const earnedBadges = await this.awardProgress(
        userId,
        correctCount,
        xpEarned,
      );

      ops.push(
        this.prisma.submission.update({
          where: { id: submission.id },
          data: {
            status: 'submitted',
            submitted_at: new Date(),
            total_score: graded.totalScore,
            xp_awarded: xpEarned,
            correct_count: correctCount,
          },
        }),
      );
      await this.prisma.$transaction(ops);

      const result = await this.getOwned(userId, submissionId);
      return { ...result, xp_earned: xpEarned, earned_badges: earnedBadges };
    }

    await this.prisma.$transaction(ops);

    return this.getOwned(userId, submissionId);
  }

  async review(userId: string, submissionId: string) {
    const submission = await this.getOwned(userId, submissionId);
    const exam = await this.prisma.exam.findUniqueOrThrow({
      where: { id: submission.exam_id },
      include: {
        subject: true,
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
      },
    });

    const answers = await this.prisma.submissionAnswer.findMany({
      where: { submission_id: submissionId },
    });

    const answerMap = new Map(answers.map((a) => [a.question_id, a]));

    const questions = exam.examQuestions.map((eq) => {
      const answer = answerMap.get(eq.question_id);
      return {
        order_index: eq.order_index,
        score_weight: eq.score_weight,
        earned_score: answer?.score ?? null,
        question: eq.question,
        user_answer: answer?.answer ?? null,
        is_correct: answer?.is_correct ?? null,
      };
    });

    return {
      submission,
      exam: { id: exam.id, title: exam.title, subject: exam.subject },
      questions,
    };
  }

  private async grade(submissionId: string) {
    const submission = await this.prisma.submission.findUniqueOrThrow({
      where: { id: submissionId },
      include: {
        answers: true,
        exam: {
          include: {
            examQuestions: {
              include: {
                question: {
                  include: {
                    options: { orderBy: { order_index: 'asc' } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const answers = new Map(submission.answers.map((a) => [a.question_id, a]));

    const graded: { id: string; is_correct: boolean; score: number }[] = [];
    let earned = 0;

    for (const eq of submission.exam.examQuestions) {
      const q = eq.question;
      const answer = answers.get(q.id);
      const userAnswer = answer?.answer ?? '';
      const frac = userAnswer ? this.scoreAnswer(q, userAnswer) : 0;
      const score = Number((eq.score_weight * frac).toFixed(4));
      if (score > 0) earned += score;
      if (answer) {
        graded.push({ id: answer.id, is_correct: frac >= 1, score });
      }
    }

    const totalWeight = submission.exam.examQuestions.reduce(
      (s, eq) => s + eq.score_weight,
      0,
    );
    const totalScore =
      totalWeight > 0 ? Number(((earned / totalWeight) * 10).toFixed(2)) : 0;

    return { totalScore, answers: graded };
  }

  /**
   * Trả về tỷ lệ điểm đạt được của câu (0..1).
   * - single_choice / short_answer: 1 nếu đúng, 0 nếu sai.
   * - multi_true_false (format 2025, 4 ý):
   *   đúng cả 4 = 1.0, đúng 3 = 0.5, đúng 2 = 0.25, đúng 0-1 = 0.
   */
  private scoreAnswer(
    q: {
      type: string;
      options: { id: string; content: string; is_correct: boolean }[];
      explanation?: string | null;
    },
    userAnswer: string,
  ): number {
    if (q.type === 'single_choice') {
      return q.options.some((o) => o.id === userAnswer && o.is_correct) ? 1 : 0;
    }
    if (q.type === 'short_answer') {
      const correctAnswers = q.options
        .filter((o) => o.is_correct)
        .map((o) => this.normalize(o.content));
      const userParts = userAnswer.split('|').map((p) => this.normalize(p));
      if (userParts.length !== correctAnswers.length) return 0;
      return userParts.every((part, i) => correctAnswers[i] === part) ? 1 : 0;
    }
    if (q.type === 'multi_true_false') {
      const expected = q.options.map((o) => (o.is_correct ? 'true' : 'false'));
      const parts = userAnswer.split('|');
      const matches = expected.filter((e, i) => e === parts[i]).length;
      if (matches === 4) return 1;
      if (matches === 3) return 0.5;
      if (matches === 2) return 0.25;
      return 0;
    }
    return 0;
  }

  private normalize(s: string) {
    return s.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private computeXp(totalScore: number, correctCount: number): number {
    return Math.round(totalScore) * 10 + correctCount;
  }

  private async awardProgress(
    userId: string,
    correctCount: number,
    xpEarned: number,
  ): Promise<{ id: string; name: string; icon_url: string | null }[]> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = user.streak_count;
    if (user.last_activity_at) {
      const last = new Date(user.last_activity_at);
      last.setHours(0, 0, 0, 0);
      const diffDays = Math.round(
        (today.getTime() - last.getTime()) / 86_400_000,
      );
      if (diffDays === 1) streak += 1;
      else if (diffDays > 1) streak = 1;
    } else {
      streak = 1;
    }

    const newTotal = user.xp + xpEarned;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        xp: newTotal,
        streak_count: streak,
        last_activity_at: today,
      },
    });

    const badges = await this.prisma.badge.findMany();
    const owned = await this.prisma.userBadge.findMany({
      where: { user_id: userId },
      select: { badge_id: true },
    });
    const ownedSet = new Set(owned.map((o) => o.badge_id));

    const stats = await this.statsCache(userId, newTotal, streak);
    const newlyEarned: { id: string; name: string; icon_url: string | null }[] =
      [];
    const creates: { user_id: string; badge_id: string }[] = [];

    for (const badge of badges) {
      if (ownedSet.has(badge.id)) continue;
      if (!this.checkBadge(badge, stats)) continue;
      creates.push({ user_id: userId, badge_id: badge.id });
      newlyEarned.push({
        id: badge.id,
        name: badge.name,
        icon_url: badge.icon_url,
      });
    }

    if (creates.length > 0) {
      await this.prisma.userBadge.createMany({ data: creates });
      await this.prisma.notification.create({
        data: {
          user_id: userId,
          type: 'badge',
          content: `Bạn nhận được huy hiệu: ${newlyEarned
            .map((b) => b.name)
            .join(', ')}`,
        },
      });
    }

    return newlyEarned;
  }

  private async statsCache(userId: string, xp: number, streak: number) {
    const [submissions, best] = await Promise.all([
      this.prisma.submission.count({
        where: { user_id: userId, status: 'submitted' },
      }),
      this.prisma.submission.findMany({
        where: { user_id: userId, status: 'submitted' },
        orderBy: { total_score: 'desc' },
        take: 1,
        select: { total_score: true },
      }),
    ]);
    return {
      submissions: submissions + 1,
      streak,
      xp,
      bestScore: best[0]?.total_score ?? 0,
    };
  }

  private checkBadge(
    badge: { condition_type: string; condition_value: number },
    stats: {
      submissions: number;
      streak: number;
      xp: number;
      bestScore: number;
    },
  ): boolean {
    switch (badge.condition_type) {
      case 'submissions':
        return stats.submissions >= badge.condition_value;
      case 'perfect':
        return stats.bestScore >= 10;
      case 'streak':
        return stats.streak >= badge.condition_value;
      case 'xp':
        return stats.xp >= badge.condition_value;
      default:
        return false;
    }
  }

  private async getOwned(userId: string, submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { exam: { include: { subject: true } } },
    });
    if (!submission || submission.user_id !== userId) {
      throw new NotFoundException('Bài thi không tồn tại');
    }
    return submission;
  }

  async getOwnedPublic(userId: string, submissionId: string) {
    const submission = await this.getOwned(userId, submissionId);
    const flaggedRows = await this.prisma.submissionAnswer.findMany({
      where: { submission_id: submissionId, flagged: true },
      select: { question_id: true },
    });
    return {
      id: submission.id,
      exam_id: submission.exam_id,
      status: submission.status,
      started_at: submission.started_at,
      submitted_at: submission.submitted_at,
      total_score: submission.total_score,
      exam: submission.exam,
      flagged: flaggedRows.map((r) => r.question_id),
    };
  }

  async listMine(userId: string) {
    return this.prisma.submission.findMany({
      where: { user_id: userId },
      orderBy: { started_at: 'desc' },
      include: {
        exam: { include: { subject: true } },
        _count: { select: { answers: true } },
      },
    });
  }
}
