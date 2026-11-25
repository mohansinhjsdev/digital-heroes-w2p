import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";
import Papa from "papaparse";
import fs from "fs";
import path from "path";
import { prisma } from "../../prisma";
import { config } from "../../config/env";
import { AppError } from "../../utils/app-error";
import { OutputFileType } from "@prisma/client";

// Conversion factor: 1 mm = 72 / 25.4 points ≈ 2.834645669 pt
const MM_TO_PT = 72 / 25.4;

export interface CanvasElement {
  id: string;
  type: "text" | "rect" | "circle" | "badge" | "number_placeholder" | "name_placeholder";
  x: number; // in mm or percentage
  y: number;
  width?: number;
  height?: number;
  text?: string;
  placeholderKey?: string; // e.g. "number", "name", "category"
  fontSize?: number;
  fontFamily?: "Helvetica" | "HelveticaBold" | "Times" | "Courier";
  color?: string; // hex "#000000"
  backgroundColor?: string;
  borderRadius?: number;
  textAlign?: "left" | "center" | "right";
}

export interface DesignCanvasState {
  widthMm: number;
  heightMm: number;
  bleedMm: number;
  safeZoneMm: number;
  backgroundColor?: string;
  elements: CanvasElement[];
}

export class PrintEngineService {
  constructor() {
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
  }

  private hexToRgb(hex = "#000000") {
    const clean = hex.replace("#", "");
    const bigint = parseInt(
      clean.length === 3
        ? clean
            .split("")
            .map((c) => c + c)
            .join("")
        : clean,
      16
    );
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return rgb(r, g, b);
  }

  private drawTrimMarks(
    page: PDFPage,
    totalWidthPt: number,
    totalHeightPt: number,
    bleedPt: number
  ) {
    const markLength = 12; // 12pt length for trim ticks
    const markColor = rgb(0.2, 0.2, 0.2);
    const strokeWidth = 0.5;

    // Corner cut coordinates
    const leftTrim = bleedPt;
    const rightTrim = totalWidthPt - bleedPt;
    const bottomTrim = bleedPt;
    const topTrim = totalHeightPt - bleedPt;

    // Top-left
    page.drawLine({
      start: { x: leftTrim, y: totalHeightPt },
      end: { x: leftTrim, y: totalHeightPt - markLength / 2 },
      thickness: strokeWidth,
      color: markColor,
    });
    page.drawLine({
      start: { x: 0, y: topTrim },
      end: { x: markLength / 2, y: topTrim },
      thickness: strokeWidth,
      color: markColor,
    });

    // Top-right
    page.drawLine({
      start: { x: rightTrim, y: totalHeightPt },
      end: { x: rightTrim, y: totalHeightPt - markLength / 2 },
      thickness: strokeWidth,
      color: markColor,
    });
    page.drawLine({
      start: { x: totalWidthPt, y: topTrim },
      end: { x: totalWidthPt - markLength / 2, y: topTrim },
      thickness: strokeWidth,
      color: markColor,
    });

    // Bottom-left
    page.drawLine({
      start: { x: leftTrim, y: 0 },
      end: { x: leftTrim, y: markLength / 2 },
      thickness: strokeWidth,
      color: markColor,
    });
    page.drawLine({
      start: { x: 0, y: bottomTrim },
      end: { x: markLength / 2, y: bottomTrim },
      thickness: strokeWidth,
      color: markColor,
    });

    // Bottom-right
    page.drawLine({
      start: { x: rightTrim, y: 0 },
      end: { x: rightTrim, y: markLength / 2 },
      thickness: strokeWidth,
      color: markColor,
    });
    page.drawLine({
      start: { x: totalWidthPt, y: bottomTrim },
      end: { x: totalWidthPt - markLength / 2, y: bottomTrim },
      thickness: strokeWidth,
      color: markColor,
    });
  }

