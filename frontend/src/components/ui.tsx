import type { ReactNode } from "react";
import type { Difficulty, QuestionType } from "@/lib/types";

const btnStyles: Record<string, string> = {
  primary:
    "bg-indigo-600 text-white shadow-sm shadow-indigo-600/25 hover:bg-indigo-500 focus-visible:outline-indigo-600",
  secondary:
    "bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 hover:ring-gray-400",
  danger: "bg-red-600 text-white shadow-sm shadow-red-600/25 hover:bg-red-500",
  success: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/25 hover:bg-emerald-500",
  ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
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
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-150 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 ${btnStyles[variant]} ${className}`}
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
      className={`rounded-2xl border border-gray-200/80 bg-white shadow-card ${className}`}
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
    gray: "bg-gray-100 text-gray-700 ring-gray-200",
    green: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    blue: "bg-blue-50 text-blue-700 ring-blue-200/70",
    red: "bg-red-50 text-red-700 ring-red-200/70",
    amber: "bg-amber-50 text-amber-800 ring-amber-200/70",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-200/70",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colors[color]}`}
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
    <div
      role="status"
      className="flex items-center justify-center py-16 text-gray-500"
    >
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

const RING_SIZE = 56;
const RING_STROKE = 4.5;

export function CountdownRing({
  remainingSeconds,
  totalSeconds,
}: {
  remainingSeconds: number;
  totalSeconds: number;
}) {
  const radius = (RING_SIZE - RING_STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = totalSeconds > 0 ? Math.min(1, remainingSeconds / totalSeconds) : 0;

  const color =
    remainingSeconds <= 300 ? "#dc2626" : remainingSeconds <= 600 ? "#d97706" : "#4f46e5";
  const trackColor = remainingSeconds <= 600 ? "#fee2e2" : "#e5e7eb";

  const mm = Math.floor(remainingSeconds / 60);
  const ss = remainingSeconds % 60;
  const label = `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;

  return (
    <div
      role="timer"
      aria-label={`Còn ${mm} phút ${ss} giây`}
      className="relative flex h-14 w-14 shrink-0 items-center justify-center"
    >
      <svg viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`} className="h-full w-full -rotate-90">
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={RING_STROKE}
        />
        <circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={RING_STROKE}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.4s ease" }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-mono text-[13px] font-bold tabular-nums"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
}
