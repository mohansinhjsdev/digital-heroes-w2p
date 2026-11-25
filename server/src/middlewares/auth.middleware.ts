import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { AppError } from "../utils/app-error";
import { Role } from "@prisma/client";

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
  companyName?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUserPayload;
    }
  }
}

export const authenticateUser = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError(401, "Authentication required. Please log in.");
    }

    const decoded = jwt.verify(
      token,
      config.jwtSecret
    ) as AuthenticatedUserPayload;

    req.user = decoded;
    next();
  } catch (err: any) {
    if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
      next(new AppError(401, "Invalid or expired session token."));
    } else {
      next(err);
    }
  }
};

export const optionalAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    let token: string | undefined;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = jwt.verify(
        token,
        config.jwtSecret
      ) as AuthenticatedUserPayload;
      req.user = decoded;
    }
    next();
  } catch {
    next();
  }
};

export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError(401, "Unauthorized access."));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AppError(
          403,
          `Forbidden: Role '${req.user.role}' does not have sufficient permission.`
        )
      );
    }
    next();
  };
};
