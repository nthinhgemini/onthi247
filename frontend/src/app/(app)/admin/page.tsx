"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminOverview } from "@/lib/types";
import { Badge, Card, Loading } from "@/components/ui";

function StatCard({
  label,
  value,
  href,
  accent = "indigo",
}: {
  label: string;
  value: number | string;
  href?: string;
  accent?: "indigo" | "green" | "amber" | "red" | "blue";
}) {
  const accents: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };
  const content = (
    <Card className="p-5 transition-colors hover:border-indigo-200">
      <p
        className={`inline-flex items-center rounded-lg px-2 py-1 text-xs font-bold ${accents[accent]}`}
      >
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
    </Card>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default function AdminOverviewPage() {
  const overviewQuery = useQuery({
    queryKey: ["admin", "overview"],
    queryFn: () => api<AdminOverview>("/admin/overview"),
  });

  if (overviewQuery.isLoading) return <Loading />;
  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <Card className="p-8 text-center text-red-600">
        Không thể tải dữ liệu admin.
      </Card>
    );
  }

  const { counts, recentUsers, recentQuestions } = overviewQuery.data;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển Admin</h1>
        <p className="mt-1 text-gray-600">
          Tổng quan hoạt động của hệ thống Ôn thi 2029.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Người dùng" value={counts.users} href="/admin/users" accent="indigo" />
        <StatCard label="Giáo viên" value={counts.teachers} href="/admin/users" accent="blue" />
        <StatCard label="Câu hỏi" value={counts.questions} href="/admin/questions" accent="green" />
        <StatCard label="Câu hỏi chờ duyệt" value={counts.pendingQuestions} href="/admin/questions" accent="amber" />
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Đề thi" value={counts.exams} accent="indigo" />
        <StatCard label="Câu hỏi đã xuất bản" value={counts.publishedQuestions} accent="green" />
        <StatCard label="Bài đã nộp" value={counts.submissions} accent="blue" />
        <StatCard label="Bài nộp hôm nay" value={counts.submissionsToday} accent="amber" />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Người dùng mới</h2>
            <Link href="/admin/users" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Xem tất cả →
            </Link>
          </div>
          <ul className="divide-y divide-gray-100">
            {recentUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{u.full_name}</p>
                  <p className="text-xs text-gray-500">{u.email}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge color={u.role === "admin" ? "red" : u.role === "teacher" ? "blue" : "gray"}>
                    {u.role === "admin" ? "Admin" : u.role === "teacher" ? "Giáo viên" : "Học viên"}
                  </Badge>
                  <Badge color={u.is_active ? "green" : "red"}>
                    {u.is_active ? "Hoạt động" : "Bị khóa"}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Câu hỏi chờ duyệt</h2>
            <Link href="/admin/questions" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Duyệt →
            </Link>
          </div>
          {recentQuestions.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              Không có câu hỏi nào chờ duyệt.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recentQuestions.map((q) => (
                <li key={q.id} className="py-3">
                  <p className="truncate text-sm text-gray-900">{q.content}</p>
                  <p className="text-xs text-gray-500">
                    {q.chapter?.subject?.name} · {q.chapter?.name} · {q.creator?.full_name}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>
    </div>
  );
}