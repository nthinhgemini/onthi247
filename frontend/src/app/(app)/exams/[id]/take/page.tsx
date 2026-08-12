"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Exam, Submission, SubmitResult } from "@/lib/types";
import { Button, Card, Loading } from "@/components/ui";
import Latex from "@/components/Latex";

type AnswerState = Record<string, string>;

function AnswerInput({
  question,
  value,
  onChange,
}: {
  question: NonNullable<Exam["examQuestions"]>[number]["question"];
  value: string;
  onChange: (v: string) => void;
}) {
  if (question.type === "single_choice") {
    return (
      <div className="mt-3 space-y-2">
        {question.options.map((opt) => (
          <label
            key={opt.id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
              value === opt.id
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name={question.id}
              checked={value === opt.id}
              onChange={() => onChange(opt.id)}
              className="mt-1 h-4 w-4 accent-indigo-600"
            />
            <span className="text-sm text-gray-800">
              <Latex text={opt.content} />
            </span>
          </label>
        ))}
      </div>
    );
  }

  if (question.type === "short_answer") {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập đáp án..."
        className="mt-3 w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
      />
    );
  }

  if (question.type === "multi_true_false") {
    const parts = (value || "??|??|??|??").split("|");
    const setPart = (idx: number, v: "true" | "false") => {
      const next = [...parts];
      next[idx] = v;
      onChange(next.join("|"));
    };
    const labels = ["a", "b", "c", "d"];
    return (
      <div className="mt-3 space-y-3">
        {question.options.map((opt, idx) => (
          <div
            key={opt.id}
            className="rounded-xl border border-gray-200 bg-white p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-gray-800">
                <span className="mr-1 font-bold text-indigo-600">
                  {labels[idx]}).
                </span>
                <Latex text={opt.content} />
              </p>
              <div className="flex shrink-0 gap-2">
                {(
                  [
                    ["true", "Đúng"],
                    ["false", "Sai"],
                  ] as const
                ).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPart(idx, val)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      parts[idx] === val
                        ? val === "true"
                          ? "bg-emerald-500 text-white"
                          : "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-500">
          Chọn Đúng/Sai cho từng phát biểu.
        </p>
      </div>
    );
  }

  return null;
}

export default function TakeExamPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const submissionId = searchParams.get("submission");

  const [answers, setAnswers] = useState<AnswerState>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const answersRef = useRef<AnswerState>({});
  const flaggedRef = useRef<string[]>([]);
  const submittedRef = useRef(false);

  const examQuery = useQuery({
    queryKey: ["exam", params.id],
    queryFn: () => api<Exam>(`/exams/${params.id}`),
  });

  const submissionQuery = useQuery({
    queryKey: ["submission", submissionId],
    queryFn: () => api<Submission>(`/submissions/${submissionId}`),
    enabled: !!submissionId,
  });

  const questions = useMemo(
    () => (examQuery.data?.examQuestions ?? []).map((eq) => eq.question),
    [examQuery.data]
  );

  const save = useCallback(
    async (data: AnswerState, flags: string[]) => {
      if (!submissionId || submittedRef.current) return;
      const payload = Object.fromEntries(
        Object.entries(data).map(([qid, answer]) => [qid, [{ answer }]])
      );
      try {
        await api(`/submissions/${submissionId}/save`, {
          method: "POST",
          body: { answers: payload, flagged: flags },
        });
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    },
    [submissionId]
  );

  const submitNow = useCallback(async () => {
    if (submittedRef.current || !submissionId) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const payload = Object.fromEntries(
        Object.entries(answersRef.current).map(([qid, answer]) => [
          qid,
          [{ answer }],
        ])
      );
      const result = await api<SubmitResult>(
        `/submissions/${submissionId}/submit`,
        { method: "POST", body: { answers: payload, flagged: flaggedRef.current } }
      );
      const badges = result.earned_badges?.map((b) => b.name).join(",") ?? "";
      router.replace(
        `/submissions/${result.id}?score=${result.total_score}&xp=${result.xp_earned}&badges=${encodeURIComponent(badges)}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nộp bài thất bại");
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [submissionId, router]);

  // Countdown: tick mỗi giây, tính thời gian còn lại từ started_at
  const deadline = useMemo(() => {
    if (examQuery.data && submissionQuery.data) {
      const durationMs = examQuery.data.duration_minutes * 60000;
      return (
        new Date(submissionQuery.data.started_at).getTime() + durationMs
      );
    }
    return 0;
  }, [examQuery.data, submissionQuery.data]);

  const remainingSec = deadline ? Math.max(0, Math.floor((deadline - now) / 1000)) : 0;

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Hết giờ → tự nộp bài
  useEffect(() => {
    if (deadline > 0 && remainingSec <= 0 && !submittedRef.current) {
      submitNow();
    }
  }, [deadline, remainingSec, submitNow]);

  // Auto-save mỗi 20 giây
  useEffect(() => {
    const timer = setInterval(() => {
      save(answersRef.current, flaggedRef.current);
    }, 20000);
    return () => clearInterval(timer);
  }, [save]);

  const setAnswer = (qid: string, v: string) => {
    const next = { ...answers, [qid]: v };
    setAnswers(next);
    answersRef.current = next;
  };

  const toggleFlag = (qid: string) => {
    const next = flagged.includes(qid)
      ? flagged.filter((id) => id !== qid)
      : [...flagged, qid];
    setFlagged(next);
    flaggedRef.current = next;
    if (submissionId && !submittedRef.current) {
      save(answersRef.current, next);
    }
  };

  // Khôi phục trạng thái đánh dấu khi quay lại bài làm dở
  const [serverFlags, setServerFlags] = useState<string[] | null>(null);
  const submissionFlags = submissionQuery.data?.flagged ?? null;
  if (submissionFlags !== null && submissionFlags !== serverFlags) {
    setServerFlags(submissionFlags);
    if (submissionFlags.length) {
      setFlagged(submissionFlags);
    }
  }

  useEffect(() => {
    flaggedRef.current = flagged;
  }, [flagged]);

  if (examQuery.isLoading || submissionQuery.isLoading) return <Loading />;
  if (!examQuery.data || !submissionQuery.data) {
    return (
      <Card className="p-8 text-center">
        <p className="font-medium text-gray-700">
          Không có phiên làm bài đang hoạt động.
        </p>
        <Button
          variant="primary"
          className="mt-4"
          onClick={() => router.push(`/exams/${params.id}`)}
        >
          Quay lại đề thi
        </Button>
      </Card>
    );
  }

  const question = questions[currentIdx];
  const answeredCount = Object.values(answers).filter((v) => v).length;
  const mm = Math.floor(remainingSec / 60);
  const ss = remainingSec % 60;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header: timer + progress */}
      <div className="sticky top-[65px] z-10 mb-6 rounded-2xl border border-gray-200 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-bold text-gray-900">
              {examQuery.data.title}
            </h1>
            <p className="text-xs text-gray-500">
              Đã làm {answeredCount}/{questions.length} câu
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`rounded-xl px-4 py-2 font-mono text-lg font-bold tabular-nums ${
                remainingSec < 300
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
            </div>
            <Button
              onClick={submitNow}
              loading={submitting}
              variant={answeredCount === questions.length ? "success" : "danger"}
            >
              Nộp bài
            </Button>
          </div>
        </div>
        {error && (
          <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        {/* Câu hỏi */}
        <Card className="p-6">
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
              {currentIdx + 1}
            </span>
            <span className="text-xs text-gray-500">
              {question.type === "single_choice"
                ? "Trắc nghiệm"
                : question.type === "short_answer"
                  ? "Điền đáp án"
                  : "Đúng/Sai"}
            </span>
          </div>
          <p className="text-base leading-relaxed text-gray-900">
            <Latex text={question.content} />
          </p>
          {question.image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={question.image_url}
              alt="Hình minh họa"
              className="mt-3 max-h-64 rounded-lg"
            />
          )}
          <div className="mt-3">
            <button
              type="button"
              onClick={() => toggleFlag(question.id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                flagged.includes(question.id)
                  ? "bg-amber-100 text-amber-700 ring-1 ring-amber-300"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                fill={flagged.includes(question.id) ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z"
                />
              </svg>
              {flagged.includes(question.id)
                ? "Đang đánh dấu — xem lại"
                : "Đánh dấu để xem lại"}
            </button>
          </div>
          <AnswerInput
            question={question}
            value={answers[question.id] ?? ""}
            onChange={(v) => setAnswer(question.id, v)}
          />
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="secondary"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
            >
              ← Câu trước
            </Button>
            {currentIdx < questions.length - 1 ? (
              <Button onClick={() => setCurrentIdx((i) => i + 1)}>
                Câu sau →
              </Button>
            ) : (
              <Button onClick={submitNow} loading={submitting} variant="success">
                Hoàn thành & nộp bài
              </Button>
            )}
          </div>
        </Card>

        {/* Bảng điều hướng câu */}
        <div>
          <Card className="p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Danh sách câu
            </h3>
            <div className="grid grid-cols-6 gap-2">
              {questions.map((q, idx) => {
                const answered = !!answers[q.id];
                const isCurrent = idx === currentIdx;
                const isFlagged = flagged.includes(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`relative flex h-9 w-full items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                      isCurrent
                        ? "ring-2 ring-indigo-500"
                        : answered
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1.5 text-xs text-gray-600">
              <p className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded bg-emerald-100" />
                Đã trả lời
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded bg-gray-100" />
                Chưa trả lời
              </p>
              <p className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
                Đánh dấu xem lại
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}