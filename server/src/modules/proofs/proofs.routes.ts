import { Router } from "express";
import { proofsController } from "./proofs.controller";
import { validate } from "../../middlewares/validate.middleware";
import { authenticateUser } from "../../middlewares/auth.middleware";
import {
  createRevisionSchema,
  requestChangesSchema,
  approveProofSchema,
} from "./proofs.schema";

const router = Router();

router.get(
  "/orders/:orderId",
  authenticateUser,
  proofsController.getOrderProofs.bind(proofsController)
);

router.post(
  "/orders/:orderId/revisions",
  authenticateUser,
  validate(createRevisionSchema),
  proofsController.createProofRevision.bind(proofsController)
);

router.post(
  "/:revisionId/request-changes",
  authenticateUser,
  validate(requestChangesSchema),
  proofsController.requestChanges.bind(proofsController)
);

router.post(
  "/:revisionId/approve",
  authenticateUser,
  validate(approveProofSchema),
  proofsController.approveProof.bind(proofsController)
);

export default router;