  private renderElementsOnPage(
    page: PDFPage,
    elements: CanvasElement[],
    fonts: {
      regular: PDFFont;
      bold: PDFFont;
      courier: PDFFont;
    },
    canvasWidthMm: number,
    canvasHeightMm: number,
    bleedPt: number,
    variableData?: Record<string, any>
  ) {
    const scaleX = MM_TO_PT;
    const scaleY = MM_TO_PT;

    for (const elem of elements) {
      const elemX = bleedPt + (elem.x || 0) * scaleX;
      // Convert top-down canvas Y to PDF bottom-up Y coordinate
      const elemHeightPt = (elem.height || 20) * scaleY;
      const elemWidthPt = (elem.width || 60) * scaleX;
      const elemY =
        bleedPt + (canvasHeightMm - (elem.y || 0)) * scaleY - elemHeightPt;

      if (elem.type === "rect" || elem.type === "badge") {
        page.drawRectangle({
          x: elemX,
          y: elemY,
          width: elemWidthPt,
          height: elemHeightPt,
          color: elem.backgroundColor
            ? this.hexToRgb(elem.backgroundColor)
            : rgb(0.9, 0.9, 0.9),
          borderColor: elem.color ? this.hexToRgb(elem.color) : undefined,
          borderWidth: elem.color ? 1 : 0,
        });
      }

      if (
        elem.type === "text" ||
        elem.type === "number_placeholder" ||
        elem.type === "name_placeholder"
      ) {
        let textContent = elem.text || "";

        // Variable merge interpolation
        if (variableData) {
          if (elem.placeholderKey && variableData[elem.placeholderKey]) {
            textContent = String(variableData[elem.placeholderKey]);
          } else if (
            elem.type === "number_placeholder" &&
            (variableData["number"] || variableData["bib"] || variableData["id"])
          ) {
            textContent = String(
              variableData["number"] ||
                variableData["bib"] ||
                variableData["id"]
            );
          } else if (
            elem.type === "name_placeholder" &&
            (variableData["name"] || variableData["athlete_name"])
          ) {
            textContent = String(
              variableData["name"] || variableData["athlete_name"]
            );
          }
        }

        const font =
          elem.fontFamily === "HelveticaBold" ||
          elem.type === "number_placeholder"
            ? fonts.bold
            : elem.fontFamily === "Courier"
            ? fonts.courier
            : fonts.regular;

        let fontSize = elem.fontSize ? elem.fontSize * 0.9 : 14;
        const maxAllowedWidth = elemWidthPt > 0 ? elemWidthPt : 200;

        // Shrink-to-fit variable font sizing algorithm
        let measuredWidth = font.widthOfTextAtSize(textContent, fontSize);
        while (measuredWidth > maxAllowedWidth && fontSize > 6) {
          fontSize -= 1;
          measuredWidth = font.widthOfTextAtSize(textContent, fontSize);
        }

        // Align center or left
        let drawX = elemX;
        if (elem.textAlign === "center") {
          drawX = elemX + Math.max(0, (elemWidthPt - measuredWidth) / 2);
        }

        page.drawText(textContent, {
          x: drawX,
          y: elemY + elemHeightPt * 0.25,
          size: fontSize,
          font,
          color: elem.color ? this.hexToRgb(elem.color) : rgb(0.1, 0.1, 0.1),
        });
      }
    }
  }

