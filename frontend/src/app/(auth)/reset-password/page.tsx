"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button, Loading } from "@/components/ui";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Thiếu mã xác nhận (token). Vui lòng kiểm tra lại liên kết email.");
      return;
    }
    if (password.length < 6) {
      setError("Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Xác nhận mật khẩu không khớp.");
      return;
    }

    setLoading(true);
    try {
      await api<{ message: string }>("/auth/reset-password", {
        method: "POST",
        auth: false,
        body: { token, password },
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 text-center">
        <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
          Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...
        </div>
        <Link
          href="/login"
          className="inline-block pt-2 text-sm font-semibold text-indigo-600 hover:underline"
        >
          Chuyển tới Đăng nhập ngay
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {!token && (
        <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 ring-1 ring-amber-200">
          ⚠️ Không tìm thấy token trong URL. Hãy mở lại liên kết từ email.
        </p>
      )}

      <div>
        <label htmlFor="pass" className="mb-1.5 block text-sm font-medium text-gray-700">
          Mật khẩu mới
        </label>
        <input
          id="pass"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
          placeholder="Tối thiểu 6 ký tự"
        />
      </div>

      <div>
        <label htmlFor="confirm" className="mb-1.5 block text-sm font-medium text-gray-700">
          Xác nhận mật khẩu mới
        </label>
        <input
          id="confirm"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-xl border border-gray-300 bg-white/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
          placeholder="Nhập lại mật khẩu mới"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50/80 px-4 py-2.5 text-sm text-red-700 ring-1 ring-red-200/50">
          {error}
        </p>
      )}

      <Button
        type="submit"
        loading={loading}
        disabled={!token}
        className="w-full rounded-xl py-2.5 text-base shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30"
      >
        Lưu mật khẩu mới
      </Button>

      <div className="text-center pt-2">
        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
          Hủy bỏ
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 px-4 py-8">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-3xl font-bold text-white shadow-lg shadow-indigo-600/25">
            🔒
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Đặt lại mật khẩu</h1>
          <p className="mt-2 text-sm text-gray-500">
            Tạo mật khẩu mới an toàn cho tài khoản của bạn.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-6 shadow-lg backdrop-blur-sm sm:p-8">
          <Suspense fallback={<Loading text="Đang tải..." />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
