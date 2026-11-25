import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/app-error";
import { config } from "../config/env";

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal Server Error";

  if (config.nodeEnv !== "production") {
    // eslint-disable-next-line no-console
    console.error("❌ Error Handler Caught:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(config.nodeEnv !== "production" && { stack: err.stack }),
  });
};
