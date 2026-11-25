import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { sendResponse } from "../../utils/response";
import { AppError } from "../../utils/app-error";

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return sendResponse(res, 201, "Account registered successfully.", result);
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      return sendResponse(res, 200, "Logged in successfully.", result);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, "Not authenticated.");
      }
      const user = await authService.getMe(req.user.id);
      return sendResponse(res, 200, "Current profile retrieved.", { user });
    } catch (error) {
      next(error);
    }
  }

  async logout(_req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie("token");
      return sendResponse(res, 200, "Logged out successfully.", null);
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
