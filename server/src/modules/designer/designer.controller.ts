import { Request, Response, NextFunction } from "express";
import { designerService } from "./designer.service";
import { sendResponse } from "../../utils/response";
import { AppError } from "../../utils/app-error";

export class DesignerController {
  async saveDesign(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, "Please log in to save designs.");
      }
      const design = await designerService.saveDesign(req.user.id, req.body);
      return sendResponse(res, 201, "Design saved successfully.", design);
    } catch (error) {
      next(error);
    }
  }

  async getCustomerDesigns(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, "Please log in.");
      }
      const designs = await designerService.getCustomerDesigns(req.user.id);
      return sendResponse(res, 200, "Saved designs retrieved.", designs);
    } catch (error) {
      next(error);
    }
  }

  async getDesignById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, "Please log in.");
      }
      const design = await designerService.getDesignById(
        req.params.id,
        req.user.id
      );
      return sendResponse(res, 200, "Design retrieved.", design);
    } catch (error) {
      next(error);
    }
  }

  async deleteDesign(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, "Please log in.");
      }
      const result = await designerService.deleteDesign(
        req.params.id,
        req.user.id
      );
      return sendResponse(res, 200, "Design deleted successfully.", result);
    } catch (error) {
      next(error);
    }
  }

  async uploadArtwork(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(400, "No artwork file uploaded.");
      }
      const fileUrl = `/uploads/${req.file.filename}`;
      return sendResponse(res, 200, "Artwork uploaded successfully.", {
        fileUrl,
        originalName: req.file.originalname,
        sizeBytes: req.file.size,
        mimeType: req.file.mimetype,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const designerController = new DesignerController();
