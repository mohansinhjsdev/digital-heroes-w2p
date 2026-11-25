import { Request, Response, NextFunction } from "express";
import { productsService } from "./products.service";
import { sendResponse } from "../../utils/response";

export class ProductsController {
  async getAllDivisions(_req: Request, res: Response, next: NextFunction) {
    try {
      const divisions = await productsService.getAllDivisions();
      return sendResponse(
        res,
        200,
        "Product divisions retrieved successfully.",
        divisions
      );
    } catch (error) {
      next(error);
    }
  }

  async getDivisionBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const { slug } = req.params;
      const division = await productsService.getDivisionBySlug(slug);
      return sendResponse(
        res,
        200,
        `Division '${slug}' retrieved successfully.`,
        division
      );
    } catch (error) {
      next(error);
    }
  }

  async updateDivision(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updated = await productsService.updateDivision(id, req.body);
      return sendResponse(
        res,
        200,
        "Product division updated successfully.",
        updated
      );
    } catch (error) {
      next(error);
    }
  }
}

export const productsController = new ProductsController();
