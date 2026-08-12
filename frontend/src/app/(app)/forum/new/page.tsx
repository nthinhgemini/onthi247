"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Subject } from "@/lib/types";
import { Button, Card, Loading } from "@/components/ui";
import Latex from "@/components/Latex";

export default function NewPostPage() {
  const router = useRouter();
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () => api<Subject[]>("/subjects"),
  });

  if (subjectsQuery.isLoading) return <Loading />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Nhập tiêu đề câu hỏi");
      return;
    }
    if (!content.trim()) {
      setError("Nhập nội dung chi tiết");
      return;
    }
    setSaving(true);
    try {
      const post = await api<{ id: string }>("/forum/posts", {
        method: "POST",
        body: { title, content, subject_id: subjectId || undefined },
      });
      router.push(`/forum/${post.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng câu hỏi thất bại");
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Đặt câu hỏi mới</h1>
      </div>

      <Card className="grid gap-4 p-5 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Môn học (không bắt buộc)
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
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
            Tiêu đề
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            placeholder="VD: Bất phương trình logarit làm sao đổi cơ số ạ?"
          />
        </div>
      </Card>

      <Card className="p-5">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          Nội dung chi tiết (hỗ trợ LaTeX với dấu $...$)
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          required
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          placeholder="Mô tả bài toán, cách em đang làm và chỗ em bị vướng..."
        />
        {content && (
          <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">
            <span className="mb-1 block text-xs font-semibold text-gray-500">
              Xem trước:
            </span>
            <Latex text={content} />
          </div>
        )}
      </Card>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={saving}>
          Đăng câu hỏi
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Hủy
        </Button>
      </div>
    </form>
  );
}