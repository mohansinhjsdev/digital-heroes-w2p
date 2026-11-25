import { Router } from "express";
import { printEngineController } from "./print-engine.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateUser, requireRole } from "../../middlewares/auth.middleware";
import { generatePrintFileSchema, downloadFileSchema } from "./print-engine.schema";
import { Role } from "@prisma/client";

const router = Router();

// Generate production print files (Admin or Order pipeline)
router.post(
  "/generate",
  authenticateUser,
  validate(generatePrintFileSchema),
  printEngineController.generatePrintFile.bind(printEngineController)
);

// Get files associated with an order
router.get(
  "/orders/:orderId",
  authenticateUser,
  printEngineController.getOrderFiles.bind(printEngineController)
);

// Download production file (Gated by proof approval for non-admins)
router.get(
  "/download/:fileId",
  authenticateUser,
  validate(downloadFileSchema),
  printEngineController.downloadFile.bind(printEngineController)
);

export default router;
