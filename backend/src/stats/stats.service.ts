import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(userId: string) {
    const [user, submissions] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.submission.findMany({
        where: { user_id: userId, status: 'submitted' },
        include: {
          exam: { include: { subject: true } },
          answers: { where: { is_correct: { not: null } } },
        },
        orderBy: { submitted_at: 'asc' },
      }),
    ]);

    const total = submissions.length;
    const scores = submissions.map((s) => s.total_score ?? 0);
    const avg = total > 0 ? scores.reduce((a, b) => a + b, 0) / total : 0;
    const best = total > 0 ? Math.max(...scores) : 0;
    const totalQuestions = submissions.reduce(
      (a, s) => a + s.answers.length,
      0,
    );
    const correct = submissions.reduce(
      (a, s) => a + s.answers.filter((x) => x.is_correct).length,
      0,
    );
    const accuracy =
      totalQuestions > 0 ? Math.round((correct / totalQuestions) * 100) : 0;

    const bySubject = new Map<
      string,
      { subject: string; count: number; avg: number }
    >();
    for (const s of submissions) {
      const id = s.exam.subject_id;
      const entry = bySubject.get(id) ?? {
        subject: s.exam.subject.name,
        count: 0,
        avg: 0,
      };
      entry.count += 1;
      entry.avg += s.total_score ?? 0;
      bySubject.set(id, entry);
    }
    const subjects = [...bySubject.values()].map((e) => ({
      subject: e.subject,
      count: e.count,
      avg: Number((e.avg / e.count).toFixed(2)),
    }));

    return {
      xp: user.xp,
      streak: user.streak_count,
      level: this.levelFromXp(user.xp),
      total_submissions: total,
      avg_score: Number(avg.toFixed(2)),
      best_score: best,
      accuracy,
      subjects,
    };
  }

  async progress(userId: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const submissions = await this.prisma.submission.findMany({
      where: {
        user_id: userId,
        status: 'submitted',
        submitted_at: { gte: since },
      },
      orderBy: { submitted_at: 'asc' },
    });

    const byDay = new Map<
      string,
      { date: string; count: number; scores: number[]; xp: number }
    >();
    for (const s of submissions) {
      const d = s.submitted_at ?? new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;
      const entry = byDay.get(key) ?? {
        date: key,
        count: 0,
        scores: [],
        xp: 0,
      };
      entry.count += 1;
      entry.scores.push(s.total_score ?? 0);
      entry.xp += s.xp_awarded;
      byDay.set(key, entry);
    }

    const out: {
      date: string;
      count: number;
      avg_score: number;
      xp: number;
    }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(since);
      d.setDate(since.getDate() + i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(d.getDate()).padStart(2, '0')}`;
      const entry = byDay.get(key);
      out.push({
        date: key,
        count: entry?.count ?? 0,
        avg_score: entry
          ? Number(
              (
                entry.scores.reduce((a, b) => a + b, 0) / entry.scores.length
              ).toFixed(2),
            )
          : 0,
        xp: entry?.xp ?? 0,
      });
    }
    return out;
  }

  async weakChapters(userId: string) {
    const submissions = await this.prisma.submission.findMany({
      where: { user_id: userId, status: 'submitted' },
      include: {
        answers: {
          where: { is_correct: { not: null } },
          include: {
            question: { include: { chapter: { include: { subject: true } } } },
          },
        },
      },
    });

    const byChapter = new Map<
      string,
      {
        chapter: string;
        subject: string;
        attempts: number;
        correct: number;
      }
    >();
    for (const s of submissions) {
      for (const a of s.answers) {
        const chapter = a.question.chapter;
        const entry = byChapter.get(chapter.id) ?? {
          chapter: chapter.name,
          subject: chapter.subject.name,
          attempts: 0,
          correct: 0,
        };
        entry.attempts += 1;
        if (a.is_correct) entry.correct += 1;
        byChapter.set(chapter.id, entry);
      }
    }

    const rows = [...byChapter.values()].map((e) => ({
      chapter: e.chapter,
      subject: e.subject,
      attempts: e.attempts,
      accuracy: Math.round((e.correct / e.attempts) * 100),
    }));
    rows.sort((a, b) => a.accuracy - b.accuracy);

    return {
      weakest: rows
        .filter((r) => r.attempts > 0)
        .slice(0, 5)
        .map((r) => ({
          ...r,
          suggestion:
            r.accuracy < 50
              ? `Ôn lại kiến thức cơ bản "${r.chapter}" trước khi làm bài.`
              : r.accuracy < 75
                ? `Luyện thêm bài tập "${r.chapter}" để nâng độ chính xác.`
                : `Giữ phong độ, tập trung câu hỏi khó ở "${r.chapter}".`,
        })),
      all: rows,
    };
  }

  async badges(userId: string) {
    const [all, earned] = await Promise.all([
      this.prisma.badge.findMany({ orderBy: { condition_value: 'asc' } }),
      this.prisma.userBadge.findMany({
        where: { user_id: userId },
        include: { badge: true },
      }),
    ]);
    const earnedMap = new Map(earned.map((e) => [e.badge_id, e.earned_at]));

    return {
      earned: all
        .filter((b) => earnedMap.has(b.id))
        .map((b) => ({ ...b, earned_at: earnedMap.get(b.id) })),
      locked: all.filter((b) => !earnedMap.has(b.id)),
    };
  }

  async leaderboard(limit = 20) {
    const users = await this.prisma.user.findMany({
      where: { role: 'student' },
      orderBy: { xp: 'desc' },
      take: limit,
      select: {
        id: true,
        full_name: true,
        xp: true,
        streak_count: true,
        avatar_url: true,
        school: true,
        _count: {
          select: { submissions: { where: { status: 'submitted' } } },
        },
      },
    });
    return users.map((u, i) => ({
      rank: i + 1,
      full_name: u.full_name,
      xp: u.xp,
      streak_count: u.streak_count,
      school: u.school,
      avatar_url: u.avatar_url,
      submissions: u._count.submissions,
    }));
  }

  private levelFromXp(xp: number): number {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    if (xp < 1500) return 5;
    return Math.floor(xp / 500) + 2;
  }
}
