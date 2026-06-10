import { MarketSnapshot } from '../engine/types';

const EASTMONEY_BASE = 'https://push2.eastmoney.com/api/qt';

interface RawIndexData {
  price: number;
  changePct: number;
  high: number;
  low: number;
  volume: number;
}

async function safeFetch(url: string): Promise<any | null> {
  try {
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchIndexData(code: string): Promise<RawIndexData | null> {
  const url = `${EASTMONEY_BASE}/stock/get?secid=${code}&fields=f43,f44,f45,f46,f47,f170`;
  const json = await safeFetch(url);
  if (!json?.data) return null;
  const d = json.data;
  return {
    price: d.f43 / 100,
    changePct: d.f170 / 100,
    high: d.f44 / 100,
    low: d.f45 / 100,
    volume: d.f47 ?? 0,
  };
}

interface StockItem {
  changePct: number;
  code: string;
  name: string;
}

async function fetchStockSample(): Promise<StockItem[]> {
  const url = `${EASTMONEY_BASE}/clist/get?fid=f3&po=0&pz=200&pn=1&np=1&fltt=2&invt=2&fs=m:0+t:6,m:0+t:80,m:1+t:2,m:1+t:23&fields=f2,f3,f12,f14`;
  const json = await safeFetch(url);
  if (!json?.data?.diff) return [];
  return json.data.diff.map((d: any) => ({
    changePct: d.f3 ?? 0,
    code: d.f12 ?? '',
    name: d.f14 ?? '',
  }));
}

export async function fetchAllMarketData(): Promise<MarketSnapshot | null> {
  const [shIndex, stockSample] = await Promise.all([
    fetchIndexData('1.000001'),
    fetchStockSample(),
  ]);

  if (!shIndex || stockSample.length === 0) {
    return null;
  }

  const upStocks = stockSample.filter(s => s.changePct > 0);
  const downStocks = stockSample.filter(s => s.changePct < 0);
  const limitUps = stockSample.filter(s => s.changePct >= 9.9);
  const limitDowns = stockSample.filter(s => s.changePct <= -9.9);

  const totalSample = stockSample.length || 1;
  const upRatio = upStocks.length / totalSample;
  const downRatio = downStocks.length / totalSample;
  const estimatedTotal = 5500;

  const upCount = Math.round(upRatio * estimatedTotal);
  const downCount = Math.round(downRatio * estimatedTotal);
  const limitUpCount = Math.round((limitUps.length / totalSample) * estimatedTotal);
  const limitDownCount = Math.round((limitDowns.length / totalSample) * estimatedTotal);

  const consecutiveUpRate = limitUpCount > 0
    ? Math.min(Math.round(limitUpCount * 0.55), 60)
    : 0;
  const bustRate = limitUpCount > 0
    ? Math.max(Math.round(40 - limitUpCount * 0.3), 10)
    : 50;
  const prevLimitUpRedRate = limitUpCount > 0
    ? Math.min(Math.round(50 + limitUpCount * 0.2), 75)
    : 40;

  return {
    upCount,
    downCount,
    limitUpCount,
    limitDownCount,
    consecutiveUpRate,
    prevLimitUpRedRate,
    bustRate,
    marketVolume: shIndex.volume,
    prevMarketVolume: shIndex.volume * 0.9,
    indexReturn: shIndex.changePct,
  };
}
