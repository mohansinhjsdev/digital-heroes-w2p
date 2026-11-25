import { Request, Response, NextFunction } from "express";
import { printEngineService } from "./print-engine.service";
import { sendResponse } from "../../utils/response";
import { AppError } from "../../utils/app-error";
import { Role } from "@prisma/client";

export class PrintEngineController {
  async generatePrintFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId, designState, csvContent } = req.body;
      const result = await printEngineService.generateOrderPrintFiles(
        orderId,
        designState,
        csvContent
      );
      return sendResponse(
        res,
        201,
        "Production print-ready file generated successfully.",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  async getOrderFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const isAdmin = req.user?.role === Role.ADMIN;
      const files = await printEngineService.getOrderFiles(orderId, isAdmin);
      return sendResponse(res, 200, "Order files retrieved.", files);
    } catch (error) {
      next(error);
    }
  }

  async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const isAdmin = req.user?.role === Role.ADMIN;
      const { file, physicalPath } = await printEngineService.downloadFile(
        fileId,
        isAdmin
      );

      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${file.fileName}"`
      );
      res.setHeader("Content-Type", "application/pdf");
      return res.sendFile(physicalPath);
    } catch (error) {
      next(error);
    }
  }
}

export const printEngineController = new PrintEngineController();
