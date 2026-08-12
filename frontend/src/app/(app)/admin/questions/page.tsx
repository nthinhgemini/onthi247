"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContentStatus, Paged, Question } from "@/lib/types";
import { Badge, Button, Card, Loading } from "@/components/ui";
import Latex from "@/components/Latex";

const STATUS_LABEL: Record<string, string> = {
  draft: "Chờ duyệt",
  published: "Đã duyệt",
  rejected: "Từ chối",
};

const STATUS_COLOR: Record<string, "amber" | "green" | "red"> = {
  draft: "amber",
  published: "green",
  rejected: "red",
};

export default function AdminQuestionsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"draft" | "published" | "rejected">("draft");

  const questionsQuery = useQuery({
    queryKey: ["admin", "questions", status, 1],
    queryFn: () =>
      api<Paged<Question>>(`/admin/questions?page=1&pageSize=30&status=${status}`),
  });

  const moderateMutation = useMutation({
    mutationFn: (vars: { id: string; status: ContentStatus }) =>
      api(`/admin/questions/${vars.id}/moderate`, {
        method: "PATCH",
        body: { status: vars.status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "questions"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  if (questionsQuery.isLoading) return <Loading />;

  const questions = questionsQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-gray-900">Duyệt câu hỏi</h1>
        <p className="mt-1 text-gray-600">
          Kiểm duyệt nội dung câu hỏi do giáo viên đăng tải.
        </p>
      </section>

      <section className="flex gap-2">
        {(["draft", "published", "rejected"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              status === s
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {STATUS_LABEL[s]}
          </button>
        ))}
      </section>

      {questions.length === 0 ? (
        <Card className="p-10 text-center text-sm text-gray-500">
          Không có câu hỏi ở trạng thái này.
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <Card key={q.id} className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge color={STATUS_COLOR[q.status]}>
                      {STATUS_LABEL[q.status]}
                    </Badge>
                    <Badge color="blue">{q.chapter?.subject?.name}</Badge>
                    <Badge>{q.chapter?.name}</Badge>
                    <span className="text-xs text-gray-400">
                      bởi {q.creator?.full_name}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-gray-900">
                    <Latex text={q.content} />
                  </p>
                  {q.options.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {q.options.map((o) => (
                        <p
                          key={o.id}
                          className={`text-xs ${o.is_correct ? "text-emerald-700" : "text-gray-500"}`}
                        >
                          {o.is_correct ? "✓" : "•"}{" "}
                          <Latex text={o.content} />
                        </p>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  {q.status !== "published" && (
                    <Button
                      variant="success"
                      className="px-3 py-1.5 text-xs"
                      onClick={() =>
                        moderateMutation.mutate({ id: q.id, status: "published" })
                      }
                      loading={
                        moderateMutation.isPending &&
                        moderateMutation.variables?.id === q.id
                      }
                    >
                      Duyệt
                    </Button>
                  )}
                  {q.status !== "rejected" && (
                    <Button
                      variant="danger"
                      className="px-3 py-1.5 text-xs"
                      onClick={() =>
                        moderateMutation.mutate({ id: q.id, status: "rejected" })
                      }
                    >
                      Từ chối
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}