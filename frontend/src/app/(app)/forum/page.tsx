"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ForumPost, Paged, Subject } from "@/lib/types";
import { Button, Card, Loading } from "@/components/ui";
import Latex from "@/components/Latex";

function timeAgo(date: string) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "vừa xong";
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  return `${Math.floor(s / 86400)} ngày trước`;
}

export default function ForumPage() {
  const [subjectId, setSubjectId] = useState("");
  const [sort, setSort] = useState<"recent" | "popular">("recent");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () => api<Subject[]>("/subjects"),
  });

  const postsQuery = useQuery({
    queryKey: ["forum", "posts", subjectId, sort, query, 1],
    queryFn: () =>
      api<Paged<ForumPost>>(
        `/forum/posts?page=1&pageSize=20&sort=${sort}${
          subjectId ? `&subject_id=${subjectId}` : ""
        }${query ? `&search=${encodeURIComponent(query)}` : ""}`
      ),
  });

  const posts = postsQuery.data?.items ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Diễn đàn hỏi đáp</h1>
          <p className="text-sm text-gray-500">
            Hỏi - đáp kiến thức cùng giáo viên và bạn bè
          </p>
        </div>
        <Link href="/forum/new">
          <Button>+ Đặt câu hỏi</Button>
        </Link>
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả môn</option>
          {(subjectsQuery.data ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "recent" | "popular")}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="recent">Mới nhất</option>
          <option value="popular">Nổi bật</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setQuery(search);
          }}
          placeholder="Tìm câu hỏi..."
          className="min-w-40 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <Button variant="secondary" onClick={() => setQuery(search)}>
          Tìm
        </Button>
      </Card>

      {postsQuery.isLoading ? (
        <Loading />
      ) : posts.length === 0 ? (
        <Card className="p-8 text-center text-gray-500">
          Chưa có câu hỏi nào. Hãy đặt câu hỏi đầu tiên!
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/forum/${post.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {post.is_resolved && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          ✓ Đã giải
                        </span>
                      )}
                      {post.subject && (
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-600">
                          {post.subject.name}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-1.5 line-clamp-2 font-semibold text-gray-900">
                      <Latex text={post.title} />
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-500">
                      <Latex text={post.content} />
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      <span className="font-medium text-gray-600">
                        {post.user.full_name}
                      </span>
                      <span>{timeAgo(post.created_at)}</span>
                      <span>👁 {post.view_count}</span>
                      <span>👍 {post.vote_count}</span>
                      <span>💬 {post.comment_count}</span>
                    </div>
                  </div>
                  <div className="shrink-0 text-center">
                    <div className="text-lg font-bold text-indigo-600">
                      {post.comment_count}
                    </div>
                    <div className="text-[11px] text-gray-400">trả lời</div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
