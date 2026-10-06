export interface TenderInfo {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string; // YYYY-MM-DD
}

export interface Requirement {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface RequirementsPayload {
  tender: TenderInfo;
  requirements: Requirement[];
}

export interface UploadedDocument {
  id: string;
  file: File;
  name: string;
  size: number;
  hash: string;
  pageCount: number;
  arrayBuffer: ArrayBuffer;
  isCorrupted: boolean;
  errorMessage?: string;
  duplicateGroupId?: string;
  isDuplicate: boolean;
  duplicateFilenames?: string[];
}

export type DocumentStatus =
  | 'OK'
  | 'Missing'
  | 'Expiry date needed'
  | 'Expired'
  | 'Not provided';

export interface RequirementMatch {
  requirementId: string;
  fileId?: string;
  expiryDate?: string; // YYYY-MM-DD
}

export interface EvaluatedRequirement {
  requirement: Requirement;
  matchedFile?: UploadedDocument;
  expiryDate?: string;
  status: DocumentStatus;
  isBlocking: boolean;
  blockingReason?: string;
}

export type SupportedLanguage = 'en' | 'bn';
