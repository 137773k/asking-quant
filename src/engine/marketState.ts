import { MarketSnapshot, MarketScore } from './types';

function scoreDimension(label: string, value: number, brackets: [number, number][]): number {
  for (const [threshold, score] of brackets) {
    if (value >= threshold) return score;
  }
  return 0;
}

function scoreDimensionInverse(label: string, value: number, brackets: [number, number][]): number {
  for (const [threshold, score] of brackets) {
    if (value <= threshold) return score;
  }
  return 0;
}

export function scoreMarket(data: MarketSnapshot): MarketScore {
  const dimensions: Record<string, number> = {};

  const udRatio = data.downCount > 0 ? data.upCount / data.downCount : 99;
  dimensions['涨跌家数比'] = scoreDimension('涨跌家数比', udRatio, [
    [2.5, 10], [1.5, 7], [1.0, 4], [0.5, 2],
  ]);

  dimensions['涨停家数'] = scoreDimension('涨停家数', data.limitUpCount, [
    [80, 10], [50, 7], [30, 4], [15, 2],
  ]);

  dimensions['跌停家数'] = scoreDimensionInverse('跌停家数', data.limitDownCount, [
    [10, 15], [20, 10], [30, 5], [50, 2],
  ]);

  dimensions['连板晋级率'] = scoreDimension('连板晋级率', data.consecutiveUpRate, [
    [40, 20], [30, 14], [20, 8], [10, 4],
  ]);

  dimensions['昨日涨停红盘率'] = scoreDimension('昨日涨停红盘率', data.prevLimitUpRedRate, [
    [65, 15], [55, 10], [45, 5], [35, 2],
  ]);

  dimensions['炸板率'] = scoreDimensionInverse('炸板率', data.bustRate, [
    [25, 10], [35, 7], [45, 3], [55, 1],
  ]);

  dimensions['核心龙头反馈'] = 5;
  dimensions['主线持续性'] = 5;

  const total = Object.values(dimensions).reduce((s, v) => s + v, 0);

  let state: MarketScore['state'];
  if (total <= 40) state = '退潮';
  else if (total <= 55) state = '弱修复';
  else if (total <= 70) state = '轮动';
  else if (total <= 85) state = '强赚钱';
  else state = '高潮';

  const method: MarketScore['method'] =
    state === '退潮' ? '情绪类'
    : state === '弱修复' || state === '轮动' ? '题材类'
    : '共振类';

  const positionAdvice: Record<MarketScore['state'], string> = {
    '退潮': '空仓',
    '弱修复': '小仓试错',
    '轮动': '3-5成',
    '强赚钱': '5-7成',
    '高潮': '有先手持仓不追',
  };

  return { total, dimensions, state, method, positionAdvice: positionAdvice[state] };
}
