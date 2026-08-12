"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Chapter, Difficulty, Question, Subject } from "@/lib/types";
import { Button, Card, DifficultyBadge, Loading } from "@/components/ui";
import Latex from "@/components/Latex";

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "nhan_biet", label: "Nhận biết" },
  { value: "thong_hieu", label: "Thông hiểu" },
  { value: "van_dung", label: "Vận dụng" },
  { value: "van_dung_cao", label: "Vận dụng cao" },
];

const PRESET_MATRICES = [
  { name: "Đề THPT QG (Toán) full", matrix: { nhan_biet: 10, thong_hieu: 10, van_dung: 8, van_dung_cao: 2 } },
  { name: "Luyện cơ bản", matrix: { nhan_biet: 5, thong_hieu: 5, van_dung: 0, van_dung_cao: 0 } },
  { name: "Luyện vận dụng", matrix: { nhan_biet: 2, thong_hieu: 4, van_dung: 8, van_dung_cao: 6 } },
  { name: "Chuyên đề (10 câu)", matrix: { nhan_biet: 4, thong_hieu: 4, van_dung: 2, van_dung_cao: 0 } },
];

export default function NewExamPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"matrix" | "manual">("matrix");
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [chapterId, setChapterId] = useState("");
  const [duration, setDuration] = useState(50);
  const [matrix, setMatrix] = useState({ nhan_biet: 1, thong_hieu: 1, van_dung: 0, van_dung_cao: 0 });
  const [error, setError] = useState("");
  const [selling, setSelling] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [picked, setPicked] = useState<Record<string, Question>>({});

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

  const searchQuery = useQuery({
    queryKey: ["questions-search", subjectId, chapterId, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams({ pageSize: "30" });
      if (subjectId) params.set("subject", subjectId);
      if (chapterId) params.set("chapter", chapterId);
      if (searchTerm) params.set("search", searchTerm);
      return api<{ items: Question[] }>(`/questions?${params.toString()}`);
    },
  });

  const subjects = subjectsQuery.data ?? [];

  const setMatrixField = (key: keyof typeof matrix, value: number) => {
    setMatrix((prev) => ({ ...prev, [key]: Math.max(0, Number(value) || 0) }));
  };

  const totalCount = Object.values(matrix).reduce((s, v) => s + v, 0);

  const submit = async () => {
    setError("");
    if (!title.trim()) return setError("Nhập tên đề thi");
    if (!subjectId) return setError("Chọn môn học");

    setSelling(true);
    try {
      if (mode === "matrix") {
        if (totalCount === 0) {
          setError("Ma trận phải có ít nhất 1 câu hỏi");
          setSelling(false);
          return;
        }
        await api("/exams/generate", {
          method: "POST",
          body: {
            title,
            subject_id: subjectId,
            chapter_id: chapterId || undefined,
            duration_minutes: duration,
            matrix,
          },
        });
      } else {
        const questions = Object.values(picked);
        if (questions.length === 0) {
          setError("Chọn ít nhất 1 câu hỏi");
          setSelling(false);
          return;
        }
        await api("/exams", {
          method: "POST",
          body: {
            title,
            subject_id: subjectId,
            duration_minutes: duration,
            questions: questions.map((q, i) => ({
              question_id: q.id,
              order_index: i,
            })),
          },
        });
      }
      router.push("/exams");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Tạo đề thất bại");
      setSelling(false);
    }
  };

  const togglePick = (q: Question) => {
    setPicked((prev) => {
      const next = { ...prev };
      if (next[q.id]) delete next[q.id];
      else next[q.id] = q;
      return next;
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tạo đề thi</h1>

      <Card className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tên đề thi
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đề thi thử Toán lần 1"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
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
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            >
              <option value="">Chọn môn</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Chuyên đề (tùy chọn — để trống để lấy toàn bộ)
            </label>
            <select
              value={chapterId}
              onChange={(e) => setChapterId(e.target.value)}
              disabled={!subjectId}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
            >
              <option value="">Tất cả chuyên đề</option>
              {(chaptersQuery.data ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Thời gian làm bài (phút)
            </label>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value) || 1)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </Card>

      {/* Mode selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setMode("matrix")}
          className={`rounded-xl border-2 p-4 text-left transition-colors ${
            mode === "matrix"
              ? "border-indigo-600 bg-indigo-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="font-semibold text-gray-900">📊 Tự sinh theo ma trận</p>
          <p className="mt-1 text-xs text-gray-500">
            Chọn số câu từng mức độ, hệ thống trộn ngẫu nhiên từ ngân hàng.
          </p>
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`rounded-xl border-2 p-4 text-left transition-colors ${
            mode === "manual"
              ? "border-indigo-600 bg-indigo-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
        >
          <p className="font-semibold text-gray-900">✍️ Chọn câu hỏi thủ công</p>
          <p className="mt-1 text-xs text-gray-500">
            Lọc và chọn từng câu hỏi trong ngân hàng.
          </p>
        </button>
      </div>

      {mode === "matrix" ? (
        <Card className="p-5">
          <div className="mb-3 flex flex-wrap gap-2">
            {PRESET_MATRICES.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setMatrix(preset.matrix)}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
              >
                {preset.name}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {DIFFICULTIES.map((d) => (
              <div key={d.value} className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                <span className="text-sm font-medium text-gray-700">
                  {d.label}
                </span>
                <input
                  type="number"
                  min={0}
                  value={matrix[d.value]}
                  onChange={(e) => setMatrixField(d.value, Number(e.target.value))}
                  className="w-20 rounded-lg border border-gray-300 px-3 py-1.5 text-center text-sm outline-none focus:border-indigo-500"
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-gray-500">
            Tổng cộng: <span className="font-semibold">{totalCount} câu</span>
          </p>
        </Card>
      ) : (
        <Card className="p-5">
          <div className="flex flex-col gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm câu hỏi..."
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
            {searchQuery.isLoading ? (
              <Loading text="Đang tìm câu hỏi..." />
            ) : (
              <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                {(searchQuery.data?.items ?? []).map((q) => (
                  <label
                    key={q.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                      picked[q.id]
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!picked[q.id]}
                      onChange={() => togglePick(q)}
                      className="mt-1 h-4 w-4 accent-indigo-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <DifficultyBadge difficulty={q.difficulty} />
                        <span className="text-xs text-gray-500">
                          {q.chapter?.name}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-800">
                        <Latex text={q.content} />
                      </p>
                    </div>
                  </label>
                ))}
                {(searchQuery.data?.items ?? []).length === 0 && (
                  <p className="py-8 text-center text-sm text-gray-500">
                    Không có câu hỏi nào.
                  </p>
                )}
              </div>
            )}
          </div>
          {Object.keys(picked).length > 0 && (
            <p className="mt-3 text-sm text-gray-500">
              Đã chọn: <span className="font-semibold">{Object.keys(picked).length} câu</span>
            </p>
          )}
        </Card>
      )}

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button onClick={submit} loading={selling} className="px-8">
          Tạo đề thi
        </Button>
        <Button variant="secondary" onClick={() => router.back()}>
          Hủy
        </Button>
      </div>
    </div>
  );
}