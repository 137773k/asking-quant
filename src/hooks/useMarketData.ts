import { MarketSnapshot } from '../engine/types';
import { useState, useEffect, useCallback } from 'react';
import { fetchAllMarketData } from '../services/dataService';

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

export function useMarketData() {
  const [data, setData] = useState<MarketSnapshot | null>(MOCK_DATA);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMock, setUseMock] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  const toggleMock = useCallback(() => {
    setUseMock((prev) => !prev);
  }, []);

  useEffect(() => {
    if (useMock) {
      setData(MOCK_DATA);
      setLoading(false);
      setError(null);
      setIsRealData(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAllMarketData()
      .then((snapshot) => {
        if (cancelled) return;
        if (snapshot) {
          setData(snapshot);
          setIsRealData(true);
        } else {
          setData(MOCK_DATA);
          setIsRealData(false);
          setError('API数据获取失败，已回退到模拟数据');
        }
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setData(MOCK_DATA);
        setIsRealData(false);
        setError(err instanceof Error ? err.message : '数据获取失败');
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [useMock]);

  return { data, loading, error, useMock, toggleMock, isRealData };
}
