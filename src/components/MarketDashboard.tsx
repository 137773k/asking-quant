import type { MarketSnapshot, MarketScore } from '../engine/types'
import BentoCard from './BentoCard'
import ScoreGauge from './ScoreGauge'

interface Props {
  data: MarketSnapshot
  score: MarketScore
  useMock: boolean
  onToggleMock: () => void
  isRealData?: boolean
}

function comparison(value: number, type: 'higher' | 'lower') {
  if (type === 'higher') {
    if (value >= 80) return { label: '强势', color: 'text-accent-green' }
    if (value >= 50) return { label: '偏强', color: 'text-accent' }
    return { label: '偏弱', color: 'text-accent-red' }
  }
  if (value <= 15) return { label: '健康', color: 'text-accent-green' }
  if (value <= 30) return { label: '正常', color: 'text-accent' }
  return { label: '偏高', color: 'text-accent-red' }
}

export default function MarketDashboard({ data, score, useMock, onToggleMock, isRealData }: Props) {
  const stats = [
    { label: '涨停家数', value: data.limitUpCount, suffix: '家', type: 'higher' as const },
    { label: '跌停家数', value: data.limitDownCount, suffix: '家', type: 'lower' as const },
    { label: '连板晋级率', value: data.consecutiveUpRate, suffix: '%', type: 'higher' as const },
    { label: '炸板率', value: data.bustRate, suffix: '%', type: 'lower' as const },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary">市场状态</h2>
        <button
          onClick={onToggleMock}
          className="rounded-full border border-border px-3 py-1 text-xs text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors"
        >
          {useMock ? '模拟数据' : isRealData ? '实时数据' : '模拟(API离线)'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <BentoCard className="lg:col-span-2 flex flex-col items-center">
          <ScoreGauge score={score.total} size="lg" label="" />
          <div className="text-xl font-bold text-text-primary mt-2">{score.state}</div>
          <span className="rounded-full bg-accent/20 text-accent px-3 py-1 text-xs mt-1">
            {score.method}
          </span>
          <p className="text-text-secondary text-sm mt-3 text-center">{score.positionAdvice}</p>
        </BentoCard>

        {stats.map((s) => {
          const comp = comparison(s.value, s.type)
          return (
            <BentoCard key={s.label} title={s.label}>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-text-primary">
                  {s.value}
                </span>
                <span className="text-sm text-text-secondary">{s.suffix}</span>
              </div>
              <span className={`text-xs ${comp.color}`}>{comp.label}</span>
            </BentoCard>
          )
        })}
      </div>
    </div>
  )
}
