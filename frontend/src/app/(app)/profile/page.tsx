"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";
import { Button, Card } from "@/components/ui";
import { useAuth } from "@/lib/auth";

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [school, setSchool] = useState(user?.school ?? "");
  const [targetBlock, setTargetBlock] = useState(user?.target_block ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? "");
  const [error, setError] = useState("");

  const saveMutation = useMutation({
    mutationFn: () =>
      api<User>("/users/me", {
        method: "PATCH",
        body: {
          full_name: fullName,
          school: school || undefined,
          target_block: targetBlock || undefined,
          avatar_url: avatarUrl || undefined,
        },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data);
      router.push("/");
    },
    onError: (err: Error) => setError(err.message),
  });

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Hồ sơ của tôi</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl || "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.full_name)}
            alt={user.full_name}
            className="h-20 w-20 rounded-full border border-gray-200 object-cover"
          />
          <div>
            <p className="text-lg font-semibold text-gray-900">
              {user.full_name}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <p className="mt-1 text-xs text-gray-400">
              XP: {user.xp} · Streak: {user.streak_count} ngày
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Họ và tên
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Trường học
            </label>
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="VD: THPT Chuyên"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Khối thi dự kiến
            </label>
            <input
              value={targetBlock}
              onChange={(e) => setTargetBlock(e.target.value)}
              placeholder="VD: A00, B00, D01"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Ảnh đại diện (URL)
            </label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <Button
            onClick={() => saveMutation.mutate()}
            loading={saveMutation.isPending}
          >
            Lưu hồ sơ
          </Button>
          <Button variant="secondary" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </Card>
    </div>
  );
}