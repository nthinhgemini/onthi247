"use client";

import { useState } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Note, Subject } from "@/lib/types";
import { Button, Card, Loading } from "@/components/ui";
import Latex from "@/components/Latex";

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [subjectId, setSubjectId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [catSubject, setCatSubject] = useState("");
  const [error, setError] = useState("");

  const notesQuery = useQuery({
    queryKey: ["notes", subjectId],
    queryFn: () =>
      api<Note[]>(
        `/notes${subjectId ? `?subject_id=${subjectId}` : ""}`
      ),
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () => api<Subject[]>("/subjects"),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["notes"] });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const body = { title, content, subject_id: catSubject || undefined };
      if (editingId) {
        return api(`/notes/${editingId}`, { method: "PATCH", body });
      }
      return api("/notes", { method: "POST", body });
    },
    onSuccess: () => {
      invalidate();
      setTitle("");
      setContent("");
      setEditingId(null);
      setCatSubject("");
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/notes/${id}`, { method: "DELETE" }),
    onSuccess: invalidate,
  });

  if (notesQuery.isLoading) return <Loading />;

  const allNotes = notesQuery.data ?? [];

  const startEdit = (n: Note) => {
    setEditingId(n.id);
    setTitle(n.title);
    setContent(n.content);
    setCatSubject(n.subject_id ?? "");
    setError("");
  };

  const subjectName = (id?: string | null) =>
    subjectsQuery.data?.find((s) => s.id === id)?.name;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sổ tay công thức</h1>
        <p className="text-sm text-gray-500">
          Ghi chú công thức và lý thuyết riêng của bạn
        </p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">Tất cả môn</option>
          {(subjectsQuery.data ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <Card className="p-5">
        {editingId && (
          <p className="mb-3 text-sm font-medium text-indigo-600">
            Đang sửa ghi chú
          </p>
        )}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tiêu đề ghi chú (VD: Công thức logarit)"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium outline-none focus:border-indigo-500"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          placeholder="Nội dung công thức (hỗ trợ LaTeX: $\\log_a b = \\frac{\\ln b}{\\ln a}$)"
          className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
        />
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <select
            value={catSubject}
            onChange={(e) => setCatSubject(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          >
            <option value="">Chưa gắn môn</option>
            {(subjectsQuery.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <Button
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
            disabled={!title.trim() || !content.trim()}
          >
            {editingId ? "Lưu thay đổi" : "Thêm ghi chú"}
          </Button>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {allNotes.length === 0 ? (
          <Card className="p-8 text-center text-gray-500 sm:col-span-2">
            Chưa có ghi chú nào. Thêm công thức đầu tiên của bạn!
          </Card>
        ) : (
          allNotes.map((n) => (
            <Card key={n.id} className="flex flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {n.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {subjectName(n.subject_id) ?? "Chung"} ·{" "}
                    {new Date(n.updated_at).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => startEdit(n)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteMutation.mutate(n.id)}
                    className="rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    Xóa
                  </button>
                </div>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-gray-600">
                <Latex text={n.content} />
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}