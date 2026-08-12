"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Question } from "@/lib/types";
import QuestionForm from "@/components/QuestionForm";
import { Card, Loading } from "@/components/ui";

export default function EditQuestionPage() {
  const params = useParams<{ id: string }>();
  const questionQuery = useQuery({
    queryKey: ["question", params.id],
    queryFn: () => api<Question>(`/questions/${params.id}`),
  });

  if (questionQuery.isLoading) return <Loading />;
  if (questionQuery.isError || !questionQuery.data) {
    return (
      <Card className="p-8 text-center text-red-600">
        Không thể tải câu hỏi.
      </Card>
    );
  }

  return <QuestionForm initial={questionQuery.data} />;
}