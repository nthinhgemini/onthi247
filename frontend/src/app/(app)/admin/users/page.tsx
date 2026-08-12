"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AdminUser, Paged } from "@/lib/types";
import { Badge, Button, Card, Loading } from "@/components/ui";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  teacher: "Giáo viên",
  student: "Học viên",
};

const ROLE_COLOR: Record<string, "red" | "blue" | "gray"> = {
  admin: "red",
  teacher: "blue",
  student: "gray",
};

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin", "users", query, role, 1],
    queryFn: () =>
      api<Paged<AdminUser>>(
        `/admin/users?page=1&pageSize=20${role ? `&role=${role}` : ""}${query ? `&search=${encodeURIComponent(query)}` : ""}`
      ),
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; body: Record<string, unknown> }) =>
      api(`/admin/users/${vars.id}`, { method: "PATCH", body: vars.body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "overview"] });
    },
  });

  const toggleActive = (u: AdminUser) =>
    updateMutation.mutate({ id: u.id, body: { is_active: !u.is_active } });

  const changeRole = (u: AdminUser, newRole: string) => {
    if (newRole === u.role) return;
    updateMutation.mutate({ id: u.id, body: { role: newRole } });
  };

  if (usersQuery.isLoading) return <Loading />;

  const users = usersQuery.data?.items ?? [];

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-1 text-gray-600">
            Tìm kiếm, đổi vai trò, khóa/mở tài khoản.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setQuery(search.trim());
            }}
            placeholder="Tìm tên hoặc email..."
            className="w-60 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
          <Button variant="secondary" onClick={() => setQuery(search.trim())}>
            Tìm
          </Button>
        </div>
      </section>

      <section className="flex gap-2">
        {["", "student", "teacher", "admin"].map((r) => (
          <button
            key={r}
            onClick={() => setRole(r)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              role === r
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {r === "" ? "Tất cả" : ROLE_LABEL[r]}
          </button>
        ))}
      </section>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                <th className="px-6 py-3">Người dùng</th>
                <th className="px-6 py-3">Vai trò</th>
                <th className="px-6 py-3">XP</th>
                <th className="px-6 py-3">Trạng thái</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{u.full_name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                    <p className="text-[11px] text-gray-400">
                      {u.streak_count} ngày streak · {u._count?.submissions ?? 0} bài làm
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={ROLE_COLOR[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">
                    ⚡ {u.xp.toLocaleString("vi-VN")}
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={u.is_active ? "green" : "red"}>
                      {u.is_active ? "Hoạt động" : "Bị khóa"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <select
                        value={u.role}
                        onChange={(e) => changeRole(u, e.target.value)}
                        className="rounded-lg border border-gray-300 px-2 py-1.5 text-xs outline-none focus:border-indigo-500"
                      >
                        {(["student", "teacher", "admin"] as const).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                      <Button
                        variant={u.is_active ? "danger" : "success"}
                        className="px-3 py-1.5 text-xs"
                        onClick={() => toggleActive(u)}
                        loading={updateMutation.isPending && updateMutation.variables?.id === u.id}
                      >
                        {u.is_active ? "Khóa" : "Mở khóa"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {usersQuery.data && usersQuery.data.items.length === 0 && (
          <div className="p-10 text-center text-sm text-gray-500">
            Không tìm thấy người dùng nào.
          </div>
        )}
      </Card>
    </div>
  );
}