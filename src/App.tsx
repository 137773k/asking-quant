import { useMarketData } from './hooks/useMarketData'
import { scoreMarket } from './engine/marketState'
import MarketDashboard from './components/MarketDashboard'
import StockScreener from './components/StockScreener'
import SellPanel from './components/SellPanel'
import PositionCalc from './components/PositionCalc'

export default function App() {
  const { data, loading, error, useMock, toggleMock, isRealData } = useMarketData()
  const marketScore = data ? scoreMarket(data) : null

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        <h1 className="text-3xl font-bold text-accent mb-6 text-center">
          ASking 量化选股
        </h1>

        {loading && (
          <div className="text-text-secondary text-sm mb-4">加载中...</div>
        )}
        {error && (
          <div className="text-accent-red text-sm mb-4">{error}</div>
        )}

        {data && marketScore && (
          <>
            <MarketDashboard
              data={data}
              score={marketScore}
              useMock={useMock}
              onToggleMock={toggleMock}
              isRealData={isRealData}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <StockScreener method={marketScore.method} />
              <SellPanel marketScore={marketScore.total} />
              <PositionCalc score={marketScore.total} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
