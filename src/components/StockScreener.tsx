import { useState } from 'react'
import type { StockScore } from '../engine/types'
import { screenStock } from '../engine/stockScreener'

interface Props {
  method: string
}

const DIMS: Record<string, string> = {
  炒作偏好: '题材类',
  板块地位: '题材类',
  筹码: '题材类/情绪类',
  人气: '题材类',
  拉升性价比: '题材类',
  高度: '情绪类',
  题材预期: '情绪类',
  共振强度: '共振类',
  板块预期: '共振类',
  龙头地位: '共振类',
  量价配合: '共振类',
  筹码健康: '共振类',
}

export default function StockScreener({ method }: Props) {
  const [stockCode, setStockCode] = useState('')
  const [entryPrice, setEntryPrice] = useState('')
  const [result, setResult] = useState<StockScore | null>(null)

  const handleGrade = () => {
    const price = parseFloat(entryPrice)
    if (!stockCode || stockCode.length < 6 || !price || price <= 0) return

    const snapshot = {
      code: stockCode.slice(0, 6),
      name: `股票${stockCode.slice(0, 6)}`,
      price,
      changePct: 3.5,
      turnoverRate: 8.2,
      volume: 5e8,
      prevVolume: 3.8e8,
      marketCap: 5e10,
      isLimitUp: true,
      sectorRank: 1,
      consecutiveBoards: stockCode.length >= 6 ? 2 : 0,
      hasGapUp: true,
    }

    const r = screenStock(snapshot, method as '题材类' | '情绪类' | '共振类')
    setResult(r)
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h3 className="text-text-secondary text-xs uppercase tracking-wider mb-3">个股筛选</h3>

      <div className="space-y-3 mb-4">
        <input
          type="text"
          placeholder="6位股票代码"
          maxLength={6}
          value={stockCode}
          onChange={(e) => setStockCode(e.target.value.replace(/\D/, '').slice(0, 6))}
          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent"
        />
        <input
          type="number"
          placeholder="入场价格"
          value={entryPrice}
          onChange={(e) => setEntryPrice(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-accent"
        />
      </div>

      <button
        onClick={handleGrade}
        className="w-full bg-accent text-bg rounded-full px-6 py-2 text-sm font-bold hover:opacity-90 transition-opacity"
      >
        打分
      </button>

      {result && (
        <div className="mt-5 pt-4 border-t border-border">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-text-primary">{result.total}</div>
            <div className="text-xs text-text-secondary mt-1">{result.method}</div>
          </div>

          <div className="space-y-2">
            {Object.entries(result.dimensions).map(([dim, scoreVal]) => (
              <div key={dim}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">{dim}</span>
                  <span className="text-text-primary font-semibold">{scoreVal}</span>
                </div>
                <div className="h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-accent-green transition-all duration-500"
                    style={{ width: `${scoreVal}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {result.details.length > 0 && (
            <div className="mt-4 space-y-1">
              {result.details.map((d, i) => (
                <p key={i} className="text-xs text-text-secondary">{d}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