  async generateOrderPrintFiles(
    orderId: string,
    overrideDesign?: DesignCanvasState,
    overrideCsv?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { division: true, customer: true },
    });

    if (!order) {
      throw new AppError(404, "Order not found.");
    }

    let canvasState: DesignCanvasState;
    if (overrideDesign) {
      canvasState = overrideDesign;
    } else if (order.canvasJson) {
      canvasState = JSON.parse(order.canvasJson);
    } else {
      // Default clean layout for division
      canvasState = {
        widthMm: order.widthMm,
        heightMm: order.heightMm,
        bleedMm: order.division.bleedMm,
        safeZoneMm: order.division.safeZoneMm,
        backgroundColor: "#ffffff",
        elements: [
          {
            id: "title-1",
            type: "text",
            x: 10,
            y: 15,
            width: order.widthMm - 20,
            height: 12,
            text: order.division.name.toUpperCase(),
            fontSize: 16,
            fontFamily: "HelveticaBold",
            color: "#111827",
            textAlign: "center",
          },
          {
            id: "desc-1",
            type: "text",
            x: 10,
            y: 35,
            width: order.widthMm - 20,
            height: 10,
            text: `Order: ${order.orderNumber} | Material: ${order.material}`,
            fontSize: 10,
            fontFamily: "Helvetica",
            color: "#4b5563",
            textAlign: "center",
          },
        ],
      };
    }

    const pdfDoc = await PDFDocument.create();
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const courierFont = await pdfDoc.embedFont(StandardFonts.Courier);

    const bleedPt = (canvasState.bleedMm || 3) * MM_TO_PT;
    const totalWidthPt = canvasState.widthMm * MM_TO_PT + bleedPt * 2;
    const totalHeightPt = canvasState.heightMm * MM_TO_PT + bleedPt * 2;

    const rawCsv = overrideCsv || order.csvRawData;
    let isCsvMerged = false;

    if (rawCsv && rawCsv.trim().length > 0) {
      const parsed = Papa.parse(rawCsv, { header: true, skipEmptyLines: true });
      if (parsed.data && parsed.data.length > 0) {
        isCsvMerged = true;
        // Generate a page for each CSV record
        for (const row of parsed.data as Record<string, any>[]) {
          const page = pdfDoc.addPage([totalWidthPt, totalHeightPt]);

          // Bleed & background
          if (canvasState.backgroundColor) {
            page.drawRectangle({
              x: 0,
              y: 0,
              width: totalWidthPt,
              height: totalHeightPt,
              color: this.hexToRgb(canvasState.backgroundColor),
            });
          }

          this.drawTrimMarks(page, totalWidthPt, totalHeightPt, bleedPt);
          this.renderElementsOnPage(
            page,
            canvasState.elements,
            { regular: regularFont, bold: boldFont, courier: courierFont },
            canvasState.widthMm,
            canvasState.heightMm,
            bleedPt,
            row
          );
        }
      }
    }

    if (!isCsvMerged) {
      // Single print-ready sheet
      const page = pdfDoc.addPage([totalWidthPt, totalHeightPt]);
      if (canvasState.backgroundColor) {
        page.drawRectangle({
          x: 0,
          y: 0,
          width: totalWidthPt,
          height: totalHeightPt,
          color: this.hexToRgb(canvasState.backgroundColor),
        });
      }
      this.drawTrimMarks(page, totalWidthPt, totalHeightPt, bleedPt);
      this.renderElementsOnPage(
        page,
        canvasState.elements,
        { regular: regularFont, bold: boldFont, courier: courierFont },
        canvasState.widthMm,
        canvasState.heightMm,
        bleedPt
      );
    }

    const pdfBytes = await pdfDoc.save();

    // File naming convention: OrderID_ProductType_Date_Output.pdf
    const dateStr = new Date().toISOString().split("T")[0];
    const divisionTag = order.division.slug;
    const fileName = `${order.orderNumber}_${divisionTag}_${dateStr}_Output.pdf`;
    const filePath = path.join(config.outputDir, fileName);

    fs.writeFileSync(filePath, Buffer.from(pdfBytes));
    const fileSizeKb = Number((pdfBytes.byteLength / 1024).toFixed(2));
    const fileUrl = `/outputs/${fileName}`;

    // Record in ProductionFile table
    const productionFile = await prisma.productionFile.create({
      data: {
        orderId: order.id,
        fileName,
        fileType: isCsvMerged
          ? OutputFileType.CSV_VARIABLE_DATA_PDF
          : OutputFileType.PRINT_READY_PDF,
        fileUrl,
        fileSizeKb,
        isUnlocked: order.isApproved, // Unlocks strictly on proof approval
      },
    });

    return {
      productionFile,
      fileName,
      fileUrl,
      fileSizeKb,
      pageCount: pdfDoc.getPageCount(),
      isCsvMerged,
    };
  }

  async getOrderFiles(orderId: string, isAdmin = false) {
    const files = await prisma.productionFile.findMany({
      where: { orderId },
      orderBy: { createdAt: "desc" },
    });

    if (isAdmin) {
      return files;
    }

    // Customers only see unlocked or proof previews
    return files.filter((f) => f.isUnlocked);
  }

  async downloadFile(fileId: string, isAdmin = false) {
    const file = await prisma.productionFile.findUnique({
      where: { id: fileId },
      include: { order: true },
    });

    if (!file) {
      throw new AppError(404, "Production file record not found.");
    }

    if (!isAdmin && !file.isUnlocked) {
      throw new AppError(
        403,
        "Production file is locked. High-resolution print-ready files unlock only once customer approves the proof."
      );
    }

    const physicalPath = path.join(config.outputDir, file.fileName);
    if (!fs.existsSync(physicalPath)) {
      throw new AppError(404, "Physical file missing on server storage.");
    }

    return {
      file,
      physicalPath,
    };
  }
}

export const printEngineService = new PrintEngineService();
