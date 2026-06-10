export interface MarketSnapshot {
  upCount: number;
  downCount: number;
  limitUpCount: number;
  limitDownCount: number;
  consecutiveUpRate: number;
  prevLimitUpRedRate: number;
  bustRate: number;
  marketVolume: number;
  prevMarketVolume: number;
  indexReturn: number;
}

export interface MarketScore {
  total: number;
  dimensions: Record<string, number>;
  state: '退潮' | '弱修复' | '轮动' | '强赚钱' | '高潮';
  method: '情绪类' | '题材类' | '共振类';
  positionAdvice: string;
}

export interface StockSnapshot {
  code: string;
  name: string;
  price: number;
  changePct: number;
  turnoverRate: number;
  volume: number;
  prevVolume: number;
  marketCap: number;
  isLimitUp: boolean;
  sectorRank: number;
  consecutiveBoards: number;
  hasGapUp: boolean;
}

export interface StockScore {
  total: number;
  method: '题材类' | '情绪类' | '共振类';
  dimensions: Record<string, number>;
  details: string[];
}

export interface SellCheck {
  stopLoss: {
    triggered: boolean;
    level: string;
    reason: string;
  };
  trailingStop: {
    triggered: boolean;
    action: string;
  };
  timeStop: {
    triggered: boolean;
    deadline: string;
  };
  sectorLink: {
    triggered: boolean;
    action: string;
  };
}
