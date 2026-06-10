import { useState } from 'react'
import type { StockScore, StockSnapshot } from '../engine/types'
import { screenStock } from '../engine/stockScreener'
import { fetchStockByCode } from '../services/stockService'

interface Props {
  method: string
}

export default function StockScreener({ method }: Props) {
  const [stockCode, setStockCode] = useState('')
  const [entryPrice, setEntryPrice] = useState('')
  const [result, setResult] = useState<StockScore | null>(null)
  const [loading, setLoading] = useState(false)
  const [stockName, setStockName] = useState('')
  const [isReal, setIsReal] = useState(false)

  const handleGrade = async () => {
    const price = parseFloat(entryPrice)
    if (!stockCode || stockCode.length < 6 || !price || price <= 0) return

    setLoading(true)
    setResult(null)

    // Try real data first
    const realStock = await fetchStockByCode(stockCode.slice(0, 6))

    let snapshot: StockSnapshot
    if (realStock) {
      snapshot = realStock
      setStockName(realStock.name)
      setIsReal(true)
    } else {
      // Mock fallback
      snapshot = {
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
        consecutiveBoards: 2,
        hasGapUp: false,
      }
      setStockName(snapshot.name)
      setIsReal(false)
    }

    const r = screenStock(snapshot, method as '题材类' | '情绪类' | '共振类')
    setResult(r)
    setLoading(false)
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h3 className="text-text-secondary text-xs uppercase tracking-wider mb-3">
        个股筛选 {stockName && <span className="text-accent">· {stockName}</span>}
      </h3>

      <div className="space-y-3 mb-4">
        <input
          type="text"
          placeholder="6位股票代码 (如600519)"
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
        disabled={loading}
        className="w-full bg-accent text-bg rounded-full px-6 py-2 text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? '获取数据中...' : '打分'}
      </button>

      {isReal && (
        <div className="mt-2 text-xs text-accent-green text-center">实时数据</div>
      )}

      {result && (
        <div className="mt-5 pt-4 border-t border-border">
          <div className="text-center mb-4">
            <div className="text-4xl font-bold text-text-primary">{result.total}</div>
            <div className="text-xs text-text-secondary mt-1">
              {result.method} {isReal ? '· 实时' : '· 模拟'}
            </div>
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
