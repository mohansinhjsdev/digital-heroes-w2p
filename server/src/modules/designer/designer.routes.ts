import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { designerController } from "./designer.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateUser } from "../../middlewares/auth.middleware";
import { saveDesignSchema, getDesignByIdSchema } from "./designer.schema";
import { config } from "../../config/env";

const router = Router();

// Configure multer storage
const uploadDirectory = config.uploadDir;
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `artwork-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

router.post(
  "/designs",
  authenticateUser,
  validate(saveDesignSchema),
  designerController.saveDesign.bind(designerController)
);

router.get(
  "/designs",
  authenticateUser,
  designerController.getCustomerDesigns.bind(designerController)
);

router.get(
  "/designs/:id",
  authenticateUser,
  validate(getDesignByIdSchema),
  designerController.getDesignById.bind(designerController)
);

router.delete(
  "/designs/:id",
  authenticateUser,
  validate(getDesignByIdSchema),
  designerController.deleteDesign.bind(designerController)
);

router.post(
  "/upload-artwork",
  upload.single("file"),
  designerController.uploadArtwork.bind(designerController)
);

export default router;
