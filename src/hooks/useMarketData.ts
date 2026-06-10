import { MarketSnapshot } from '../engine/types';
import { useState, useEffect, useCallback } from 'react';

const MOCK_DATA: MarketSnapshot = {
  upCount: 3200,
  downCount: 1800,
  limitUpCount: 62,
  limitDownCount: 14,
  consecutiveUpRate: 35,
  prevLimitUpRedRate: 58,
  bustRate: 28,
  marketVolume: 2.747e10,
  prevMarketVolume: 2.5e10,
  indexReturn: -0.42,
};

function buildMarketSnapshot(json: any): MarketSnapshot {
  const data = json?.data;

  if (!data) return MOCK_DATA;

  const upCount = data.upCount ?? data.advancingCount ?? 0;
  const downCount = data.downCount ?? data.decliningCount ?? 0;
  const limitUpCount = data.limitUpCount ?? data.limitUp ?? 0;
  const limitDownCount = data.limitDownCount ?? data.limitDown ?? 0;
  const total = upCount + downCount || 1;

  return {
    upCount,
    downCount,
    limitUpCount,
    limitDownCount,
    consecutiveUpRate: data.consecutiveUpRate ?? data.consecutiveUp ?? 0,
    prevLimitUpRedRate: data.prevLimitUpRedRate ?? data.prevLimitUpRed ?? 58,
    bustRate: data.bustRate ?? data.breakRate ?? 0,
    marketVolume: data.marketVolume ?? data.totalVolume ?? 0,
    prevMarketVolume: data.prevMarketVolume ?? data.preTotalVolume ?? 2.5e10,
    indexReturn: data.indexReturn ?? data.shIndexReturn ?? 0,
  };
}

export function useMarketData() {
  const [data, setData] = useState<MarketSnapshot | null>(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(true);

  const toggleMock = useCallback(() => {
    setUseMock((prev) => !prev);
  }, []);

  useEffect(() => {
    if (useMock) {
      setData(MOCK_DATA);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(
      'https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&fields=f2,f3,f4,f12,f14&secids=1.000001,0.399001,0.399006',
    )
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const snapshot = buildMarketSnapshot(json);
        setData(snapshot);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        setData(MOCK_DATA);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [useMock]);

  return { data, loading, error, useMock, toggleMock };
}
