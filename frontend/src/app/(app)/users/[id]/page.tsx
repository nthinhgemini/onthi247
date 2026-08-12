"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PublicProfileData } from "@/lib/types";
import { Badge, Card, Loading } from "@/components/ui";

function scoreColor(score: number | null) {
  if (score === null) return "text-gray-400";
  if (score >= 9) return "text-emerald-600";
  if (score >= 7) return "text-blue-600";
  if (score >= 5) return "text-amber-600";
  return "text-red-600";
}

export default function PublicProfilePage() {
  const params = useParams<{ id: string }>();

  const profileQuery = useQuery({
    queryKey: ["public-profile", params.id],
    queryFn: () => api<PublicProfileData>(`/users/${params.id}/profile`),
  });

  if (profileQuery.isLoading) return <Loading />;
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <Card className="p-8 text-center text-gray-500">
        Không tìm thấy hồ sơ người dùng.
      </Card>
    );
  }

  const { user, stats, badges, recentSubmissions } = profileQuery.data;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              user.avatar_url ||
              "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.full_name)
            }
            alt={user.full_name}
            className="h-20 w-20 rounded-full border border-gray-200 object-cover"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.full_name}</h1>
            <p className="text-sm text-gray-500">
              {user.school || "Chưa cập nhật trường"}{" "}
              {user.target_block ? `· Khối ${user.target_block}` : ""}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Tham gia {new Date(user.created_at).toLocaleDateString("vi-VN")}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-indigo-50 p-3 text-center">
            <p className="text-xl font-bold text-indigo-700">{user.xp}</p>
            <p className="text-xs text-indigo-600">XP</p>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3 text-center">
            <p className="text-xl font-bold text-emerald-700">
              {stats.submissions}
            </p>
            <p className="text-xs text-emerald-600">Bài thi</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-center">
            <p className="text-xl font-bold text-blue-700">
              {stats.best_score.toFixed(2)}
            </p>
            <p className="text-xs text-blue-600">Điểm cao nhất</p>
          </div>
          <div className="rounded-xl bg-amber-50 p-3 text-center">
            <p className="text-xl font-bold text-amber-700">
              {stats.avg_score.toFixed(2)}
            </p>
            <p className="text-xs text-amber-600">Điểm TB</p>
          </div>
        </div>
      </Card>

      {badges.length > 0 && (
        <Card className="p-6">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Huy hiệu đã đạt
          </h2>
          <div className="flex flex-wrap gap-2">
            {badges.map((b) => (
              <Badge key={b.id} color="amber">
                🏅 {b.name}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Bài thi gần đây
        </h2>
        {recentSubmissions.length === 0 ? (
          <p className="text-sm text-gray-500">
            Người dùng chưa hoàn thành bài thi nào.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentSubmissions.map((s) => (
              <Link
                key={s.id}
                href={`/submissions/${s.id}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {s.exam.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {s.exam.subject.name} ·{" "}
                    {s.submitted_at
                      ? new Date(s.submitted_at).toLocaleDateString("vi-VN")
                      : ""}
                  </p>
                </div>
                <span
                  className={`text-lg font-bold ${scoreColor(s.total_score)}`}
                >
                  {s.total_score?.toFixed(2) ?? "—"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}