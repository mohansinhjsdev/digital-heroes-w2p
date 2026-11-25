import { Request, Response, NextFunction } from "express";
import { proofsService } from "./proofs.service";
import { sendResponse } from "../../utils/response";
import { AppError } from "../../utils/app-error";

export class ProofsController {
  async getOrderProofs(req: Request, res: Response, next: NextFunction) {
    try {
      const { orderId } = req.params;
      const proofs = await proofsService.getOrderProofs(orderId);
      return sendResponse(res, 200, "Order proof history retrieved.", proofs);
    } catch (error) {
      next(error);
    }
  }

  async createProofRevision(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, "Not authenticated.");
      const { orderId } = req.params;
      const revision = await proofsService.createProofRevision(
        orderId,
        req.user.id,
        req.body
      );
      return sendResponse(
        res,
        201,
        `Proof v${revision.version} created successfully.`,
        revision
      );
    } catch (error) {
      next(error);
    }
  }

  async requestChanges(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, "Not authenticated.");
      const { revisionId } = req.params;
      const updated = await proofsService.requestChanges(
        revisionId,
        req.user.id,
        req.body
      );
      return sendResponse(
        res,
        200,
        "Change request logged and forwarded to production.",
        updated
      );
    } catch (error) {
      next(error);
    }
  }

  async approveProof(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, "Not authenticated.");
      const { revisionId } = req.params;
      const updated = await proofsService.approveProof(
        revisionId,
        req.user.id
      );
      return sendResponse(
        res,
        200,
        "Proof approved! Production files unlocked.",
        updated
      );
    } catch (error) {
      next(error);
    }
  }
}

export const proofsController = new ProofsController();
