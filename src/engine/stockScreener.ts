import { StockSnapshot, StockScore } from './types';

function turnoverScore(turnoverRate: number): number {
  if (turnoverRate >= 18 && turnoverRate <= 25) return 100;
  if ((turnoverRate >= 14 && turnoverRate < 18) || (turnoverRate > 25 && turnoverRate <= 35)) return 75;
  if (turnoverRate >= 8 && turnoverRate < 14) return 50;
  return 25;
}

export function screenStock(stock: StockSnapshot, method: string): StockScore {
  const dims: Record<string, { score: number; weight: number }> = {};

  if (method === '题材类') {
    dims['炒作偏好'] = {
      score: stock.marketCap > 500e8 && stock.volume > stock.prevVolume * 1.1 ? 85
           : stock.marketCap < 100e8 ? 70 : 50,
      weight: 0.25,
    };

    dims['板块地位'] = {
      score: stock.sectorRank === 1 ? 100
           : stock.sectorRank === 2 ? 85
           : stock.sectorRank === 3 ? 70
           : stock.sectorRank <= 5 ? 50 : 30,
      weight: 0.25,
    };

    dims['筹码'] = { score: turnoverScore(stock.turnoverRate), weight: 0.20 };

    dims['人气'] = {
      score: stock.changePct >= 3 && stock.changePct <= 7 ? 100
           : (stock.changePct >= 0 && stock.changePct < 3) || (stock.changePct > 7 && stock.changePct <= 10) ? 70
           : stock.changePct < 0 ? 30 : 50,
      weight: 0.15,
    };

    dims['拉升性价比'] = {
      score: stock.changePct > 0 && stock.turnoverRate > 15 ? 70 : 40,
      weight: 0.15,
    };
  } else if (method === '情绪类') {
    let heightScore: number;
    if (stock.consecutiveBoards >= 3) heightScore = 100;
    else if (stock.consecutiveBoards === 2) heightScore = 80;
    else if (stock.consecutiveBoards === 1) heightScore = 60;
    else heightScore = 30;
    if (stock.hasGapUp) heightScore = Math.min(heightScore, 40);

    dims['高度'] = { score: heightScore, weight: 0.50 };
    dims['筹码'] = { score: turnoverScore(stock.turnoverRate), weight: 0.30 };
    dims['题材预期'] = { score: 60, weight: 0.20 };
  } else if (method === '共振类') {
    dims['共振强度'] = {
      score: stock.volume > stock.prevVolume * 1.1 && stock.changePct > 0 ? 85 : 50,
      weight: 0.30,
    };

    dims['板块预期'] = { score: 65, weight: 0.25 };

    dims['龙头地位'] = {
      score: stock.sectorRank === 1 || stock.sectorRank === 2 ? 90
           : stock.sectorRank === 3 ? 70 : 40,
      weight: 0.20,
    };

    const volumeRatio = stock.volume / stock.prevVolume;
    dims['量价配合'] = {
      score: volumeRatio > 1.5 ? 100 : volumeRatio > 1.2 ? 80 : volumeRatio > 1.0 ? 60 : 30,
      weight: 0.15,
    };

    dims['筹码健康'] = { score: turnoverScore(stock.turnoverRate), weight: 0.10 };
  }

  const total = Math.round(
    Object.values(dims).reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  return {
    total,
    method: method as StockScore['method'],
    dimensions: Object.fromEntries(Object.entries(dims).map(([k, v]) => [k, v.score])),
    details: Object.entries(dims).map(([k, v]) => `${k}: ${v.score} (weight ${v.weight})`),
  };
}
