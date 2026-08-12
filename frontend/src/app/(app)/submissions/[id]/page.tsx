"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ReviewData } from "@/lib/types";
import { Badge, Card, Loading } from "@/components/ui";
import Latex from "@/components/Latex";

export default function ReviewPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<"all" | "correct" | "wrong" | "unanswered">("all");

  const reviewQuery = useQuery({
    queryKey: ["review", params.id],
    queryFn: () => api<ReviewData>(`/submissions/${params.id}/review`),
  });

  if (reviewQuery.isLoading) return <Loading />;
  if (reviewQuery.isError || !reviewQuery.data) {
    return (
      <Card className="p-8 text-center text-red-600">
        Không thể tải kết quả bài làm.
      </Card>
    );
  }

  const { submission, exam, questions } = reviewQuery.data;
  const score = Number(searchParams.get("score") ?? submission.total_score ?? 0);
  const xpEarned = Number(searchParams.get("xp") ?? submission.xp_awarded ?? 0);
  const earnedBadges = (searchParams.get("badges") ?? "").split(",").filter(Boolean);
  const correct = questions.filter((q) => q.is_correct === true).length;
  const wrong = questions.filter((q) => q.is_correct === false).length;
  const unanswered = questions.filter((q) => q.user_answer === null || q.user_answer === "").length;

  const filtered =
    filter === "all"
      ? questions
      : filter === "correct"
        ? questions.filter((q) => q.is_correct === true)
        : filter === "wrong"
          ? questions.filter((q) => q.is_correct === false)
          : questions.filter((q) => q.user_answer === null || q.user_answer === "");

  const filterTabs = [
    { key: "all" as const, label: `Tất cả (${questions.length})` },
    { key: "correct" as const, label: `Đúng (${correct})` },
    { key: "wrong" as const, label: `Sai (${wrong})` },
    { key: "unanswered" as const, label: `Bỏ trống (${unanswered})` },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 p-6 text-white">
          <p className="text-sm text-indigo-100">{exam.title}</p>
          <div className="mt-2 flex items-end gap-4">
            <div>
              <p className="text-4xl font-bold">{score.toFixed(2)}</p>
              <p className="text-sm text-indigo-100">/ 10 điểm</p>
            </div>
            <div className="pb-1 text-sm">
              <p className="font-medium">
                {correct}/{questions.length} câu đúng
              </p>
              <p className="text-indigo-100">
                {wrong} sai · {unanswered} bỏ trống
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 bg-emerald-50/60 px-6 py-3">
          <div className="flex flex-wrap gap-2">
            <Badge color="green">+{xpEarned} XP</Badge>
            {earnedBadges.map((b) => (
              <Badge key={b} color="amber">
                🏅 {b}
              </Badge>
            ))}
            {earnedBadges.length === 0 && xpEarned === 0 && (
              <span className="text-xs text-gray-600">
                Làm thêm bài để tích lũy XP!
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  filter === tab.key
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link
            href="/exams"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            ← Kho đề thi
          </Link>
        </div>
      </Card>

      <div className="space-y-4">
        {filtered.map((item, idx) => {
          const isCorrect = item.is_correct === true;
          const isBlank = item.user_answer === null || item.user_answer === "";
          const correctOption = item.question.options.find(
            (o) => o.is_correct
          );
          return (
            <Card key={item.question.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${
                      isCorrect
                        ? "bg-emerald-500"
                        : isBlank
                          ? "bg-gray-400"
                          : "bg-red-500"
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <Badge color={isCorrect ? "green" : "red"}>
                    {isCorrect ? "Đúng" : isBlank ? "Bỏ trống" : "Sai"}
                  </Badge>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-gray-900">
                <Latex text={item.question.content} />
              </p>

              {item.question.type === "single_choice" && (
                <div className="mt-3 space-y-1.5">
                  {item.question.options.map((opt) => {
                    const isUserPick = item.user_answer === opt.id;
                    const isCorrectOption = opt.is_correct;
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                          isCorrectOption
                            ? "bg-emerald-50 text-emerald-800"
                            : isUserPick
                              ? "bg-red-50 text-red-800"
                              : "text-gray-600"
                        }`}
                      >
                        <span className="font-semibold">
                          {String.fromCharCode(65 + opt.order_index)}.
                        </span>
                        <Latex text={opt.content} />
                        {isCorrectOption && (
                          <span className="ml-auto text-xs font-semibold">
                            ✓ Đáp án đúng
                          </span>
                        )}
                        {isUserPick && !isCorrectOption && (
                          <span className="ml-auto text-xs font-semibold">
                            ✗ Bạn chọn
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {item.question.type === "short_answer" && (
                <div className="mt-3 space-y-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
                  <p>
                    <span className="font-semibold">Bạn trả lời:</span>{" "}
                    {item.user_answer || "—"}
                  </p>
                  <p className="text-emerald-700">
                    <span className="font-semibold">Đáp án đúng:</span>{" "}
                    <Latex text={correctOption?.content ?? ""} />
                  </p>
                </div>
              )}

              {item.question.type === "multi_true_false" && (
                <div className="mt-3 space-y-1.5">
                  {item.question.options.map((opt, idx) => {
                    const userParts = (item.user_answer || "").split("|");
                    const userChoice = userParts[idx];
                    const isUserRight = userChoice === String(opt.is_correct);
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                          isUserRight
                            ? "bg-emerald-50 text-emerald-800"
                            : userChoice
                              ? "bg-red-50 text-red-800"
                              : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        <span className="w-5 shrink-0 font-semibold">
                          {String.fromCharCode(97 + idx)}).
                        </span>
                        <Latex text={opt.content} />
                        <span className="ml-auto shrink-0 text-xs font-semibold">
                          {userChoice ? (
                            <>Bạn: {userChoice === "true" ? "Đúng" : "Sai"} · </>
                          ) : (
                            "Chưa trả lời · "
                          )}
                          Đáp án: {opt.is_correct ? "Đúng" : "Sai"}
                        </span>
                      </div>
                    );
                  })}
                  {item.earned_score !== null && (
                    <p className="pt-1 text-xs font-semibold text-indigo-700">
                      Điểm câu này: {item.earned_score} / {item.score_weight}
                    </p>
                  )}
                </div>
              )}

              {item.question.explanation && (
                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
                  <span className="font-semibold">Giải thích: </span>
                  <Latex text={item.question.explanation} />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}