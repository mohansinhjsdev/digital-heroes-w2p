import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { config } from "./config/env";
import { errorHandler } from "./middlewares/error.middleware";

// Module routes
import authRoutes from "./modules/auth/auth.routes";
import productsRoutes from "./modules/products/products.routes";
import pricingRoutes from "./modules/pricing/pricing.routes";
import designerRoutes from "./modules/designer/designer.routes";
import printEngineRoutes from "./modules/print-engine/print-engine.routes";
import proofsRoutes from "./modules/proofs/proofs.routes";
import ordersRoutes from "./modules/orders/orders.routes";

export const createApp = (): Application => {
  const app = express();

  // Standard Middlewares
  app.use(
    cors({
      origin: [config.clientUrl, "http://localhost:5173", "http://localhost:3000"],
      credentials: true,
    })
  );
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));
  app.use(cookieParser());

  // Static files for uploaded artwork and generated print outputs
  app.use("/uploads", express.static(config.uploadDir));
  app.use("/outputs", express.static(config.outputDir));

  // Health check
  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      status: "healthy",
      service: "Digital Heroes Web-to-Print API Server",
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  // API v1 Routes
  const API_PREFIX = "/api/v1";
  app.use(`${API_PREFIX}/auth`, authRoutes);
  app.use(`${API_PREFIX}/products`, productsRoutes);
  app.use(`${API_PREFIX}/pricing`, pricingRoutes);
  app.use(`${API_PREFIX}/designer`, designerRoutes);
  app.use(`${API_PREFIX}/print-engine`, printEngineRoutes);
  app.use(`${API_PREFIX}/proofs`, proofsRoutes);
  app.use(`${API_PREFIX}/orders`, ordersRoutes);

  // 404 Handler
  app.use("*", (req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `Endpoint '${req.originalUrl}' not found on this server.`,
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
