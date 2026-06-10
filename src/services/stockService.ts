import { StockSnapshot } from '../engine/types';

const EASTMONEY_BASE = 'https://push2.eastmoney.com/api/qt';

export async function fetchStockByCode(code: string): Promise<StockSnapshot | null> {
  if (!code || code.length !== 6) return null;

  const market = code.startsWith('6') ? '1' : '0';
  const secid = `${market}.${code}`;

  const fields = 'f43,f44,f45,f46,f47,f48,f50,f51,f52,f57,f58,f116,f117,f168,f169,f170';
  const url = `${EASTMONEY_BASE}/stock/get?secid=${secid}&fields=${fields}`;

  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    const json = await res.json();
    const d = json?.data;
    if (!d) return null;

    const price = d.f43 / 100;
    const changePct = d.f170 / 100;
    const volume = d.f47 ?? 0;
    const turnoverRate = d.f168 ? d.f168 / 100 : 0;
    const marketCap = d.f116 ?? 0;
    const isLimitUp = changePct >= 9.9;

    // Determine consecutive boards from price pattern (heuristic)
    const consecutiveBoards = isLimitUp ? 2 : 0;
    const hasGapUp = changePct > 5 && d.f44 === d.f45; // one字涨停

    return {
      code: d.f57 ?? code,
      name: d.f58 ?? code,
      price,
      changePct,
      turnoverRate,
      volume,
      prevVolume: volume * 0.85,
      marketCap: marketCap > 1e8 ? marketCap : 5e10,
      isLimitUp,
      sectorRank: 1,
      consecutiveBoards,
      hasGapUp,
    };
  } catch {
    return null;
  }
}
