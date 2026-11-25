import { Response } from "express";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, any>;
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T,
  meta?: Record<string, any>
): Response => {
  const body: ApiResponse<T> = {
    success: statusCode >= 200 && statusCode < 300,
    message,
    data,
    meta,
  };
  return res.status(statusCode).json(body);
};
