import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { TenderInfo, Requirement, UploadedDocument } from '../types/tender';

export interface FinalPackageItem {
  requirement: Requirement;
  file: UploadedDocument;
  expiryDate?: string;
}

export interface SealConfig {
  pngBuffer: ArrayBuffer;
  placement: 'cover_only' | 'index_only' | 'all_pages' | 'last_page';
  position: 'bottom_right' | 'bottom_center' | 'bottom_left';
}

export interface PackageGenerationOptions {
  includeIndexPage?: boolean;
  sealConfig?: SealConfig;
}

export interface PackageGenerationResult {
  blob: Blob;
  url: string;
  totalPages: number;
  filename: string;
  sizeBytes: number;
}

/**
 * Loads and inspects a PDF file using pdf-lib in the browser.
 * Returns page count and array buffer without sending data over network.
 */
export async function loadAndInspectPDF(file: File): Promise<{
  pageCount: number;
  buffer: ArrayBuffer;
}> {
  const buffer = await file.arrayBuffer();
  try {
    const pdfDoc = await PDFDocument.load(buffer, { ignoreEncryption: true });
    const pageCount = pdfDoc.getPageCount();
    return {
      pageCount,
      buffer,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Invalid PDF structure';
    throw new Error(`Unable to read this PDF. It may be damaged or password protected: ${message}`);
  }
}

/**
 * Generates the complete official tender submission package:
 * 1. Creates English Cover Page (Page 1).
 * 2. Creates Index Page (Page 2, Bonus 1).
 * 3. Copies all pages from matched PDFs ordered by requirement.order.
 * 4. Dynamically calculates start page of each included document.
 * 5. Embeds optional Seal/Signature PNG (Bonus 6).
 * 6. Adds uniform footer `<tender_id> | Page X of Y` to EVERY page.
 */
export async function generateFinalPackage(
  tender: TenderInfo,
  items: FinalPackageItem[],
  options: PackageGenerationOptions = { includeIndexPage: true },
  onProgress?: (status: string) => void
): Promise<PackageGenerationResult> {
  onProgress?.('Initializing submission package builder...');

  // Sort items strictly by requirement order
  const sortedItems = [...items].sort((a, b) => a.requirement.order - b.requirement.order);

  // Create final PDF document
  const finalDoc = await PDFDocument.create();
  const fontRegular = await finalDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await finalDoc.embedFont(StandardFonts.HelveticaBold);

  const hasIndexPage = options.includeIndexPage !== false;

  // Colors
  const navy = rgb(0.06, 0.16, 0.32); // #0f2952
  const darkSlate = rgb(0.12, 0.17, 0.24); // #1f2b3d
  const textMuted = rgb(0.4, 0.45, 0.52); // #667385
  const borderLight = rgb(0.85, 0.88, 0.92);
  const bgSoft = rgb(0.96, 0.97, 0.99);

  // Standard A4 dimensions: 595.28 x 841.89 pt
  const pageWidth = 595.28;
  const pageHeight = 841.89;

  // --- Precalculate Dynamic Document Start Pages ---
  // Page 1: Cover Page
  // Page 2: Index Page (if enabled)
  // Documents start at: Page 2 (without index) or Page 3 (with index)
  let currentDocStartPage = hasIndexPage ? 3 : 2;
  const documentPageMappings: { item: FinalPackageItem; startPage: number; endPage: number }[] = [];

  for (const item of sortedItems) {
    const count = item.file.pageCount || 1;
    const startP = currentDocStartPage;
    const endP = currentDocStartPage + count - 1;
    documentPageMappings.push({
      item,
      startPage: startP,
      endPage: endP,
    });
    currentDocStartPage += count;
  }

  // --- Step 1: Create Official Cover Page (Page 1) ---
  onProgress?.('Generating official cover page...');
  const coverPage = finalDoc.addPage([pageWidth, pageHeight]);

  // Outer decorative border
  coverPage.drawRectangle({
    x: 28,
    y: 28,
    width: pageWidth - 56,
    height: pageHeight - 56,
    borderColor: borderLight,
    borderWidth: 1.5,
  });

  // Inner hairline border
  coverPage.drawRectangle({
    x: 34,
    y: 34,
    width: pageWidth - 68,
    height: pageHeight - 68,
    borderColor: borderLight,
    borderWidth: 0.5,
  });

  // Top Header Banner
  coverPage.drawRectangle({
    x: 35,
    y: pageHeight - 110,
    width: pageWidth - 70,
    height: 74,
    color: bgSoft,
  });

  coverPage.drawRectangle({
    x: 35,
    y: pageHeight - 112,
    width: pageWidth - 70,
    height: 3,
    color: navy,
  });

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 50,
    y: pageHeight - 65,
    size: 18,
    font: fontBold,
    color: navy,
  });

  coverPage.drawText('OFFICIAL PROCUREMENT DOSSIER • CLIENT-SIDE VERIFIED', {
    x: 50,
    y: pageHeight - 85,
    size: 8.5,
    font: fontRegular,
    color: textMuted,
  });

  // Metadata Grid
  let coverY = pageHeight - 140;

  coverPage.drawText('TENDER SPECIFICATIONS', {
    x: 50,
    y: coverY,
    size: 11,
    font: fontBold,
    color: navy,
  });

  coverY -= 6;
  coverPage.drawLine({
    start: { x: 50, y: coverY },
    end: { x: pageWidth - 50, y: coverY },
    thickness: 1,
    color: borderLight,
  });

  coverY -= 18;

  const creationDate = new Date().toISOString().split('T')[0];

  const metadataRows: [string, string][] = [
    ['Tender ID:', tender.tender_id || 'N/A'],
    ['Tender Title:', tender.title || 'N/A'],
    ['Procuring Entity:', tender.procuring_entity || 'N/A'],
    ['Bidder Name:', tender.bidder || 'N/A'],
    ['Submission Deadline:', tender.submission_deadline || 'N/A'],
    ['Package Generated Date:', creationDate],
  ];

  for (const [label, value] of metadataRows) {
    coverPage.drawText(label, {
      x: 50,
      y: coverY,
      size: 9.5,
      font: fontBold,
      color: darkSlate,
    });

    const safeValue = (value || '').replace(/[^\x20-\x7E]/g, '?');

    coverPage.drawText(safeValue, {
      x: 190,
      y: coverY,
      size: 9.5,
      font: fontRegular,
      color: darkSlate,
    });

    coverY -= 16;
  }

  coverY -= 10;

  // Table of Included Documents Overview
  coverPage.drawText('INCLUDED SUBMISSION DOCUMENTS', {
    x: 50,
    y: coverY,
    size: 11,
    font: fontBold,
    color: navy,
  });

  coverY -= 6;
  coverPage.drawLine({
    start: { x: 50, y: coverY },
    end: { x: pageWidth - 50, y: coverY },
    thickness: 1,
    color: borderLight,
  });

  coverY -= 16;

  // Table Header Box
  coverPage.drawRectangle({
    x: 50,
    y: coverY - 4,
    width: pageWidth - 100,
    height: 18,
    color: bgSoft,
  });

  coverPage.drawText('#', { x: 56, y: coverY, size: 8, font: fontBold, color: navy });
  coverPage.drawText('DOCUMENT TITLE', { x: 75, y: coverY, size: 8, font: fontBold, color: navy });
  coverPage.drawText('ATTACHED FILE', { x: 235, y: coverY, size: 8, font: fontBold, color: navy });
  coverPage.drawText('EXPIRY DATE', { x: 385, y: coverY, size: 8, font: fontBold, color: navy });
  coverPage.drawText('PAGE RANGE', { x: 475, y: coverY, size: 8, font: fontBold, color: navy });

  coverY -= 18;

  for (let idx = 0; idx < documentPageMappings.length; idx++) {
    const mapping = documentPageMappings[idx];
    const item = mapping.item;
    const pageRangeStr =
      mapping.startPage === mapping.endPage
        ? `Page ${mapping.startPage}`
        : `Page ${mapping.startPage}-${mapping.endPage}`;

    if (idx % 2 === 1) {
      coverPage.drawRectangle({
        x: 50,
        y: coverY - 4,
        width: pageWidth - 100,
        height: 16,
        color: rgb(0.98, 0.98, 0.99),
      });
    }

    coverPage.drawText(`${item.requirement.order}`, {
      x: 56,
      y: coverY,
      size: 8.5,
      font: fontRegular,
      color: darkSlate,
    });

    const safeTitle = (item.requirement.title_en || item.requirement.id)
      .substring(0, 32)
      .replace(/[^\x20-\x7E]/g, '?');

    coverPage.drawText(safeTitle, {
      x: 75,
      y: coverY,
      size: 8.5,
      font: fontBold,
      color: darkSlate,
    });

    const safeFilename = item.file.name.substring(0, 28).replace(/[^\x20-\x7E]/g, '?');

    coverPage.drawText(safeFilename, {
      x: 235,
      y: coverY,
      size: 8,
      font: fontRegular,
      color: textMuted,
    });

    const expiryDisplay = item.requirement.has_expiry
      ? (item.expiryDate || 'N/A')
      : 'Not Required';

    coverPage.drawText(expiryDisplay, {
      x: 385,
      y: coverY,
      size: 8,
      font: fontRegular,
      color: darkSlate,
    });

    coverPage.drawText(pageRangeStr, {
      x: 475,
      y: coverY,
      size: 8,
      font: fontRegular,
      color: darkSlate,
    });

    coverY -= 17;

    if (coverY < 120 && idx < documentPageMappings.length - 1) {
      coverPage.drawText(`... and ${documentPageMappings.length - 1 - idx} more documents attached.`, {
        x: 56,
        y: coverY,
        size: 8,
        font: fontRegular,
        color: textMuted,
      });
      break;
    }
  }

  coverPage.drawText('CONFIDENTIAL • FOR OFFICIAL TENDER EVALUATION COMMITTEE ONLY', {
    x: 50,
    y: 55,
    size: 7.5,
    font: fontBold,
    color: textMuted,
  });

  // --- Step 2: BONUS 1 — INDEX PAGE (Page 2) ---
  if (hasIndexPage) {
    onProgress?.('Generating official Index page...');
    const indexPage = finalDoc.addPage([pageWidth, pageHeight]);

    // Border
    indexPage.drawRectangle({
      x: 28,
      y: 28,
      width: pageWidth - 56,
      height: pageHeight - 56,
      borderColor: borderLight,
      borderWidth: 1.5,
    });

    indexPage.drawRectangle({
      x: 34,
      y: 34,
      width: pageWidth - 68,
      height: pageHeight - 68,
      borderColor: borderLight,
      borderWidth: 0.5,
    });

    // Top Header Banner
    indexPage.drawRectangle({
      x: 35,
      y: pageHeight - 110,
      width: pageWidth - 70,
      height: 74,
      color: bgSoft,
    });

    indexPage.drawRectangle({
      x: 35,
      y: pageHeight - 112,
      width: pageWidth - 70,
      height: 3,
      color: navy,
    });

    indexPage.drawText('DOCUMENT INDEX & SUBMISSION DIRECTORY', {
      x: 50,
      y: pageHeight - 65,
      size: 16,
      font: fontBold,
      color: navy,
    });

    indexPage.drawText(`TENDER: ${tender.tender_id} • DYNAMIC STARTING PAGE REFERENCE`, {
      x: 50,
      y: pageHeight - 85,
      size: 8.5,
      font: fontRegular,
      color: textMuted,
    });

    let indexY = pageHeight - 140;

    indexPage.drawText('INDEX OF INCLUDED DOCUMENTS', {
      x: 50,
      y: indexY,
      size: 11,
      font: fontBold,
      color: navy,
    });

    indexY -= 6;
    indexPage.drawLine({
      start: { x: 50, y: indexY },
      end: { x: pageWidth - 50, y: indexY },
      thickness: 1,
      color: borderLight,
    });

    indexY -= 20;

    // Table Header
    indexPage.drawRectangle({
      x: 50,
      y: indexY - 4,
      width: pageWidth - 100,
      height: 20,
      color: bgSoft,
    });

    indexPage.drawText('ORDER', { x: 60, y: indexY + 2, size: 8.5, font: fontBold, color: navy });
    indexPage.drawText('DOCUMENT TITLE', { x: 120, y: indexY + 2, size: 8.5, font: fontBold, color: navy });
    indexPage.drawText('STARTING PAGE', { x: 450, y: indexY + 2, size: 8.5, font: fontBold, color: navy });

    indexY -= 20;

    for (let i = 0; i < documentPageMappings.length; i++) {
      const mapping = documentPageMappings[i];
      const safeTitle = (mapping.item.requirement.title_en || mapping.item.requirement.id)
        .replace(/[^\x20-\x7E]/g, '?');

      // Alternating row
      if (i % 2 === 1) {
        indexPage.drawRectangle({
          x: 50,
          y: indexY - 4,
          width: pageWidth - 100,
          height: 18,
          color: rgb(0.98, 0.98, 0.99),
        });
      }

      indexPage.drawText(`${mapping.item.requirement.order}`, {
        x: 60,
        y: indexY + 1,
        size: 9,
        font: fontRegular,
        color: darkSlate,
      });

      indexPage.drawText(safeTitle, {
        x: 120,
        y: indexY + 1,
        size: 9,
        font: fontBold,
        color: darkSlate,
      });

      // Dot leader line from title to page number
      const titleWidth = fontBold.widthOfTextAtSize(safeTitle, 9);
      const dotsStartX = 125 + titleWidth;
      const dotsEndX = 440;
      if (dotsEndX > dotsStartX + 20) {
        indexPage.drawLine({
          start: { x: dotsStartX, y: indexY + 4 },
          end: { x: dotsEndX, y: indexY + 4 },
          thickness: 0.5,
          color: rgb(0.85, 0.88, 0.92),
        });
      }

      // Starting page number (aligned)
      const pageStr = `${mapping.startPage}`;
      indexPage.drawText(pageStr, {
        x: 480,
        y: indexY + 1,
        size: 9.5,
        font: fontBold,
        color: navy,
      });

      indexY -= 20;
    }

    // Index Page Explanatory Note
    indexPage.drawText(
      '* Note: Starting page indicates where the corresponding document begins in this compiled package.',
      {
        x: 50,
        y: 60,
        size: 8,
        font: fontRegular,
        color: textMuted,
      }
    );
  }

  // --- Step 3: Merge Matched Document Pages in Order ---
  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    onProgress?.(`Merging document ${i + 1} of ${sortedItems.length}: ${item.file.name}...`);

    try {
      const sourceDoc = await PDFDocument.load(item.file.arrayBuffer, { ignoreEncryption: true });
      const copiedPages = await finalDoc.copyPages(sourceDoc, sourceDoc.getPageIndices());

      for (const page of copiedPages) {
        finalDoc.addPage(page);
      }
    } catch (err) {
      console.error(`Error embedding file ${item.file.name}:`, err);
      throw new Error(`Unable to read this PDF. It may be damaged or password protected: ${item.file.name}`);
    }
  }

  // --- Step 4: BONUS 6 — Embed Optional Seal / Signature ---
  if (options.sealConfig && options.sealConfig.pngBuffer) {
    onProgress?.('Embedding official seal / signature...');
    try {
      const sealImage = await finalDoc.embedPng(options.sealConfig.pngBuffer);
      const sealWidth = 90;
      const sealHeight = (sealImage.height / sealImage.width) * sealWidth;

      const totalCount = finalDoc.getPageCount();
      const targetIndices: number[] = [];

      switch (options.sealConfig.placement) {
        case 'cover_only':
          targetIndices.push(0);
          break;
        case 'index_only':
          if (hasIndexPage && totalCount > 1) targetIndices.push(1);
          break;
        case 'last_page':
          targetIndices.push(totalCount - 1);
          break;
        case 'all_pages':
          for (let p = 0; p < totalCount; p++) targetIndices.push(p);
          break;
      }

      for (const pIdx of targetIndices) {
        const page = finalDoc.getPage(pIdx);
        const { width: pW } = page.getSize();
        let posX = pW - sealWidth - 45; // default bottom_right
        if (options.sealConfig.position === 'bottom_left') {
          posX = 45;
        } else if (options.sealConfig.position === 'bottom_center') {
          posX = (pW - sealWidth) / 2;
        }

        page.drawImage(sealImage, {
          x: posX,
          y: 45, // placed above the footer safe zone
          width: sealWidth,
          height: sealHeight,
          opacity: 0.88,
        });
      }
    } catch (sealErr) {
      console.warn('Could not embed seal PNG (non-fatal):', sealErr);
    }
  }

  // --- Step 5: Apply Uniform Footers `<tender_id> | Page X of Y` to EVERY Page ---
  const totalPages = finalDoc.getPageCount();
  onProgress?.(`Applying footers (Total ${totalPages} pages in package)...`);

  const safeTenderId = (tender.tender_id || 'TENDER').replace(/[^\x20-\x7E]/g, '');

  for (let pIndex = 0; pIndex < totalPages; pIndex++) {
    const page = finalDoc.getPage(pIndex);
    const { width: pWidth } = page.getSize();

    const pageNumber = pIndex + 1;
    const footerText = `${safeTenderId} | Page ${pageNumber} of ${totalPages}`;

    const fontSize = 9;
    const textWidth = fontRegular.widthOfTextAtSize(footerText, fontSize);
    const footerX = (pWidth - textWidth) / 2;
    const footerY = 18; // safe margin 18pt from bottom

    // Subtle hairline divider
    const ruleMargin = Math.max(36, (pWidth - 320) / 2);
    page.drawLine({
      start: { x: ruleMargin, y: 30 },
      end: { x: pWidth - ruleMargin, y: 30 },
      thickness: 0.5,
      color: rgb(0.8, 0.82, 0.86),
    });

    page.drawText(footerText, {
      x: footerX,
      y: footerY,
      size: fontSize,
      font: fontRegular,
      color: rgb(0.2, 0.25, 0.32),
    });
  }

  onProgress?.('Finalizing package binary...');

  const pdfBytes = await finalDoc.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const cleanTenderId = (tender.tender_id || 'Tender').replace(/[/\\?%*:|"<>]/g, '_');
  const filename = `${cleanTenderId}_Package.pdf`;

  return {
    blob,
    url,
    totalPages,
    filename,
    sizeBytes: pdfBytes.byteLength,
  };
}

/**
 * Creates a lightweight sample dummy PDF client-side using pdf-lib.
 */
export async function createSamplePDF(
  docTitle: string,
  pageCount: number = 2,
  options?: { customText?: string }
): Promise<{ file: File; buffer: ArrayBuffer }> {
  const pdfDoc = await PDFDocument.create();
  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  for (let p = 1; p <= pageCount; p++) {
    const page = pdfDoc.addPage([595.28, 841.89]);

    page.drawRectangle({
      x: 40,
      y: 780,
      width: 515,
      height: 35,
      color: rgb(0.94, 0.96, 0.98),
      borderColor: rgb(0.8, 0.85, 0.9),
      borderWidth: 1,
    });

    page.drawText(docTitle.toUpperCase(), {
      x: 55,
      y: 792,
      size: 13,
      font: fontBold,
      color: rgb(0.1, 0.2, 0.35),
    });

    page.drawText(`Document: ${docTitle}`, {
      x: 55,
      y: 740,
      size: 11,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText(`Internal Sheet ${p} of ${pageCount}`, {
      x: 55,
      y: 720,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    if (options?.customText) {
      page.drawText(options.customText, {
        x: 55,
        y: 690,
        size: 9,
        font: fontRegular,
        color: rgb(0.4, 0.4, 0.4),
      });
    }

    for (let i = 0; i < 12; i++) {
      page.drawLine({
        start: { x: 55, y: 650 - i * 35 },
        end: { x: 540, y: 650 - i * 35 },
        thickness: 0.5,
        color: rgb(0.88, 0.88, 0.9),
      });
    }

    page.drawText('OFFICIAL SEAL & SIGNATURE VERIFIED', {
      x: 55,
      y: 100,
      size: 9,
      font: fontBold,
      color: rgb(0.2, 0.4, 0.3),
    });
  }

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
  const filename = `${docTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.pdf`;
  const file = new File([blob], filename, { type: 'application/pdf', lastModified: Date.now() });

  return {
    file,
    buffer: pdfBytes.buffer as ArrayBuffer,
  };
}
