interface Props {
  score: number
}

const POSITION_TABLE = [
  { range: [0, 40] as const, state: '退潮', position: '空仓', color: 'bg-accent-red' },
  { range: [40, 55] as const, state: '弱修复', position: '小仓试错', color: 'bg-accent-red/60' },
  { range: [55, 70] as const, state: '轮动', position: '3-5成', color: 'bg-accent' },
  { range: [70, 85] as const, state: '强赚钱', position: '5-7成', color: 'bg-accent-green/80' },
  { range: [85, 100] as const, state: '高潮', position: '不追', color: 'bg-accent-green' },
]

function positionBarColor(score: number): string {
  if (score >= 85) return 'bg-accent-green'
  if (score >= 70) return 'bg-accent-green/80'
  if (score >= 55) return 'bg-accent'
  if (score >= 40) return 'bg-accent-red/60'
  return 'bg-accent-red'
}

export default function PositionCalc({ score }: Props) {
  const currentRow = POSITION_TABLE.find(
    (r) => score >= r.range[0] && score < r.range[1],
  ) ?? POSITION_TABLE[0]

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h3 className="text-text-secondary text-xs uppercase tracking-wider mb-3">仓位计算</h3>

      <div className="overflow-hidden rounded-xl border border-border mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-text-secondary font-normal">市场状态</th>
              <th className="text-left py-2 px-3 text-text-secondary font-normal">分数</th>
              <th className="text-left py-2 px-3 text-text-secondary font-normal">仓位建议</th>
            </tr>
          </thead>
          <tbody>
            {POSITION_TABLE.map((row) => {
              const isCurrent =
                score >= row.range[0] && score < row.range[1]
              return (
                <tr
                  key={row.state}
                  className={`border-b border-border last:border-b-0 ${
                    isCurrent ? 'bg-accent/10 border-l-2 border-l-accent' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-text-primary">{row.state}</td>
                  <td className="py-2 px-3 text-text-secondary">
                    {row.range[0]}-{row.range[1]}
                  </td>
                  <td className="py-2 px-3">
                    <span className={isCurrent ? 'text-accent font-bold' : 'text-text-primary'}>
                      {row.position}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-text-secondary mb-1.5">
          <span>当前仓位水平</span>
          <span>{currentRow.position}</span>
        </div>
        <div className="h-2 rounded-full bg-border overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${positionBarColor(score)}`}
            style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-text-secondary mt-1">
          <span>0</span>
          <span>100</span>
        </div>
      </div>

      <div className="space-y-1.5 pt-3 border-t border-border">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">单笔上限</span>
          <span className="text-text-primary font-semibold">&le; 2%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">单日上限</span>
          <span className="text-text-primary font-semibold">&le; 4%</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">单周上限</span>
          <span className="text-text-primary font-semibold">&le; 8%</span>
        </div>
      </div>
    </div>
  )
}
