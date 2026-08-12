"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ForumPost } from "@/lib/types";
import { Badge, Button, Card, Loading } from "@/components/ui";
import Latex from "@/components/Latex";
import { useAuth } from "@/lib/auth";

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "vừa xong";
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  return `${Math.floor(s / 86400)} ngày trước`;
}

export default function ForumDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const postQuery = useQuery({
    queryKey: ["forum", "post", params.id],
    queryFn: () => api<ForumPost>(`/forum/posts/${params.id}`),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["forum", "post", params.id] });
    queryClient.invalidateQueries({ queryKey: ["forum", "posts"] });
  };

  const voteMutation = useMutation({
    mutationFn: () => api(`/forum/posts/${params.id}/vote`, { method: "POST" }),
    onSuccess: invalidate,
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      api(`/forum/posts/${params.id}/comments`, {
        method: "POST",
        body: { content: comment },
      }),
    onSuccess: () => {
      setComment("");
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const bestMutation = useMutation({
    mutationFn: (commentId: string) =>
      api(`/forum/posts/${params.id}/best/${commentId}`, { method: "PATCH" }),
    onSuccess: () => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) =>
      api(`/forum/posts/${params.id}/comments/${commentId}`, {
        method: "DELETE",
      }),
    onSuccess: invalidate,
  });

  if (postQuery.isLoading) return <Loading />;
  if (postQuery.isError || !postQuery.data) {
    return (
      <Card className="p-8 text-center text-gray-500">
        Không tìm thấy bài viết.
      </Card>
    );
  }

  const post = postQuery.data;
  const isAuthor = user?.id === post.user_id;
  const comments = post.comments ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-2">
          {post.is_resolved && (
            <Badge color="green">✓ Đã giải đáp</Badge>
          )}
          {post.subject && <Badge color="indigo">{post.subject.name}</Badge>}
        </div>
        <h1 className="mt-3 text-xl font-bold text-gray-900">
          <Latex text={post.title} />
        </h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-gray-500">
          <span className="font-medium text-gray-700">
            {post.user.full_name}
          </span>
          <span>· {timeAgo(post.created_at)}</span>
          <span>· 👁 {post.view_count} lượt xem</span>
        </div>
        <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-relaxed text-gray-800">
          <Latex text={post.content} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button
            variant={post.voted ? "success" : "secondary"}
            onClick={() => voteMutation.mutate()}
            disabled={voteMutation.isPending}
          >
            👍 {post.vote_count} {post.voted ? "Đã thích" : "Thích"}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {comments.length} trả lời
        </h2>
        <div className="mt-4 space-y-4">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">
              Chưa có câu trả lời. Hãy là người đầu tiên giúp đỡ!
            </p>
          ) : (
            comments.map((c) => {
              const isBest = c.is_best;
              return (
                <div
                  key={c.id}
                  className={`rounded-xl border p-4 ${
                    isBest
                      ? "border-emerald-200 bg-emerald-50/60"
                      : "border-gray-100 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-gray-800">
                        {c.user.full_name}
                      </span>
                      <span className="text-gray-400">
                        · {timeAgo(c.created_at)}
                      </span>
                      {isBest && (
                        <Badge color="green">★ Câu trả lời hay nhất</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAuthor && !isBest && (
                        <Button
                          variant="ghost"
                          className="text-xs"
                          onClick={() => bestMutation.mutate(c.id)}
                        >
                          Chọn là hay nhất
                        </Button>
                      )}
                      {(user?.id === c.user_id || isAuthor || user?.role === "admin") && (
                        <Button
                          variant="ghost"
                          className="text-xs text-red-600 hover:bg-red-50"
                          onClick={() => deleteCommentMutation.mutate(c.id)}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-gray-700">
                    <Latex text={c.content} />
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="mt-6 border-t border-gray-100 pt-4">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Viết câu trả lời của bạn..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <div className="mt-3 flex justify-end">
            <Button
              onClick={() => commentMutation.mutate()}
              loading={commentMutation.isPending}
              disabled={!comment.trim()}
            >
              Trả lời
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button variant="secondary" onClick={() => router.push("/forum")}>
          ← Quay lại diễn đàn
        </Button>
      </div>
    </div>
  );
}
