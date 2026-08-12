"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Exam } from "@/lib/types";
import { Badge, Button, Card, DifficultyBadge, Loading } from "@/components/ui";
import Latex from "@/components/Latex";

export default function ExamDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const examQuery = useQuery({
    queryKey: ["exam", params.id],
    queryFn: () => api<Exam>(`/exams/${params.id}`),
  });

  if (examQuery.isLoading) return <Loading />;
  if (examQuery.isError) {
    return (
      <Card className="p-8 text-center">
        <p className="text-red-600">Không thể tải đề thi.</p>
      </Card>
    );
  }

  const exam = examQuery.data!;
  const questions = exam.examQuestions ?? [];

  const startExam = async () => {
    setStarting(true);
    setError("");
    try {
      const submission = await api<{ id: string }>(
        `/submissions/exams/${exam.id}/start`,
        { method: "POST" }
      );
      router.push(`/exams/${exam.id}/take?submission=${submission.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi bắt đầu làm bài");
      setStarting(false);
    }
  };

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Không thể sao chép liên kết");
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/exams" className="hover:text-indigo-600">
          Kho đề thi
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{exam.title}</span>
      </nav>

      <Card className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{exam.title}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge>{exam.subject?.name}</Badge>
              <Badge color="gray">{questions.length} câu</Badge>
              <Badge color="blue">{exam.duration_minutes} phút</Badge>
              <Badge color="amber">Thang điểm {exam.total_score}</Badge>
            </div>
            <p className="mt-3 text-sm text-gray-500">
              Người tạo: {exam.creator?.full_name ?? "Hệ thống"} ·{" "}
              {new Date(exam.created_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button onClick={startExam} loading={starting} className="sm:w-48">
            Bắt đầu làm bài
          </Button>
          <Button variant="secondary" onClick={share}>
            {copied ? "✓ Đã sao chép liên kết" : "🔗 Chia sẻ đề"}
          </Button>
        </div>
        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Cấu trúc đề thi
        </h2>
        <Card className="divide-y divide-gray-100">
          {questions.map((eq, idx) => (
            <div key={eq.id} className="p-4">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-500">
                  Câu {idx + 1}
                </span>
                <DifficultyBadge difficulty={eq.question.difficulty} />
              </div>
              <p className="text-sm text-gray-800">
                <Latex text={eq.question.content} />
              </p>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}