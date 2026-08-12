import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return this.sanitize(user);
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });
    return this.sanitize(user);
  }

  async notifications(userId: string) {
    const [items, unread] = await Promise.all([
      this.prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 50,
      }),
      this.prisma.notification.count({
        where: { user_id: userId, is_read: false },
      }),
    ]);
    return { items, unread };
  }

  async markNotificationRead(userId: string, id: string) {
    const existing = await this.prisma.notification.findFirst({
      where: { id, user_id: userId },
    });
    if (!existing) {
      throw new NotFoundException('Thông báo không tồn tại');
    }
    return this.prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });
  }

  async markAllNotificationsRead(userId: string) {
    const res = await this.prisma.notification.updateMany({
      where: { user_id: userId, is_read: false },
      data: { is_read: true },
    });
    return { updated: res.count };
  }

  /** Hồ sơ công khai của một user (stats + huy hiệu + bài gần nhất). */
  async publicProfile(userId: string) {
    const [user, badges, submissions] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          full_name: true,
          school: true,
          target_block: true,
          avatar_url: true,
          xp: true,
          streak_count: true,
          created_at: true,
          _count: { select: { forumPosts: true } },
        },
      }),
      this.prisma.userBadge.findMany({
        where: { user_id: userId },
        include: { badge: true },
        orderBy: { earned_at: 'desc' },
      }),
      this.prisma.submission.findMany({
        where: { user_id: userId, status: 'submitted' },
        orderBy: { submitted_at: 'desc' },
        take: 10,
        include: { exam: { include: { subject: true } } },
      }),
    ]);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const total = submissions.length;
    const scores = submissions.map((s) => s.total_score ?? 0);
    const totalQuestions = submissions.reduce((a, s) => a + s.correct_count, 0);
    const best = total > 0 ? Math.max(...scores) : 0;
    const avg = total > 0 ? scores.reduce((a, b) => a + b, 0) / total : 0;

    return {
      user,
      stats: {
        submissions: total,
        avg_score: Number(avg.toFixed(2)),
        best_score: best,
        correct_count: totalQuestions,
      },
      badges: badges.map((b) => b.badge),
      recentSubmissions: submissions.map((s) => ({
        id: s.id,
        exam: { id: s.exam.id, title: s.exam.title, subject: s.exam.subject },
        total_score: s.total_score,
        submitted_at: s.submitted_at,
      })),
    };
  }

  private sanitize(user: { password_hash: string; [key: string]: unknown }) {
    const { password_hash: _ignored, ...rest } = user;
    void _ignored;
    return rest;
  }
}
