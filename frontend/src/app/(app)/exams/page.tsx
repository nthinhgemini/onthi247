"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Exam, Subject } from "@/lib/types";
import { Badge, Card, Loading } from "@/components/ui";

export default function ExamsPage() {
  const searchParams = useSearchParams();
  const subjectFilter = searchParams.get("subject") ?? "";

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () => api<Subject[]>("/subjects"),
  });

  const examsQuery = useQuery({
    queryKey: ["exams", subjectFilter],
    queryFn: () =>
      api<Exam[]>("/exams").then((list) =>
        subjectFilter ? list.filter((e) => e.subject_id === subjectFilter) : list
      ),
  });

  if (subjectsQuery.isLoading || examsQuery.isLoading) return <Loading />;
  const subjects = subjectsQuery.data ?? [];
  const exams = examsQuery.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kho đề thi</h1>
        <Link
          href="/exams/new"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          + Tạo đề thi
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/exams"
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            !subjectFilter
              ? "bg-indigo-600 text-white"
              : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
          }`}
        >
          Tất cả
        </Link>
        {subjects.map((s) => (
          <Link
            key={s.id}
            href={`/exams?subject=${s.id}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              subjectFilter === s.id
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 ring-1 ring-gray-300 hover:bg-gray-50"
            }`}
          >
            {s.name}
          </Link>
        ))}
      </div>

      {exams.length === 0 ? (
        <Card className="p-10 text-center text-gray-500">
          Chưa có đề thi nào trong bộ lọc này.
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => (
            <Link
              key={exam.id}
              href={`/exams/${exam.id}`}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-2 flex items-center gap-2">
                <Badge>{exam.subject?.name}</Badge>
                <Badge color="gray">
                  {exam.examQuestions?.length ?? exam._count?.examQuestions ?? 0} câu
                </Badge>
              </div>
              <h3 className="font-semibold leading-snug text-gray-900">
                {exam.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                {exam.duration_minutes} phút ·{" "}
                {new Date(exam.created_at).toLocaleDateString("vi-VN")} ·{" "}
                {exam.creator?.full_name ?? "Hệ thống"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}