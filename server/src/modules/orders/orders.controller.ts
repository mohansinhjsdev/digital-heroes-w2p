import { Request, Response, NextFunction } from "express";
import { ordersService } from "./orders.service";
import { sendResponse } from "../../utils/response";
import { AppError } from "../../utils/app-error";
import { Role } from "@prisma/client";

export class OrdersController {
  async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, "Please log in to place an order.");
      const order = await ordersService.createOrder(req.user.id, req.body);
      return sendResponse(
        res,
        201,
        `Order ${order.orderNumber} created successfully.`,
        order
      );
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, "Please log in.");
      const order = await ordersService.reorder(
        req.params.orderId,
        req.user.id,
        req.body
      );
      return sendResponse(
        res,
        201,
        `Reorder placed successfully: ${order.orderNumber}`,
        order
      );
    } catch (error) {
      next(error);
    }
  }

  async getCustomerOrders(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, "Please log in.");
      const orders = await ordersService.getCustomerOrders(req.user.id);
      return sendResponse(res, 200, "Customer orders retrieved.", orders);
    } catch (error) {
      next(error);
    }
  }

  async getOrderById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new AppError(401, "Please log in.");
      const isAdmin = req.user.role === Role.ADMIN;
      const order = await ordersService.getOrderById(
        req.params.orderId,
        req.user.id,
        isAdmin
      );
      return sendResponse(res, 200, "Order details retrieved.", order);
    } catch (error) {
      next(error);
    }
  }

  async updateOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await ordersService.updateOrderStatus(
        req.params.orderId,
        req.body
      );
      return sendResponse(
        res,
        200,
        `Order stage advanced to ${updated.status}.`,
        updated
      );
    } catch (error) {
      next(error);
    }
  }

  async getAdminPipeline(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await ordersService.getAdminPipeline(req.query as any);
      return sendResponse(res, 200, "Admin production pipeline retrieved.", orders);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await ordersService.getAnalytics();
      return sendResponse(res, 200, "Production analytics retrieved.", analytics);
    } catch (error) {
      next(error);
    }
  }
}

export const ordersController = new OrdersController();
