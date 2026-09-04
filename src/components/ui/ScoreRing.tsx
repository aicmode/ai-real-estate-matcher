import { cn } from "@/lib/cn";

/** マッチ度に応じた色 (高いほどエメラルド寄り) */
export function scoreColor(score: number): string {
  if (score >= 85) return "var(--color-accent-600)";
  if (score >= 70) return "var(--color-brand-600)";
  return "var(--color-navy-500)";
}

const SIZES = {
  sm: { box: 48, stroke: 4, text: "text-[13px]", sub: "hidden" },
  md: { box: 64, stroke: 5, text: "text-base", sub: "text-[9px]" },
  lg: { box: 88, stroke: 6, text: "text-xl", sub: "text-[10px]" },
} as const;

/** マッチ度を示すドーナツゲージ */
export function ScoreRing({
  score,
  size = "md",
  className,
}: {
  score: number;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const { box, stroke, text, sub } = SIZES[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(100, Math.max(0, score)) / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div
      className={cn("relative shrink-0", className)}
      style={{ width: box, height: box }}
      role="img"
      aria-label={`マッチ度 ${score}%`}
    >
      <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`}>
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke="var(--color-navy-100)"
          strokeWidth={stroke}
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference - filled}`}
          transform={`rotate(-90 ${box / 2} ${box / 2})`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className={cn("tabular font-bold", text)} style={{ color }}>
          {score}
        </span>
        <span className={cn("font-semibold text-[var(--color-ink-subtle)]", sub)}>
          MATCH
        </span>
      </div>
    </div>
  );
}
