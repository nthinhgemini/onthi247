"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { LeaderboardEntry } from "@/lib/types";
import { Card, Loading } from "@/components/ui";

const MEDAL = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
} as const;

function Avatar({ name, url }: { name: string; url?: string | null }) {
  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={name}
        className="h-10 w-10 rounded-full object-cover"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function LeaderboardPage() {
  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => api<LeaderboardEntry[]>("/stats/leaderboard?limit=20"),
  });

  if (leaderboardQuery.isLoading) return <Loading />;

  const rows = leaderboardQuery.data ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-gray-900">Bảng xếp hạng</h1>
        <p className="mt-1 text-gray-600">
          Top học viên tích cực nhất Ôn thi 2029 theo tổng XP.
        </p>
      </section>

      <Card className="overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Top {rows.length} học viên
        </div>
        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-500">
            Chưa có dữ liệu xếp hạng.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {rows.map((row) => (
              <li key={row.rank} className="flex items-center gap-4 px-6 py-4">
                <div className="w-10 text-center text-lg font-bold text-gray-700">
                  {row.rank <= 3 ? MEDAL[row.rank as 1 | 2 | 3] : row.rank}
                </div>
                <Avatar name={row.full_name} url={row.avatar_url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-gray-900">
                    {row.full_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {row.school ?? "Học viên"} · {row.submissions} bài đã làm
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">
                    ⚡ {row.xp.toLocaleString("vi-VN")}
                  </p>
                  <p className="text-xs text-gray-400">
                    🔥 {row.streak_count} ngày
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}