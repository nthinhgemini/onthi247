"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { setTokens } from "@/lib/api";
import { Loading } from "@/components/ui";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  useEffect(() => {
    const accessToken = searchParams.get("access_token");
    const refreshToken = searchParams.get("refresh_token");

    if (accessToken && refreshToken) {
      setTokens(accessToken, refreshToken);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      router.replace("/");
    } else {
      router.replace("/login?error=oauth_failed");
    }
  }, [router, searchParams, queryClient]);

  return <Loading text="Đang xử lý đăng nhập..." />;
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Loading text="Đang tải..." />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
