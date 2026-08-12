import type { ReactNode } from "react";
import type { Difficulty, QuestionType } from "@/lib/types";

const btnStyles: Record<string, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600",
  secondary:
    "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
  ghost: "text-gray-700 hover:bg-gray-100",
};

export function Button({
  children,
  variant = "primary",
  className = "",
  loading = false,
  ...props
}: {
  children: ReactNode;
  variant?: keyof typeof btnStyles;
  loading?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 ${btnStyles[variant]} ${className}`}
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-gray-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  color = "gray",
}: {
  children: ReactNode;
  color?: "gray" | "green" | "blue" | "red" | "amber" | "indigo";
}) {
  const colors: Record<string, string> = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[color]}`}
    >
      {children}
    </span>
  );
}

export const DIFFICULTY_COLOR: Record<Difficulty, "gray" | "green" | "blue" | "red" | "amber"> = {
  nhan_biet: "green",
  thong_hieu: "blue",
  van_dung: "amber",
  van_dung_cao: "red",
};

export const TYPE_COLOR: Record<QuestionType, "gray" | "indigo"> = {
  single_choice: "indigo",
  multi_true_false: "gray",
  short_answer: "gray",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const labels: Record<Difficulty, string> = {
    nhan_biet: "Nhận biết",
    thong_hieu: "Thông hiểu",
    van_dung: "Vận dụng",
    van_dung_cao: "Vận dụng cao",
  };
  return <Badge color={DIFFICULTY_COLOR[difficulty]}>{labels[difficulty]}</Badge>;
}

export function Loading({ text = "Đang tải..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-gray-500">
      <svg className="mr-2 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      {text}
    </div>
  );
}
