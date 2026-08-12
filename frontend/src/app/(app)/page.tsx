"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import type { Exam, StatsOverview, Subject } from "@/lib/types";
import { Badge, Card, Loading } from "@/components/ui";

function SubjectCard({ subject }: { subject: Subject }) {
  return (
    <Link
      href={`/exams?subject=${subject.id}`}
      className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-lg font-bold text-indigo-700">
        {subject.name.charAt(0)}
      </div>
      <h3 className="font-semibold text-gray-900">{subject.name}</h3>
      <p className="mt-1 text-xs text-gray-500">
        {subject._count?.chapters ?? 0} chuyên đề ·{" "}
        {subject._count?.exams ?? 0} đề thi
      </p>
    </Link>
  );
}

function StatsStrip() {
  const overviewQuery = useQuery({
    queryKey: ["stats", "overview"],
    queryFn: () => api<StatsOverview>("/stats/me/overview"),
    staleTime: 30000,
  });
  const s = overviewQuery.data;

  const items = [
    { label: "Cấp độ", value: s?.level ?? "—", icon: "🎖️" },
    { label: "XP", value: s ? s.xp.toLocaleString("vi-VN") : "—", icon: "⚡" },
    { label: "Chuỗi ngày", value: s ? `${s.streak} ngày` : "—", icon: "🔥" },
    { label: "Điểm TB", value: s ? s.avg_score.toFixed(1) : "—", icon: "🎯" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {items.map((i) => (
        <Link
          key={i.label}
          href="/stats"
          className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:border-indigo-200"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-lg">
            {i.icon}
          </span>
          <div>
            <p className="text-[11px] font-medium text-gray-500">{i.label}</p>
            <p className="text-sm font-bold text-gray-900">{i.value}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () => api<Subject[]>("/subjects"),
  });

  const examsQuery = useQuery({
    queryKey: ["exams"],
    queryFn: () => api<Exam[]>("/exams"),
  });

  if (subjectsQuery.isLoading || examsQuery.isLoading) {
    return <Loading />;
  }

  const subjects = subjectsQuery.data ?? [];
  const exams = examsQuery.data ?? [];
  const recentExams = exams.slice(0, 5);

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-gray-900">
          Xin chào, {user?.full_name ?? "bạn"} 👋
        </h1>
        <p className="mt-1 text-gray-600">
          Hôm nay bạn muốn ôn luyện môn nào?
        </p>
      </section>

      <StatsStrip />

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Môn học</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {subjects.map((s) => (
            <SubjectCard key={s.id} subject={s} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Đề thi mới nhất</h2>
          <Link
            href="/exams"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Xem tất cả →
          </Link>
        </div>
        {recentExams.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">
            Chưa có đề thi nào.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recentExams.map((exam) => (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}`}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Badge>{exam.subject?.name}</Badge>
                  <Badge color="gray">{exam.examQuestions?.length ?? exam._count?.examQuestions ?? 0} câu</Badge>
                </div>
                <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                <p className="mt-1 text-xs text-gray-500">
                  {exam.duration_minutes} phút ·{" "}
                  {new Date(exam.created_at).toLocaleDateString("vi-VN")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {user?.role === "teacher" || user?.role === "admin" ? (
        <section className="flex gap-3">
          <Link
            href="/exams/new"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Tạo đề thi
          </Link>
          <Link
            href="/questions"
            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Ngân hàng câu hỏi
          </Link>
        </section>
      ) : null}
    </div>
  );
}