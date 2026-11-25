import { prisma } from "../../prisma";
import { AppError } from "../../utils/app-error";
import { CreateRevisionInput, RequestChangesInput } from "./proofs.schema";
import { ProofStatus, PipelineStatus } from "@prisma/client";

export class ProofsService {
  async getOrderProofs(orderId: string) {
    const revisions = await prisma.proofRevision.findMany({
      where: { orderId },
      include: {
        proofLogs: {
          include: {
            user: { select: { id: true, name: true, role: true } },
          },
          orderBy: { timestamp: "asc" },
        },
      },
      orderBy: { version: "desc" },
    });

    return revisions;
  }

  async createProofRevision(
    orderId: string,
    userId: string,
    data: CreateRevisionInput
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { proofRevisions: { orderBy: { version: "desc" }, take: 1 } },
    });

    if (!order) {
      throw new AppError(404, "Order not found.");
    }

    const lastVersion = order.proofRevisions[0]?.version || 0;
    const nextVersion = lastVersion + 1;

    const revision = await prisma.proofRevision.create({
      data: {
        orderId,
        version: nextVersion,
        previewImageUrl: data.previewImageUrl,
        pdfPreviewUrl: data.pdfPreviewUrl,
        status: ProofStatus.PENDING,
        changeRequestNote: null,
      },
    });

    await prisma.proofLog.create({
      data: {
        revisionId: revision.id,
        userId,
        action: `SUBMITTED_V${nextVersion}`,
        notes: data.notes || `Proof v${nextVersion} generated for client inspection.`,
      },
    });

    // Update order status to PROOF if not already
    await prisma.order.update({
      where: { id: orderId },
      data: { status: PipelineStatus.PROOF },
    });

    return revision;
  }

  async requestChanges(
    revisionId: string,
    userId: string,
    data: RequestChangesInput
  ) {
    const revision = await prisma.proofRevision.findUnique({
      where: { id: revisionId },
      include: { order: true },
    });

    if (!revision) {
      throw new AppError(404, "Proof revision not found.");
    }

    const updated = await prisma.proofRevision.update({
      where: { id: revisionId },
      data: {
        status: ProofStatus.CHANGES_REQUESTED,
        changeRequestNote: data.changeRequestNote,
        reviewedAt: new Date(),
      },
    });

    await prisma.proofLog.create({
      data: {
        revisionId,
        userId,
        action: "REQUESTED_CHANGES",
        notes: data.changeRequestNote,
      },
    });

    // Revert order back to ARTWORK revision stage
    await prisma.order.update({
      where: { id: revision.orderId },
      data: { status: PipelineStatus.ARTWORK },
    });

    return updated;
  }

  async approveProof(revisionId: string, userId: string) {
    const revision = await prisma.proofRevision.findUnique({
      where: { id: revisionId },
      include: { order: true },
    });

    if (!revision) {
      throw new AppError(404, "Proof revision not found.");
    }

    const updated = await prisma.proofRevision.update({
      where: { id: revisionId },
      data: {
        status: ProofStatus.APPROVED,
        reviewedAt: new Date(),
      },
    });

    await prisma.proofLog.create({
      data: {
        revisionId,
        userId,
        action: "APPROVED",
        notes: `Proof v${revision.version} officially approved by client. Ready for print.`,
      },
    });

    // APPROVAL GATE:
    // 1. Mark Order as Approved and advance pipeline to PRODUCTION
    await prisma.order.update({
      where: { id: revision.orderId },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        approvedByUserId: userId,
        status: PipelineStatus.PRODUCTION,
      },
    });

    // 2. Unlock all high-resolution production files
    await prisma.productionFile.updateMany({
      where: { orderId: revision.orderId },
      data: { isUnlocked: true },
    });

    return updated;
  }
}

export const proofsService = new ProofsService();
