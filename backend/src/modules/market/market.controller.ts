import { Request, Response, NextFunction } from 'express';
import { MarketService } from './market.service';
import { sendSuccess } from '../../shared/utils/response';

export class MarketController {
  static async getAllStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const { search, sector } = req.query;
      const stocks = await MarketService.getAllStocks(search as string, sector as string);
      return sendSuccess(res, stocks, 'Market stock quotes retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getStockBySymbol(req: Request, res: Response, next: NextFunction) {
    try {
      const { symbol } = req.params;
      const stock = await MarketService.getStockBySymbol(symbol);
      return sendSuccess(res, stock, `Quote for ${symbol.toUpperCase()} retrieved`);
    } catch (error) {
      next(error);
    }
  }

  static async getStockHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { symbol } = req.params;
      const { timeframe } = req.query;
      const history = await MarketService.getStockHistory(symbol, timeframe as string);
      return sendSuccess(res, history, `Price history for ${symbol.toUpperCase()}`);
    } catch (error) {
      next(error);
    }
  }

  static async tickPrices(req: Request, res: Response, next: NextFunction) {
    try {
      const updatedStocks = await MarketService.tickPrices();
      return sendSuccess(res, updatedStocks, 'Market price ticks generated');
    } catch (error) {
      next(error);
    }
  }
}
