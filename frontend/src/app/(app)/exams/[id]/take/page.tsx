"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Exam, Submission, SubmitResult } from "@/lib/types";
import { Button, Card, CountdownRing, Loading } from "@/components/ui";
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
      <div className="mt-4 space-y-2.5">
        {question.options.map((opt) => {
          const selected = value === opt.id;
          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3.5 transition-all ${
                selected
                  ? "border-indigo-500 bg-indigo-50/70 shadow-sm"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                checked={selected}
                onChange={() => onChange(opt.id)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-indigo-600"
              />
              <span
                className={`text-[15px] leading-relaxed sm:text-base ${
                  selected ? "font-medium text-gray-900" : "text-gray-800"
                }`}
              >
                <Latex text={opt.content} />
              </span>
            </label>
          );
        })}
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
        className="mt-4 w-full max-w-md rounded-xl border border-gray-300 px-4 py-3 text-base outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
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
      <div className="mt-4 space-y-3">
        {question.options.map((opt, idx) => (
          <div
            key={opt.id}
            className="rounded-xl border border-gray-200 bg-white p-3.5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] text-gray-800 sm:text-base">
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
  const [navOpen, setNavOpen] = useState(false);
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

  const goToQuestion = (idx: number) => {
    setCurrentIdx(idx);
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  };

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
  const totalSeconds = (examQuery.data.duration_minutes ?? 0) * 60;
  const answeredPct = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header: timer + progress */}
      <div className="sticky top-[65px] z-10 mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-card backdrop-blur">
        <div className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              Đang làm bài
            </p>
            <h1 className="truncate text-sm font-bold text-gray-900">
              {examQuery.data.title}
            </h1>
            <p className="mt-0.5 whitespace-nowrap text-xs text-gray-500">
              Đã làm{" "}
              <span className="font-semibold text-gray-800">
                {answeredCount}/{questions.length}
              </span>{" "}
              câu
              {remainingSec < 300 && remainingSec > 0 && (
                <span className="ml-1 font-semibold text-red-600">
                  · Sắp hết giờ
                </span>
              )}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            <CountdownRing
              remainingSeconds={remainingSec}
              totalSeconds={totalSeconds}
            />
            <Button
              onClick={submitNow}
              loading={submitting}
              variant={answeredCount === questions.length ? "success" : "primary"}
            >
              Nộp bài
            </Button>
          </div>
        </div>
        <div className="h-1 w-full bg-gray-100">
          <div
            className={`h-full transition-all duration-500 ${
              answeredCount === questions.length ? "bg-emerald-500" : "bg-indigo-500"
            }`}
            style={{ width: `${answeredPct}%` }}
          />
        </div>
        {error && (
          <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
        {/* Câu hỏi */}
        <Card className="p-5 sm:p-6">
          <div className="mb-3 flex items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {currentIdx + 1}
              </span>
              <span className="text-sm font-semibold text-gray-900">
                Câu hỏi
              </span>
              <span className="text-xs text-gray-400">
                {currentIdx + 1} / {questions.length}
              </span>
            </div>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
              {question.type === "single_choice"
                ? "Trắc nghiệm"
                : question.type === "short_answer"
                  ? "Điền đáp án"
                  : "Đúng/Sai"}
            </span>
          </div>
          <p className="text-base leading-relaxed text-gray-900 sm:text-lg sm:leading-8">
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

        {/* Bảng điều hướng câu (desktop) */}
        <div className="hidden lg:block">
          <Card className="p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Danh sách câu
            </h3>
            <QuestionGrid
              questions={questions}
              answers={answers}
              flagged={flagged}
              currentIdx={currentIdx}
              onSelect={setCurrentIdx}
            />
            <Legend />
          </Card>
        </div>
      </div>

      {/* Mobile: nút mở danh sách câu */}
      <button
        type="button"
        onClick={() => setNavOpen(true)}
        className="safe-b fixed inset-x-4 bottom-4 z-30 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 active:scale-95 md:hidden"
      >
        <span>🧭</span>
        Danh sách câu
        <span className="rounded-md bg-white/20 px-2 py-0.5 text-xs tabular-nums">
          {answeredCount}/{questions.length}
        </span>
      </button>

      {/* Mobile: bottom sheet */}
      {navOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setNavOpen(false)}
          />
          <div className="safe-b absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-300" />
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">
                Danh sách câu
              </h3>
              <span className="text-xs text-gray-500">
                {answeredCount}/{questions.length} đã làm
              </span>
            </div>
            <QuestionGrid
              questions={questions}
              answers={answers}
              flagged={flagged}
              currentIdx={currentIdx}
              onSelect={goToQuestion}
            />
            <Legend />
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              className="mt-4 w-full rounded-xl border border-gray-300 py-2.5 text-sm font-semibold text-gray-700"
            >
              Tiếp tục làm bài
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionGrid({
  questions,
  answers,
  flagged,
  currentIdx,
  onSelect,
}: {
  questions: NonNullable<Exam["examQuestions"]>[number]["question"][];
  answers: AnswerState;
  flagged: string[];
  currentIdx: number;
  onSelect: (idx: number) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-6">
      {questions.map((q, idx) => {
        const answered = !!answers[q.id];
        const isCurrent = idx === currentIdx;
        const isFlagged = flagged.includes(q.id);
        return (
          <button
            key={q.id}
            onClick={() => onSelect(idx)}
            className={`relative flex h-10 w-full items-center justify-center rounded-lg text-xs font-bold transition-colors ${
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
  );
}

function Legend() {
  return (
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
  );
}