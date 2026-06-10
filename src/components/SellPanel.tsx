import { useState } from 'react'
import type { SellCheck } from '../engine/types'
import { checkSellSignals } from '../engine/sellSignals'

interface Props {
  marketScore: number
}

function StatusBadge({ triggered, label }: { triggered: boolean; label?: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        triggered ? 'bg-accent-red/20 text-accent-red' : 'bg-accent-green/20 text-accent-green'
      }`}
    >
      {label ?? (triggered ? '触发' : '正常')}
    </span>
  )
}

function TrailingLadder({ action }: { action: string }) {
  const steps = [
    { threshold: 30, text: '最高点回撤10%跟踪' },
    { threshold: 20, text: '5日线跟踪' },
    { threshold: 10, text: '止损移至浮盈5%' },
    { threshold: 5, text: '止损移至成本价' },
    { threshold: 0, text: '固定止损' },
  ]

  const activeStep = steps.findIndex((s) => action.includes(s.text))

  return (
    <div className="mt-2 space-y-1">
      {steps.map((step, i) => {
        const isActive = i === activeStep || (activeStep === -1 && i === 4)
        const isAbove = activeStep !== -1 && i < activeStep
        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`w-1.5 h-4 rounded-full flex-shrink-0 ${
                isActive
                  ? 'bg-accent-green'
                  : isAbove
                  ? 'bg-accent-green/30'
                  : 'bg-border'
              }`}
            />
            <div className="flex-1 flex justify-between items-center">
              <span
                className={`text-xs ${
                  isActive ? 'text-text-primary' : 'text-text-secondary'
                }`}
              >
                {step.text}
              </span>
              <span className={`text-xs ${isActive ? 'text-accent-green' : 'text-text-secondary'}`}>
                浮盈 &ge; {step.threshold}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function SellPanel({ marketScore }: Props) {
  const [entryPrice, setEntryPrice] = useState('')
  const [result, setResult] = useState<SellCheck | null>(null)

  const handleCheck = () => {
    const price = parseFloat(entryPrice)
    if (!price || price <= 0) return

    const snapshot = {
      code: '000001',
      name: '测试股票',
      price: price * 1.05,
      changePct: 5,
      turnoverRate: 12,
      volume: 8e8,
      prevVolume: 5e8,
      marketCap: 1e11,
      isLimitUp: false,
      sectorRank: 2,
      consecutiveBoards: 1,
      hasGapUp: false,
    }

    const r = checkSellSignals(snapshot, price, marketScore, false, 'green')
    setResult(r)
  }

  const stopThreshold =
    marketScore >= 70 ? 7 : marketScore >= 40 ? 5 : 3

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h3 className="text-text-secondary text-xs uppercase tracking-wider mb-3">卖出信号</h3>

      <div className="space-y-3 mb-4">
        <input
          type="number"
          placeholder="入场价格"
          value={entryPrice}
          onChange={(e) => setEntryPrice(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent"
        />
      </div>

      <button
        onClick={handleCheck}
        className="w-full bg-accent text-bg rounded-full px-6 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
      >
        检查卖出信号
      </button>

      {result && (
        <div className="mt-5 pt-4 border-t border-border space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-primary font-semibold">止损</span>
              <StatusBadge triggered={result.stopLoss.triggered} />
            </div>
            <p className="text-xs text-text-secondary">
              当前阈值: {marketScore >= 70 ? '主升' : marketScore >= 40 ? '混沌' : '退潮'} -{stopThreshold}%
            </p>
            {result.stopLoss.reason && (
              <p className="text-xs text-accent-red mt-1">{result.stopLoss.reason}</p>
            )}
            <p className="text-xs text-text-secondary mt-1">
              主升-7% / 混沌-5% / 退潮-3%
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-primary font-semibold">移动止盈</span>
              <StatusBadge triggered={result.trailingStop.triggered} />
            </div>
            <p className="text-xs text-text-secondary">{result.trailingStop.action}</p>
            <TrailingLadder action={result.trailingStop.action} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-primary font-semibold">时间止损</span>
              <StatusBadge triggered={result.timeStop.triggered} />
            </div>
            <p className="text-xs text-text-secondary">
              截止: {result.timeStop.deadline || '3个交易日不创新高'}
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-text-primary font-semibold">板块联动</span>
              <StatusBadge triggered={result.sectorLink.triggered} />
            </div>
            <p className="text-xs text-text-secondary">{result.sectorLink.action}</p>
          </div>
        </div>
      )}
    </div>
  )
}
