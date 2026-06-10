import { StockSnapshot, SellCheck } from './types';

export function checkSellSignals(
  stock: StockSnapshot,
  entryPrice: number,
  marketScore: number,
  leaderBlownUp: boolean,
  followerStatus: string
): SellCheck {
  // --- Stop loss ---
  const hardStopThreshold =
    marketScore >= 70 ? 0.07 : marketScore >= 40 ? 0.05 : 0.03;
  const lossPct = ((entryPrice - stock.price) / entryPrice) * 100;

  let stopLossTriggered = false;
  let stopLossLevel = '';
  let stopLossReason = '';

  if (lossPct >= 2) {
    stopLossTriggered = true;
    stopLossLevel = '2%硬止损';
    stopLossReason = `亏损${lossPct.toFixed(2)}%达单笔2%上限`;
  } else if (stock.price <= entryPrice * (1 - hardStopThreshold)) {
    stopLossTriggered = true;
    stopLossLevel = '市场阈值止损';
    stopLossReason = `跌破${(hardStopThreshold * 100).toFixed(0)}%止损线(市场评分${marketScore})`;
  }

  // --- Trailing stop ---
  const profitPct = ((stock.price - entryPrice) / entryPrice) * 100;
  let trailingTriggered = false;
  let trailingAction = '';

  if (profitPct >= 30) {
    trailingTriggered = true;
    trailingAction = '最高点回撤10%跟踪';
  } else if (profitPct >= 20) {
    trailingTriggered = true;
    trailingAction = '5日线跟踪';
  } else if (profitPct >= 10) {
    trailingTriggered = true;
    trailingAction = '止损移至浮盈5%';
  } else if (profitPct >= 5) {
    trailingTriggered = true;
    trailingAction = '止损移至成本价(保本)';
  }

  // --- Time stop ---
  // Not triggered — requires real holding days from position data
  const timeStopTriggered = false;
  const timeStopDeadline = '';

  // --- Sector link ---
  let sectorTriggered = false;
  let sectorAction = '';

  if (leaderBlownUp) {
    if (followerStatus === 'green') {
      sectorTriggered = true;
      sectorAction = '15分钟内不回封则全清';
    } else if (followerStatus === 'red') {
      sectorTriggered = true;
      sectorAction = '5分钟内全清';
    } else if (followerStatus.includes('drop')) {
      sectorTriggered = true;
      sectorAction = '减半仓';
    }
  }

  return {
    stopLoss: { triggered: stopLossTriggered, level: stopLossLevel, reason: stopLossReason },
    trailingStop: { triggered: trailingTriggered, action: trailingAction },
    timeStop: { triggered: timeStopTriggered, deadline: timeStopDeadline },
    sectorLink: { triggered: sectorTriggered, action: sectorAction },
  };
}
