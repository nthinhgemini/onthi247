"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Submission } from "@/lib/types";
import { Badge, Card, Loading } from "@/components/ui";

function scoreColor(score: number | null | undefined) {
  if (score === null || score === undefined) return "text-gray-500";
  if (score >= 8) return "text-emerald-600";
  if (score >= 5) return "text-amber-600";
  return "text-red-600";
}

export default function SubmissionsPage() {
  const mineQuery = useQuery({
    queryKey: ["my-submissions"],
    queryFn: () => api<Submission[]>("/submissions"),
  });

  if (mineQuery.isLoading) return <Loading />;
  const submissions = mineQuery.data ?? [];

  if (submissions.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Lịch sử làm bài</h1>
        <Card className="p-10 text-center text-gray-500">
          <p className="mb-2 text-3xl">📝</p>
          <p className="font-medium text-gray-700">Chưa có bài làm nào</p>
          <p className="mt-1 text-sm">
            Hoàn thành một đề thi để xem kết quả và lời giải chi tiết tại đây.
          </p>
          <Link
            href="/exams"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            Chọn đề thi
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Lịch sử làm bài</h1>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Đề thi</th>
              <th className="px-5 py-3 font-medium">Môn</th>
              <th className="px-5 py-3 font-medium">Trạng thái</th>
              <th className="px-5 py-3 font-medium">Thời gian làm</th>
              <th className="px-5 py-3 font-medium">Điểm</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {submissions.map((sub) => (
              <tr key={sub.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium text-gray-900">
                  {sub.exam?.title}
                </td>
                <td className="px-5 py-4">
                  <Badge>{sub.exam?.subject?.name}</Badge>
                </td>
                <td className="px-5 py-4">
                  {sub.status === "submitted" ? (
                    <Badge color="green">Đã nộp</Badge>
                  ) : (
                    <Badge color="amber">Đang làm</Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600">
                  {new Date(sub.started_at).toLocaleString("vi-VN")}
                </td>
                <td
                  className={`px-5 py-4 text-lg font-bold ${scoreColor(sub.total_score)}`}
                >
                  {sub.total_score === null || sub.total_score === undefined
                    ? "—"
                    : sub.total_score.toFixed(2)}
                </td>
                <td className="px-5 py-4 text-right">
                  {sub.status === "submitted" ? (
                    <Link
                      href={`/submissions/${sub.id}`}
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Xem lại →
                    </Link>
                  ) : (
                    <Link
                      href={`/exams/${sub.exam_id}/take?submission=${sub.id}`}
                      className="font-medium text-amber-600 hover:text-amber-500"
                    >
                      Tiếp tục →
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}