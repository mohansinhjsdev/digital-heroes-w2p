import { Request, Response, NextFunction } from "express";
import { pricingService } from "./pricing.service";
import { sendResponse } from "../../utils/response";

export class PricingController {
  async calculatePrice(req: Request, res: Response, next: NextFunction) {
    try {
      const breakdown = await pricingService.calculatePrice(req.body);
      return sendResponse(
        res,
        200,
        "Instant price calculated successfully.",
        breakdown
      );
    } catch (error) {
      next(error);
    }
  }
}

export const pricingController = new PricingController();
