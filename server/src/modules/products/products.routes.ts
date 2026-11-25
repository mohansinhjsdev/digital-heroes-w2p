import { Router } from "express";
import { productsController } from "./products.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateUser, requireRole } from "../../middlewares/auth.middleware";
import { getDivisionBySlugSchema, updateDivisionSchema } from "./products.schema";
import { Role } from "@prisma/client";

const router = Router();

// Publicly accessible division catalog
router.get("/divisions", productsController.getAllDivisions.bind(productsController));

router.get(
  "/divisions/:slug",
  validate(getDivisionBySlugSchema),
  productsController.getDivisionBySlug.bind(productsController)
);

// Admin only update division specs
router.patch(
  "/divisions/:id",
  authenticateUser,
  requireRole([Role.ADMIN]),
  validate(updateDivisionSchema),
  productsController.updateDivision.bind(productsController)
);

export default router;
