import { RequirementsPayload } from '../types/tender';
import { createSamplePDF } from './pdf';
import { computeSHA256 } from './crypto';
import { UploadedDocument } from '../types/tender';

export const DEFAULT_SAMPLE_REQUIREMENTS: RequirementsPayload = {
  tender: {
    tender_id: 'T-2026-0417',
    title: 'Supply of IT Equipment & Enterprise Cloud Infrastructure',
    procuring_entity: 'Directorate of Digital Governance',
    bidder: 'Apex Tech Solutions Ltd.',
    submission_deadline: '2026-10-20',
  },
  requirements: [
    {
      id: 'R01',
      order: 1,
      title_en: 'Trade License',
      title_bn: 'ট্রেড লাইসেন্স',
      mandatory: true,
      has_expiry: true,
    },
    {
      id: 'R02',
      order: 2,
      title_en: 'Tax Clearance Certificate (TIN)',
      title_bn: 'কর পরিশোধ সনদ (টিআইএন)',
      mandatory: true,
      has_expiry: true,
    },
    {
      id: 'R03',
      order: 3,
      title_en: 'VAT Registration Certificate (BIN)',
      title_bn: 'ভ্যাট নিবন্ধন সনদ (বিআইএন)',
      mandatory: true,
      has_expiry: false,
    },
    {
      id: 'R04',
      order: 4,
      title_en: 'Audited Financial Statement (Last 3 Years)',
      title_bn: 'নিরীক্ষিত আর্থিক বিবরণী (বিগত ৩ বছর)',
      mandatory: true,
      has_expiry: false,
    },
    {
      id: 'R05',
      order: 5,
      title_en: 'Manufacturer Authorization Letter (MAF)',
      title_bn: 'উৎপাদক অনুমোদন পত্র (এমএএফ)',
      mandatory: false,
      has_expiry: true,
    },
    {
      id: 'R06',
      order: 6,
      title_en: 'ISO 9001:2015 Quality Certification',
      title_bn: 'আইএসও ৯০০১:২০১৫ কোয়ালিটি সনদ',
      mandatory: false,
      has_expiry: true,
    },
  ],
};

/**
 * Creates a collection of ready-to-use sample PDFs in memory.
 * Includes:
 * 1. Trade License (2 pages)
 * 2. Tax Clearance Certificate (1 page)
 * 3. VAT Registration (1 page)
 * 4. Audited Financial Statement (3 pages)
 * 5. Manufacturer Authorization Letter (1 page)
 * 6. EXACT DUPLICATE of Trade License with a different filename (to test Test H & I).
 */
export async function createSamplePackDocuments(): Promise<UploadedDocument[]> {
  const tradeLicense = await createSamplePDF('Trade License 2026', 2, {
    customText: 'Valid business establishment certificate under Municipal Corporation Code 44.',
  });

  const taxClearance = await createSamplePDF('Tax Clearance Certificate', 1, {
    customText: 'National Board of Revenue - Tax Year Assessment Verified.',
  });

  const vatCert = await createSamplePDF('VAT Registration Certificate', 1, {
    customText: 'Value Added Tax Registration BIN: 002948192-0102.',
  });

  const financialStatement = await createSamplePDF('Audited Financial Statement', 3, {
    customText: 'Chartered Accountants Independent Audit Report & Balance Sheet.',
  });

  const mafLetter = await createSamplePDF('Manufacturer Authorization Letter', 1, {
    customText: 'Official Original Equipment Manufacturer Authorization for Tender T-2026-0417.',
  });

  // DUPLICATE TEST FILE: Exact identical buffer of tradeLicense, but named "Trade_License_Backup_Copy.pdf"
  const duplicateFile = new File(
    [tradeLicense.file.slice()],
    'Trade_License_Backup_Copy.pdf',
    { type: 'application/pdf', lastModified: Date.now() }
  );

  const rawFiles: { file: File; buffer: ArrayBuffer; pageCount: number }[] = [
    { file: tradeLicense.file, buffer: tradeLicense.buffer, pageCount: 2 },
    { file: duplicateFile, buffer: tradeLicense.buffer, pageCount: 2 },
    { file: taxClearance.file, buffer: taxClearance.buffer, pageCount: 1 },
    { file: vatCert.file, buffer: vatCert.buffer, pageCount: 1 },
    { file: financialStatement.file, buffer: financialStatement.buffer, pageCount: 3 },
    { file: mafLetter.file, buffer: mafLetter.buffer, pageCount: 1 },
  ];

  const documents: UploadedDocument[] = [];

  for (let i = 0; i < rawFiles.length; i++) {
    const item = rawFiles[i];
    const hash = await computeSHA256(item.buffer);
    documents.push({
      id: `doc_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      file: item.file,
      name: item.file.name,
      size: item.file.size,
      hash,
      pageCount: item.pageCount,
      arrayBuffer: item.buffer,
      isCorrupted: false,
      isDuplicate: false,
    });
  }

  return documents;
}
