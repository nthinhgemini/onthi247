"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Chapter, Difficulty, Question, QuestionType, Subject } from "@/lib/types";
import { Button, Card, Loading } from "@/components/ui";
import Latex from "@/components/Latex";

interface OptionForm {
  content: string;
  is_correct: boolean;
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "nhan_biet", label: "Nhận biết" },
  { value: "thong_hieu", label: "Thông hiểu" },
  { value: "van_dung", label: "Vận dụng" },
  { value: "van_dung_cao", label: "Vận dụng cao" },
];

const TYPES: { value: QuestionType; label: string }[] = [
  { value: "single_choice", label: "Trắc nghiệm 4 đáp án" },
  { value: "short_answer", label: "Điền đáp án ngắn" },
  { value: "multi_true_false", label: "Đúng/Sai nhiều ý" },
];

export default function QuestionForm({
  initial,
}: {
  initial?: Question;
}) {
  const router = useRouter();
  const editing = !!initial;

  const [subjectId, setSubjectId] = useState(initial?.chapter?.subject?.id ?? "");
  const [chapterId, setChapterId] = useState(initial?.chapter_id ?? "");
  const [type, setType] = useState<QuestionType>(initial?.type ?? "single_choice");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "nhan_biet");
  const [content, setContent] = useState(initial?.content ?? "");
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status === "published" ? "published" : "draft");
  const [options, setOptions] = useState<OptionForm[]>(
    initial?.options?.length
      ? initial.options.map((o) => ({ content: o.content, is_correct: o.is_correct }))
      : [
          { content: "", is_correct: false },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
          { content: "", is_correct: false },
        ]
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () => api<Subject[]>("/subjects"),
  });

  const chaptersQuery = useQuery({
    queryKey: ["chapters", subjectId],
    queryFn: () =>
      subjectId
        ? api<Chapter[]>(`/subjects/${subjectId}/chapters`)
        : Promise.resolve([] as Chapter[]),
    enabled: !!subjectId,
  });

  if (subjectsQuery.isLoading) return <Loading />;

  const reviewContent = content || "Nội dung câu hỏi sẽ hiển thị ở đây...";

  const setOption = (i: number, patch: Partial<OptionForm>) => {
    setOptions((prev) => prev.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  };

  const toggleCorrect = (i: number) => {
    if (type === "single_choice") {
      setOptions((prev) => prev.map((o, idx) => ({ ...o, is_correct: idx === i })));
    } else {
      setOption(i, { is_correct: !options[i].is_correct });
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!chapterId) {
      setError("Chọn chuyên đề");
      return;
    }
    if (!content.trim()) {
      setError("Nhập nội dung câu hỏi");
      return;
    }

    const validOptions = options
      .filter((o) => o.content.trim())
      .map((o) => ({ content: o.content, is_correct: o.is_correct }));

    if (
      (type === "single_choice" || type === "multi_true_false") &&
      validOptions.length < 2
    ) {
      setError(
        type === "multi_true_false"
          ? "Câu Đúng/Sai cần tối thiểu 2 phát biểu"
          : "Câu trắc nghiệm cần ít nhất 2 đáp án"
      );
      return;
    }
    if (type === "single_choice" && validOptions.filter((o) => o.is_correct).length !== 1) {
      setError("Câu trắc nghiệm cần đúng 1 đáp án đúng");
      return;
    }
    if (type === "multi_true_false") {
      if (
        validOptions.filter((o) => o.is_correct).length < 1 ||
        validOptions.filter((o) => o.is_correct).length >= validOptions.length
      ) {
        setError("Câu Đúng/Sai phải có cả ý đúng và ý sai");
        return;
      }
    } else if (!validOptions.some((o) => o.is_correct)) {
      setError("Cần đánh dấu ít nhất 1 đáp án đúng");
      return;
    }

    setSaving(true);
    const body = {
      chapter_id: chapterId,
      content,
      type,
      difficulty,
      explanation: explanation || undefined,
      status,
      options: validOptions,
    };
    try {
      if (editing) {
        await api(`/questions/${initial.id}`, { method: "PATCH", body });
      } else {
        await api("/questions", { method: "POST", body });
      }
      router.push("/questions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lưu câu hỏi thất bại");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {editing ? "Sửa câu hỏi" : "Tạo câu hỏi mới"}
        </h1>
      </div>

      <Card className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Môn học
          </label>
          <select
            value={subjectId}
            onChange={(e) => {
              setSubjectId(e.target.value);
              setChapterId("");
            }}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">Chọn môn</option>
            {(subjectsQuery.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Chuyên đề
          </label>
          <select
            value={chapterId}
            onChange={(e) => setChapterId(e.target.value)}
            required
            disabled={!subjectId}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
          >
            <option value="">Chọn chuyên đề</option>
            {(chaptersQuery.data ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Loại câu hỏi
          </label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value as QuestionType);
              if (e.target.value === "single_choice") {
                setOptions((prev) => {
                  const next = [...prev];
                  while (next.length < 4) next.push({ content: "", is_correct: false });
                  return next.slice(0, 4);
                });
              } else if (e.target.value === "multi_true_false") {
                setOptions((prev) => {
                  const next = [...prev];
                  while (next.length < 4) next.push({ content: "", is_correct: false });
                  return next.slice(0, 4);
                });
              } else if (e.target.value === "short_answer") {
                setOptions([{ content: "", is_correct: true }]);
              }
            }}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Mức độ
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            {DIFFICULTIES.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Trạng thái
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="draft">Bản nháp</option>
            <option value="published">Công khai</option>
          </select>
        </div>
      </Card>

      <Card className="p-5">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nội dung câu hỏi (hỗ trợ LaTeX với dấu $...$)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          placeholder="VD: Cho hàm số $f(x) = x^3 - 3x + 1$. Số điểm cực trị là bao nhiêu?"
        />
        <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
          <span className="mb-1 block text-xs font-semibold text-gray-500">
            Xem trước:
          </span>
          <Latex text={reviewContent} />
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          {type === "single_choice"
            ? "Các đáp án (đánh dấu đáp án đúng)"
            : type === "short_answer"
              ? "Đáp án đúng"
              : "Các phát biểu (đánh dấu ý Đúng)"}
        </h3>
        {type === "single_choice" ? (
          <div className="space-y-2">
            {options.slice(0, 4).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleCorrect(i)}
                  className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                    opt.is_correct
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300 bg-white"
                  }`}
                  aria-label={opt.is_correct ? "Đúng" : "Sai"}
                >
                  {opt.is_correct && (
                    <svg viewBox="0 0 20 20" fill="white" className="h-full w-full">
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <span className="text-sm font-semibold text-gray-500">
                  {String.fromCharCode(65 + i)}.
                </span>
                <input
                  value={opt.content}
                  onChange={(e) => setOption(i, { content: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  placeholder={`Đáp án ${String.fromCharCode(65 + i)}`}
                />
              </div>
            ))}
          </div>
        ) : type === "short_answer" ? (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-500">Đáp án:</span>
            <input
              value={options[0]?.content ?? ""}
              onChange={(e) => setOption(0, { content: e.target.value })}
              className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
              placeholder="VD: 0<m<4"
            />
          </div>
        ) : type === "multi_true_false" ? (
          <div className="space-y-2">
            {options.slice(0, 4).map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-500">
                  {String.fromCharCode(97 + i)}).
                </span>
                <input
                  value={opt.content}
                  onChange={(e) => setOption(i, { content: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
                  placeholder={`Phát biểu ${String.fromCharCode(97 + i)}`}
                />
                <div className="flex shrink-0 items-center gap-2">
                  <label
                    className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      opt.is_correct
                        ? "bg-emerald-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`tf-${i}`}
                      className="sr-only"
                      checked={opt.is_correct}
                      onChange={() => setOption(i, { is_correct: true })}
                    />
                    Đúng
                  </label>
                  <label
                    className={`cursor-pointer rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      !opt.is_correct
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`tf-${i}`}
                      className="sr-only"
                      checked={!opt.is_correct}
                      onChange={() => setOption(i, { is_correct: false })}
                    />
                    Sai
                  </label>
                </div>
              </div>
            ))}
            <p className="pt-1 text-xs text-gray-500">
              Bảng quy đổi điểm (Bộ GD-ĐT 2025): đúng 4/4 → 1.0đ · 3/4 → 0.5đ ·
              2/4 → 0.25đ · ≤1/4 → 0đ
            </p>
          </div>
        ) : null}
      </Card>

      {type !== "short_answer" && (
        <Card className="p-5">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Lời giải chi tiết (hỗ trợ LaTeX)
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            placeholder="Nhập lời giải chi tiết..."
          />
          {explanation && (
            <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
              <Latex text={explanation} />
            </div>
          )}
        </Card>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          {editing ? "Lưu thay đổi" : "Tạo câu hỏi"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}