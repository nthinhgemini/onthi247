"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type {
  BadgesData,
  ProgressDay,
  StatsOverview,
  WeakChaptersData,
} from "@/lib/types";
import { Card, Loading } from "@/components/ui";

function MiniSparkline({ data }: { data: ProgressDay[] }) {
  const scores = data.map((d) => d.avg_score);
  const max = 10;
  const w = 600;
  const h = 160;
  const pad = 24;
  const usable = w - pad * 2;
  const step = scores.length > 1 ? usable / (scores.length - 1) : usable;

  const points = scores
    .map((s, i) => {
      const x = pad + i * step;
      const y = h - pad - (s / max) * (h - pad * 2);
      return [Number(x.toFixed(2)), Number(y.toFixed(2))] as const;
    })
    .filter(([, y]) => y >= 0 && y <= h);

  if (points.length === 0) {
    return (
      <p className="flex h-[160px] items-center justify-center text-sm text-gray-400">
        Chưa có dữ liệu làm bài.
      </p>
    );
  }

  const path = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`)
    .join(" ");
  const area = `${path} L${points[points.length - 1][0]},${h - pad} L${points[0][0]},${h - pad} Z`;

  return (
    <div className="mt-4">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="h-40 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Biểu đồ điểm trung bình 30 ngày"
      >
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#sparkFill)" />
        <path
          d={path}
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {[2, 4, 6, 8, 10].map((g) => {
          const y = h - pad - (g / max) * (h - pad * 2);
          return (
            <g key={g}>
              <line
                x1={pad}
                y1={y}
                x2={w - pad}
                y2={y}
                stroke="#e5e7eb"
                strokeDasharray="3 3"
              />
              <text
                x={w - pad - 4}
                y={y + 4}
                fontSize="11"
                fill="#9ca3af"
                textAnchor="end"
              >
                {g}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  icon,
  accent = "indigo",
}: {
  label: string;
  value: string | number;
  suffix?: string;
  icon: string;
  accent?: "indigo" | "green" | "amber" | "red" | "blue";
}) {
  const accents: Record<string, string> = {
    indigo: "bg-indigo-100 text-indigo-700",
    green: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${accents[accent]}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">
            {value}
            {suffix && (
              <span className="ml-1 text-sm font-normal text-gray-500">
                {suffix}
              </span>
            )}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default function StatsPage() {
  const overviewQuery = useQuery({
    queryKey: ["stats", "overview"],
    queryFn: () => api<StatsOverview>("/stats/me/overview"),
  });
  const progressQuery = useQuery({
    queryKey: ["stats", "progress"],
    queryFn: () => api<ProgressDay[]>("/stats/me/progress?days=30"),
  });
  const weakQuery = useQuery({
    queryKey: ["stats", "weak"],
    queryFn: () => api<WeakChaptersData>("/stats/me/weak-chapters"),
  });
  const badgesQuery = useQuery({
    queryKey: ["stats", "badges"],
    queryFn: () => api<BadgesData>("/stats/me/badges"),
  });

  if (
    overviewQuery.isLoading ||
    progressQuery.isLoading ||
    weakQuery.isLoading ||
    badgesQuery.isLoading
  ) {
    return <Loading />;
  }

  const overview = overviewQuery.data;
  const progress = progressQuery.data ?? [];
  const weak = weakQuery.data;
  const badges = badgesQuery.data;

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-bold text-gray-900">Thống kê học tập</h1>
        <p className="mt-1 text-gray-600">
          Theo dõi tiến độ và tìm ra chuyên đề cần cải thiện.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Cấp độ"
          value={overview?.level ?? 0}
          accent="indigo"
          icon="🎖️"
        />
        <StatCard
          label="Tổng XP"
          value={overview?.xp ?? 0}
          accent="green"
          icon="⚡"
        />
        <StatCard
          label="Chuỗi ngày học"
          value={overview?.streak ?? 0}
          suffix="ngày"
          accent="amber"
          icon="🔥"
        />
        <StatCard
          label="Số bài đã làm"
          value={overview?.total_submissions ?? 0}
          accent="blue"
          icon="📝"
        />
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          label="Điểm trung bình"
          value={overview?.avg_score.toFixed(2) ?? "0"}
          accent="indigo"
          icon="📊"
        />
        <StatCard
          label="Điểm cao nhất"
          value={overview?.best_score.toFixed(2) ?? "0"}
          accent="green"
          icon="🥇"
        />
        <StatCard
          label="Độ chính xác"
          value={overview?.accuracy ?? 0}
          suffix="%"
          accent="amber"
          icon="🎯"
        />
        <Card className="flex items-center gap-3 p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">
            💪
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">Môn luyện nhiều nhất</p>
            <p className="text-lg font-bold text-gray-900">
              {overview && overview.subjects.length > 0
                ? overview.subjects.reduce((a, b) =>
                    a.count >= b.count ? a : b
                  ).subject
                : "—"}
            </p>
          </div>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Điểm trung bình 30 ngày
          </h2>
          <p className="text-sm text-gray-500">
            Thang điểm /10, chỉ tính bài đã nộp.
          </p>
          <MiniSparkline data={progress} />
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Chuyên đề yếu &amp; gợi ý
          </h2>
          {(weak?.weakest.length ?? 0) === 0 ? (
            <p className="text-sm text-gray-500">
              Hoàn thành bài thi đầu tiên để có phân tích chi tiết.
            </p>
          ) : (
            <div className="space-y-4">
              {weak?.weakest.map((c) => (
                <div key={c.chapter + c.subject}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {c.subject} · {c.chapter}
                    </p>
                    <span
                      className={`text-sm font-bold ${
                        c.accuracy < 50
                          ? "text-red-600"
                          : c.accuracy < 75
                            ? "text-amber-600"
                            : "text-emerald-600"
                      }`}
                    >
                      {c.accuracy}%
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${
                        c.accuracy < 50
                          ? "bg-red-500"
                          : c.accuracy < 75
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{ width: `${c.accuracy}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {c.attempts} lượt trả lời · {c.suggestion}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Huy hiệu của bạn
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {badges?.earned.map((b) => (
            <Card key={b.id} className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl">
                {b.icon_url ?? "🏅"}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{b.name}</p>
                <p className="text-xs text-gray-500">{b.description}</p>
                <p className="mt-0.5 text-[11px] text-emerald-600">
                  {b.earned_at
                    ? `Đạt ${new Date(b.earned_at).toLocaleDateString("vi-VN")}`
                    : "Đã đạt"}
                </p>
              </div>
            </Card>
          ))}
          {badges?.locked.map((b) => (
            <div
              key={b.id}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 opacity-70"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-200 text-2xl grayscale">
                {b.icon_url ?? "🔒"}
              </div>
              <div>
                <p className="font-semibold text-gray-500">{b.name}</p>
                <p className="text-xs text-gray-400">{b.description}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  Điều kiện: cần {b.condition_value}{" "}
                  {b.condition_type === "submissions"
                    ? "bài làm"
                    : b.condition_type === "streak"
                      ? "ngày liên tiếp"
                      : "XP"}
                </p>
              </div>
            </div>
          ))}
        </div>
        {badges && badges.earned.length === 0 && (
          <p className="mt-2 text-sm text-gray-500">
            Nộp bài thi để mở khóa huy hiệu đầu tiên. 🚀
          </p>
        )}
      </section>
    </div>
  );
}