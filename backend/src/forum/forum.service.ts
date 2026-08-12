import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ListPostsDto,
  CreatePostDto,
  UpdatePostDto,
  CreateCommentDto,
} from './dto/forum.dto';

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string, query: ListPostsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Record<string, unknown> = {};

    if (query.subject_id) where.subject_id = query.subject_id;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { content: { contains: query.search } },
      ];
    }

    const [total, items, userVoteIds] = await Promise.all([
      this.prisma.forumPost.count({ where }),
      this.prisma.forumPost.findMany({
        where,
        orderBy:
          query.sort === 'popular'
            ? [{ vote_count: 'desc' }, { created_at: 'desc' }]
            : { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: { id: true, full_name: true, avatar_url: true, xp: true },
          },
          subject: { select: { id: true, name: true } },
        },
      }),
      this.prisma.forumVote
        .findMany({ where: { user_id: userId } })
        .then((vs) => new Set(vs.map((v) => v.post_id))),
    ]);

    return {
      items: items.map((p) => ({ ...p, voted: userVoteIds.has(p.id) })),
      total,
      page,
      pageSize,
    };
  }

  async create(userId: string, dto: CreatePostDto) {
    return this.prisma.forumPost.create({
      data: {
        user_id: userId,
        title: dto.title,
        content: dto.content,
        subject_id: dto.subject_id || null,
      },
      include: {
        user: { select: { id: true, full_name: true, avatar_url: true } },
      },
    });
  }

  async findOne(userId: string, postId: string) {
    const exists = await this.prisma.forumPost.findUnique({
      where: { id: postId },
    });
    if (!exists) {
      throw new NotFoundException('Bài viết không tồn tại');
    }
    await this.prisma.forumPost.update({
      where: { id: postId },
      data: { view_count: { increment: 1 } },
    });

    const [post, vote] = await Promise.all([
      this.prisma.forumPost.findUniqueOrThrow({
        where: { id: postId },
        include: {
          user: {
            select: { id: true, full_name: true, avatar_url: true, xp: true },
          },
          subject: { select: { id: true, name: true } },
          comments: {
            orderBy: [{ is_best: 'desc' }, { created_at: 'asc' }],
            include: {
              user: {
                select: {
                  id: true,
                  full_name: true,
                  avatar_url: true,
                  xp: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.forumVote.findUnique({
        where: { post_id_user_id: { post_id: postId, user_id: userId } },
      }),
    ]);

    return { ...post, voted: !!vote };
  }

  async update(userId: string, postId: string, dto: UpdatePostDto) {
    const post = await this.prisma.forumPost.findUniqueOrThrow({
      where: { id: postId },
    });
    if (post.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền sửa bài viết này');
    }
    return this.prisma.forumPost.update({
      where: { id: postId },
      data: {
        subject_id:
          dto.subject_id !== undefined ? dto.subject_id || null : undefined,
        title: dto.title,
        content: dto.content,
      },
    });
  }

  async remove(userId: string, role: string, postId: string) {
    const post = await this.prisma.forumPost.findUniqueOrThrow({
      where: { id: postId },
    });
    if (post.user_id !== userId && role !== 'admin') {
      throw new ForbiddenException('Bạn không có quyền xóa bài viết này');
    }
    await this.prisma.forumPost.delete({ where: { id: postId } });
    return { ok: true };
  }

  async vote(userId: string, postId: string) {
    const existing = await this.prisma.forumVote.findUnique({
      where: { post_id_user_id: { post_id: postId, user_id: userId } },
    });
    if (existing) {
      await this.prisma.forumVote.delete({ where: { id: existing.id } });
      await this.prisma.forumPost.update({
        where: { id: postId },
        data: { vote_count: { decrement: 1 } },
      });
      return { voted: false };
    }
    await this.prisma.forumVote.create({
      data: { post_id: postId, user_id: userId },
    });
    await this.prisma.forumPost.update({
      where: { id: postId },
      data: { vote_count: { increment: 1 } },
    });
    return { voted: true };
  }

  async addComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.forumPost.findUniqueOrThrow({
      where: { id: postId },
    });
    const comment = await this.prisma.forumComment.create({
      data: { post_id: postId, user_id: userId, content: dto.content },
      include: {
        user: {
          select: { id: true, full_name: true, avatar_url: true, xp: true },
        },
      },
    });
    await this.prisma.forumPost.update({
      where: { id: postId },
      data: { comment_count: { increment: 1 } },
    });
    if (post.user_id !== userId) {
      await this.prisma.notification.create({
        data: {
          user_id: post.user_id,
          type: 'forum',
          content: `Có bình luận mới trong bài viết "${post.title}"`,
        },
      });
    }
    return comment;
  }

  async markBest(userId: string, postId: string, commentId: string) {
    const post = await this.prisma.forumPost.findUniqueOrThrow({
      where: { id: postId },
    });
    if (post.user_id !== userId) {
      throw new ForbiddenException(
        'Chỉ tác giả bài viết mới chấm câu trả lời hay nhất',
      );
    }
    const comment = await this.prisma.forumComment.findUniqueOrThrow({
      where: { id: commentId },
    });
    if (comment.post_id !== postId) {
      throw new NotFoundException('Bình luận không thuộc bài viết này');
    }
    const isResolving = !post.best_comment_id;
    const result = await this.prisma.forumPost.update({
      where: { id: postId },
      data: {
        best_comment_id: commentId,
        is_resolved: true,
      },
      include: { best_comment: { include: { user: true } } },
    });
    await this.prisma.forumComment.updateMany({
      where: { post_id: postId },
      data: { is_best: false },
    });
    await this.prisma.forumComment.update({
      where: { id: commentId },
      data: { is_best: true },
    });
    if (isResolving && comment.user_id !== userId) {
      await this.prisma.notification.create({
        data: {
          user_id: comment.user_id,
          type: 'forum',
          content: `Câu trả lời của bạn được chọn là hay nhất trong "${post.title}"`,
        },
      });
    }
    return result;
  }

  async removeComment(
    userId: string,
    role: string,
    postId: string,
    commentId: string,
  ) {
    const comment = await this.prisma.forumComment.findUniqueOrThrow({
      where: { id: commentId },
    });
    const post = await this.prisma.forumPost.findUniqueOrThrow({
      where: { id: postId },
    });
    if (
      comment.user_id !== userId &&
      post.user_id !== userId &&
      role !== 'admin'
    ) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }
    await this.prisma.forumComment.delete({ where: { id: commentId } });
    await this.prisma.forumPost.update({
      where: { id: postId },
      data: { comment_count: { decrement: 1 } },
    });
    return { ok: true };
  }
}
