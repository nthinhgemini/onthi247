"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { NotificationsData } from "@/lib/types";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/exams", label: "Kho đề thi" },
  { href: "/notes", label: "Sổ tay" },
  { href: "/stats", label: "Thống kê" },
  { href: "/submissions", label: "Lịch sử làm bài" },
];

const FORUM_NAV = [{ href: "/forum", label: "Diễn đàn" }];

const TEACHER_NAV = [
  { href: "/questions", label: "Ngân hàng câu hỏi" },
  { href: "/exams/new", label: "Tạo đề thi" },
];

const RANKING_NAV = [{ href: "/leaderboard", label: "Xếp hạng" }];

const ADMIN_NAV = [
  { href: "/admin", label: "Admin" },
  { href: "/admin/users", label: "Quản lý người dùng" },
  { href: "/admin/questions", label: "Duyệt câu hỏi" },
];

function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const notisQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<NotificationsData>("/users/me/notifications"),
    enabled: !!user,
    refetchInterval: 30000,
  });

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = notisQuery.data?.unread ?? 0;
  const items = notisQuery.data?.items ?? [];

  const markRead = async (id: string) => {
    await api(`/users/me/notifications/${id}/read`, { method: "PATCH" });
    notisQuery.refetch();
  };

  const markAll = async () => {
    await api("/users/me/notifications/read", { method: "PATCH" });
    notisQuery.refetch();
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        aria-label="Thông báo"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="h-5 w-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V4a2 2 0 10-4 0v1.3A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
            <p className="text-sm font-semibold text-gray-900">Thông báo</p>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Đánh dấu đã đọc
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">
                Chưa có thông báo
              </p>
            ) : (
              items.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`block w-full border-b border-gray-50 px-4 py-3 text-left text-sm ${
                    n.is_read
                      ? "bg-white text-gray-600"
                      : "bg-indigo-50/60 text-gray-800"
                  }`}
                >
                  {n.content}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const items = [
    ...NAV,
    ...FORUM_NAV,
    ...(user?.role === "teacher" || user?.role === "admin"
      ? TEACHER_NAV
      : []),
    ...(user?.role === "student" ? RANKING_NAV : []),
    ...(user?.role === "admin" ? ADMIN_NAV : []),
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
              2
            </div>
            <span className="text-lg font-bold text-gray-900">Ôn thi 2029</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <NotificationBell />
                <Link
                  href={`/users/${user.id}`}
                  className="hidden text-right sm:block"
                >
                  <p className="text-sm font-medium text-gray-900 hover:text-indigo-600">
                    {user.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </Link>
                <Link
                  href="/profile"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Hồ sơ
                </Link>
                <button
                  onClick={logout}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-t border-gray-100 px-4 py-2 md:hidden">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                isActive(item.href)
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        Ôn thi 2029 — Luyện thi THPT Quốc gia
      </footer>
    </div>
  );
}
