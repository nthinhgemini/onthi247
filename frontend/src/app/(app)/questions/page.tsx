"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Chapter, Difficulty, Question, Subject } from "@/lib/types";
import { Card, DifficultyBadge, Loading } from "@/components/ui";
import Latex from "@/components/Latex";

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "nhan_biet", label: "Nhận biết" },
  { value: "thong_hieu", label: "Thông hiểu" },
  { value: "van_dung", label: "Vận dụng" },
  { value: "van_dung_cao", label: "Vận dụng cao" },
];

export default function QuestionsPage() {
  const [subjectFilter, setSubjectFilter] = useState("");
  const [chapterFilter, setChapterFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () => api<Subject[]>("/subjects"),
  });

  const chaptersQuery = useQuery({
    queryKey: ["chapters", subjectFilter],
    queryFn: () =>
      subjectFilter
        ? api<Chapter[]>(`/subjects/${subjectFilter}/chapters`)
        : Promise.resolve([]),
    enabled: !!subjectFilter,
  });

  const questionsQuery = useQuery({
    queryKey: ["questions", subjectFilter, chapterFilter, difficultyFilter, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams({ pageSize: "50" });
      if (subjectFilter) params.set("subject", subjectFilter);
      if (chapterFilter) params.set("chapter", chapterFilter);
      if (difficultyFilter) params.set("difficulty", difficultyFilter);
      if (statusFilter) params.set("status", statusFilter);
      return api<{ items: Question[]; total: number }>(
        `/questions?${params.toString()}`
      );
    },
  });

  const subjects = subjectsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>
        <Link
          href="/questions/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Câu hỏi mới
        </Link>
      </div>

      {/* Filters */}
      <Card className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={subjectFilter}
          onChange={(e) => {
            setSubjectFilter(e.target.value);
            setChapterFilter("");
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả môn</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={chapterFilter}
          onChange={(e) => setChapterFilter(e.target.value)}
          disabled={!subjectFilter}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
        >
          <option value="">Tất cả chuyên đề</option>
          {(chaptersQuery.data ?? []).map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả mức độ</option>
          {DIFFICULTIES.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="published">Công khai</option>
          <option value="draft">Bản nháp</option>
          <option value="rejected">Từ chối</option>
        </select>
      </Card>

      {questionsQuery.isLoading ? (
        <Loading />
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            {questionsQuery.data?.total ?? 0} câu hỏi
          </p>
          {(questionsQuery.data?.items ?? []).map((q) => (
            <Card key={q.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyBadge difficulty={q.difficulty} />
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                    {q.type === "single_choice"
                      ? "Trắc nghiệm"
                      : q.type === "short_answer"
                        ? "Điền đáp án"
                        : "Đúng/Sai"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {q.chapter?.subject?.name} · {q.chapter?.name}
                  </span>
                </div>
                <Link
                  href={`/questions/${q.id}/edit`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Sửa →
                </Link>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-gray-900">
                <Latex text={q.content} />
              </p>
            </Card>
          ))}
          {(questionsQuery.data?.items ?? []).length === 0 && (
            <Card className="p-10 text-center text-gray-500">
              Không có câu hỏi nào phù hợp.
            </Card>
          )}
        </div>
      )}
    </div>
  );
}