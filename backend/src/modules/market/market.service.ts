import { prisma } from '../../shared/db/prisma';

export class MarketService {
  /**
   * Retrieves all available stocks with calculated metrics & sorting
   */
  static async getAllStocks(search?: string, sector?: string) {
    const where: any = {};

    if (search) {
      where.OR = [
        { symbol: { contains: search.toUpperCase() } },
        { name: { contains: search } },
      ];
    }

    if (sector && sector !== 'ALL') {
      where.sector = sector;
    }

    const stocks = await prisma.stock.findMany({
      where,
      orderBy: { volume: 'desc' },
    });

    return stocks;
  }

  /**
   * Retrieves a single stock by symbol
   */
  static async getStockBySymbol(symbol: string) {
    const stock = await prisma.stock.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!stock) {
      throw { status: 404, message: `Stock with symbol '${symbol}' not found` };
    }

    return stock;
  }

  /**
   * Generates realistic simulated historical price candles / sparklines for chart display
   */
  static async getStockHistory(symbol: string, timeframe = '1D') {
    const stock = await this.getStockBySymbol(symbol);
    const pointsCount = timeframe === '1D' ? 40 : 60;
    const basePrice = stock.openPrice;
    const current = stock.currentPrice;

    const dataPoints = [];
    let walkingPrice = basePrice;
    const now = Date.now();
    const intervalMs = (6.5 * 60 * 60 * 1000) / pointsCount; // 6.5 trading hours

    for (let i = 0; i < pointsCount; i++) {
      const time = new Date(now - (pointsCount - i) * intervalMs).toISOString();
      const progress = i / pointsCount;
      const targetTrend = basePrice + (current - basePrice) * progress;
      const noise = (Math.sin(i * 0.8) + (Math.random() - 0.5)) * (basePrice * 0.004);
      walkingPrice = targetTrend + noise;

      dataPoints.push({
        time,
        price: Number(walkingPrice.toFixed(2)),
        high: Number((walkingPrice * (1 + Math.random() * 0.003)).toFixed(2)),
        low: Number((walkingPrice * (1 - Math.random() * 0.003)).toFixed(2)),
        volume: Math.floor(Math.random() * 15000) + 1000,
      });
    }

    // Set last point strictly to currentPrice
    dataPoints[dataPoints.length - 1].price = current;

    return {
      symbol: stock.symbol,
      currentPrice: stock.currentPrice,
      previousClose: stock.previousClose,
      dataPoints,
    };
  }

  /**
   * Simulates micro price fluctuations across the market catalog (for live demo tickers)
   */
  static async tickPrices() {
    const stocks = await prisma.stock.findMany();

    const updates = stocks.map((stk) => {
      // Small random delta between -0.3% and +0.3%
      const deltaPercent = (Math.random() - 0.49) * 0.6;
      const newPrice = Math.max(1.0, Number((stk.currentPrice * (1 + deltaPercent / 100)).toFixed(2)));
      const high = Math.max(stk.highPrice, newPrice);
      const low = Math.min(stk.lowPrice, newPrice);
      const changePercent = Number((((newPrice - stk.previousClose) / stk.previousClose) * 100).toFixed(2));

      return prisma.stock.update({
        where: { id: stk.id },
        data: {
          currentPrice: newPrice,
          highPrice: high,
          lowPrice: low,
          changePercent,
          volume: stk.volume + Math.floor(Math.random() * 100),
        },
      });
    });

    await prisma.$transaction(updates);
    return await prisma.stock.findMany({ orderBy: { volume: 'desc' } });
  }
}
