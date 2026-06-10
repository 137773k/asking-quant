const configMap = {
  lg: { size: 160, stroke: 10, fontSize: 36, labelSize: 12 },
  md: { size: 120, stroke: 8, fontSize: 28, labelSize: 11 },
  sm: { size: 80, stroke: 6, fontSize: 20, labelSize: 10 },
} as const

function arcColor(score: number) {
  if (score >= 70) return '#7EBF8E'
  if (score >= 40) return '#D4A574'
  return '#E07B7B'
}

export default function ScoreGauge({
  score,
  label,
  size = 'md',
}: {
  score: number
  label: string
  size?: 'sm' | 'md' | 'lg'
}) {
  const cfg = configMap[size]
  const r = (cfg.size - cfg.stroke) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(100, Math.max(0, score))
  const filled = (clamped / 100) * c

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: cfg.size, height: cfg.size }}>
      <svg
        width={cfg.size}
        height={cfg.size}
        viewBox={`0 0 ${cfg.size} ${cfg.size}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx={cfg.size / 2}
          cy={cfg.size / 2}
          r={r}
          fill="none"
          stroke="#2A2725"
          strokeWidth={cfg.stroke}
        />
        {clamped > 0 && (
          <circle
            cx={cfg.size / 2}
            cy={cfg.size / 2}
            r={r}
            fill="none"
            stroke={arcColor(clamped)}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={`${filled} ${c}`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span
          className="font-bold text-text-primary leading-none"
          style={{ fontSize: cfg.fontSize, fontFamily: '-apple-system, system-ui, sans-serif' }}
        >
          {Math.round(clamped)}
        </span>
        <span
          className="text-text-secondary mt-1 leading-tight"
          style={{ fontSize: cfg.labelSize, fontFamily: '-apple-system, system-ui, sans-serif' }}
        >
          {label}
        </span>
      </div>
    </div>
  )
}
