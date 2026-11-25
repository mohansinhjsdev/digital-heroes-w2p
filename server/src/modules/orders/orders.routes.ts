import { Router } from "express";
import { ordersController } from "./orders.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateUser, requireRole } from "../../middlewares/auth.middleware";
import {
  createOrderSchema,
  reorderSchema,
  updateOrderStatusSchema,
} from "./orders.schema";
import { Role } from "@prisma/client";

const router = Router();

// Customer order routes
router.post(
  "/",
  authenticateUser,
  validate(createOrderSchema),
  ordersController.createOrder.bind(ordersController)
);

router.post(
  "/:orderId/reorder",
  authenticateUser,
  validate(reorderSchema),
  ordersController.reorder.bind(ordersController)
);

router.get(
  "/my-orders",
  authenticateUser,
  ordersController.getCustomerOrders.bind(ordersController)
);

router.get(
  "/:orderId",
  authenticateUser,
  ordersController.getOrderById.bind(ordersController)
);

// Admin production pipeline & reports
router.get(
  "/admin/pipeline",
  authenticateUser,
  requireRole([Role.ADMIN]),
  ordersController.getAdminPipeline.bind(ordersController)
);

router.patch(
  "/admin/:orderId/status",
  authenticateUser,
  requireRole([Role.ADMIN]),
  validate(updateOrderStatusSchema),
  ordersController.updateOrderStatus.bind(ordersController)
);

router.get(
  "/admin/reports/analytics",
  authenticateUser,
  requireRole([Role.ADMIN]),
  ordersController.getAnalytics.bind(ordersController)
);

export default router;
