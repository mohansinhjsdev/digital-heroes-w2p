import { Router } from "express";
import { pricingController } from "./pricing.controller";
import { validate } from "../../middlewares/validate.middleware";
import { calculatePriceSchema } from "./pricing.schema";

const router = Router();

// Publicly accessible instant pricing calculator
router.post(
  "/calculate",
  validate(calculatePriceSchema),
  pricingController.calculatePrice.bind(pricingController)
);

export default router;
