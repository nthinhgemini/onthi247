"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devToken, setDevToken] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await api<{ message: string; dev_reset_token?: string }>(
        "/auth/forgot-password",
        {
          method: "POST",
          auth: false,
          body: { email },
        }
      );
      setMessage(res.message);
      if (res.dev_reset_token) {
        setDevToken(res.dev_reset_token);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Yêu cầu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 px-4 py-8">
      <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-500 text-3xl font-bold text-white shadow-lg shadow-indigo-600/25">
            🔑
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quên mật khẩu</h1>
          <p className="mt-2 text-sm text-gray-500">
            Nhập email tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white/80 p-6 shadow-lg backdrop-blur-sm sm:p-8">
          {message ? (
            <div className="space-y-4 text-center">
              <div className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800 ring-1 ring-emerald-200">
                {message}
              </div>
              {devToken && (
                <div className="rounded-xl bg-amber-50 p-4 text-left text-xs text-amber-900 ring-1 ring-amber-200">
                  <p className="font-semibold text-amber-800">Dev/Mock Mode Reset Link:</p>
                  <Link
                    href={`/reset-password?token=${devToken}`}
                    className="mt-1 block break-all font-mono text-indigo-600 underline hover:text-indigo-800"
                  >
                    /reset-password?token={devToken}
                  </Link>
                </div>
              )}
              <Link
                href="/login"
                className="inline-block pt-2 text-sm font-semibold text-indigo-600 hover:underline"
              >
                ← Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email tài khoản
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white/50 px-4 py-2.5 text-sm outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 focus:bg-white"
                  placeholder="you@example.com"
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
                className="w-full rounded-xl py-2.5 text-base shadow-lg shadow-indigo-600/20 transition-all hover:shadow-indigo-600/30"
              >
                Gửi liên kết khôi phục
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
