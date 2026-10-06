import { TenderInfo, Requirement, UploadedDocument, EvaluatedRequirement } from '../types/tender';

/**
 * Generates an Excel-compatible CSV export of the tender checklist.
 * Includes UTF-8 Byte Order Mark (\uFEFF) so Excel displays English & Bangla correctly.
 */
export function exportChecklistToCSV(
  tender: TenderInfo | null,
  evaluatedItems: EvaluatedRequirement[]
): void {
  const tenderId = tender?.tender_id || 'Tender';
  const cleanTenderId = tenderId.replace(/[/\\?%*:|"<>]/g, '_');
  const filename = `${cleanTenderId}_Checklist.csv`;

  const headers = [
    'Document',
    'Requirement ID',
    'File name',
    'Pages',
    'Expiry date',
    'Status',
    'Mandatory',
    'Order',
  ];

  const escapeCSV = (value: string | number | boolean | undefined | null): string => {
    if (value === undefined || value === null) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows: string[] = [];

  // Header row
  rows.push(headers.map(escapeCSV).join(','));

  // Data rows
  for (const item of evaluatedItems) {
    const docTitle = `${item.requirement.title_en} / ${item.requirement.title_bn}`;
    const reqId = item.requirement.id;
    const fileName = item.matchedFile ? item.matchedFile.name : 'Not Provided';
    const pages = item.matchedFile ? item.matchedFile.pageCount : 0;
    const expiry = item.requirement.has_expiry ? (item.expiryDate || 'N/A') : 'Not Required';
    const status = item.status;
    const mandatory = item.requirement.mandatory ? 'Yes' : 'No';
    const order = item.requirement.order;

    rows.push(
      [
        escapeCSV(docTitle),
        escapeCSV(reqId),
        escapeCSV(fileName),
        escapeCSV(pages),
        escapeCSV(expiry),
        escapeCSV(status),
        escapeCSV(mandatory),
        escapeCSV(order),
      ].join(',')
    );
  }

  // Prepend UTF-8 BOM so Microsoft Excel correctly reads UTF-8 characters
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
