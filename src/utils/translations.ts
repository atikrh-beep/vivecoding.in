import { SupportedLanguage, DocumentStatus } from '../types/tender';

export interface TranslationDictionary {
  appName: string;
  appSubtitle: string;
  tagline: string;
  contestBadge: string;
  loadSample: string;
  resetAll: string;
  privacyBadge: string;
  exportCsv: string;
  saveProject: string;
  exportSession: string;
  indexPageToggle: string;
  indexPageDesc: string;
  themeBright: string;
  themeDark: string;

  // 5 Step Horizontal Navigation
  dossierHeader: string;
  nav01: string;
  nav02: string;
  nav03: string;
  nav04: string;
  nav05: string;

  // Package Readiness Section
  readinessTitle: string;
  readinessDocsReady: string;
  readinessNeedAttention: string;
  readinessAllGood: string;
  reviewDocuments: string;
  generateAgain: string;

  // Empty state & judge usability messages (Section 22, 23 & 25)
  emptyStateStep1: string;
  emptyStateStep2: string;
  emptyStateNoMatch: string;
  allReadyNotice: string;
  
  // Tabs & Stepper
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;

  // Tender Card
  tenderDetails: string;
  tenderId: string;
  tenderTitle: string;
  procuringEntity: string;
  bidderName: string;
  submissionDeadline: string;
  statusBadge: string;
  
  // Step 1: Requirements
  uploadRequirements: string;
  requirementsDropText: string;
  browseJson: string;
  requirementsLoadedSuccess: string;
  invalidJsonError: string;
  missingRequiredFieldsError: string;
  viewRawJson: string;

  // Step 2: Documents
  uploadDocuments: string;
  documentsDropText: string;
  browsePdfs: string;
  fileLimitsNotice: string;
  maxFilesReachedError: string;
  maxSizeExceededError: string;
  nonPdfFileError: string;
  pdfReadError: string;
  uploadedFilesCount: string;
  totalSize: string;
  clearAllFiles: string;
  pages: string;
  duplicateGroup: string;
  duplicateWarning: string;
  removeFile: string;
  notMatchedYet: string;
  matchedTo: string;

  // Step 3: Matching
  matchingWorkspace: string;
  matchingInstruction: string;
  availableFiles: string;
  tenderRequirements: string;
  order: string;
  mandatory: string;
  optional: string;
  expiryRequired: string;
  expiryNotRequired: string;
  matchedFile: string;
  selectFile: string;
  noneMatched: string;
  unmatch: string;
  expiryDateLabel: string;
  autoMatchByName: string;
  duplicatePreventedMessage: string;
  alreadyMatchedElsewhere: string;

  // Statuses
  statusMissing: string;
  statusExpiryNeeded: string;
  statusExpired: string;
  statusNotProvided: string;
  statusOK: string;

  // Step 4: Summary & Generate
  verificationSummary: string;
  totalRequirementsCount: string;
  okCount: string;
  missingCount: string;
  expiryNeededCount: string;
  expiredCount: string;
  notProvidedCount: string;
  duplicateFilesCount: string;
  blockingNotice: string;
  readyNotice: string;
  generatePackage: string;
  generatingPackage: string;
  generationSuccessTitle: string;
  generationSuccessDesc: string;
  downloadPackage: string;
  previewPackage: string;
  closePreview: string;
  totalPagesLabel: string;
  packageFilenameLabel: string;
  
  // Footer
  footerClientSideNotice: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    appName: 'Tender Document Package Builder',
    appSubtitle: 'Prepare a complete tender submission package from your PDF collection.',
    tagline: 'Check. Organize. Submit.',
    contestBadge: 'Official Tender Submission Tool',
    loadSample: 'Load Sample Pack',
    resetAll: 'Reset All',
    privacyBadge: '100% Client-Side Processing • No Server Uploads',
    exportCsv: 'Export Checklist',
    saveProject: 'Save Local Work',
    exportSession: 'Backup Session',
    indexPageToggle: 'Include Document Index Page (Bonus)',
    indexPageDesc: 'Adds Page 2 directory with exact dynamic starting page numbers for each document',
    themeBright: '☀ Bright',
    themeDark: '☾ Dark',

    dossierHeader: 'TENDER PACKAGE',
    nav01: '01 Requirements',
    nav02: '02 Documents',
    nav03: '03 Matching',
    nav04: '04 Check',
    nav05: '05 Package',

    readinessTitle: 'PACKAGE READINESS',
    readinessDocsReady: 'documents ready',
    readinessNeedAttention: 'item needs attention',
    readinessAllGood: 'Your tender package is ready.',
    reviewDocuments: 'Review Documents',
    generateAgain: 'Generate Again',

    emptyStateStep1: 'Load the tender requirements to begin.',
    emptyStateStep2: 'Upload the PDF documents you want to include in your package.',
    emptyStateNoMatch: 'No PDF has been matched to this document yet.',
    allReadyNotice: 'Everything looks good. Your package is ready to generate.',

    step1Title: 'Load Requirements',
    step1Desc: 'Upload tender specification requirements.json',
    step2Title: 'Upload PDFs',
    step2Desc: 'Add submission documents (up to 30 files, 50 MB)',
    step3Title: 'Match Documents',
    step3Desc: 'Pair documents to requirements & verify validity',
    step4Title: 'Check Package',
    step4Desc: 'Review compliance & solve any problems',

    tenderDetails: 'Tender Information',
    tenderId: 'Tender ID',
    tenderTitle: 'Tender Title',
    procuringEntity: 'Procuring Entity',
    bidderName: 'Bidder Name',
    submissionDeadline: 'Submission Deadline',
    statusBadge: 'Tender Status',

    uploadRequirements: 'Load Tender Requirements',
    requirementsDropText: 'Drop requirements.json here, or click to choose file',
    browseJson: 'Choose requirements.json',
    requirementsLoadedSuccess: 'Requirements specification loaded successfully',
    invalidJsonError: 'Invalid JSON file. Please ensure the file contains valid JSON formatting.',
    missingRequiredFieldsError: 'Invalid requirements structure. Must include "tender" (tender_id, title, procuring_entity, bidder, submission_deadline) and "requirements" array.',
    viewRawJson: 'View Requirements Details',

    uploadDocuments: 'Drop your tender PDFs here',
    documentsDropText: 'Drop your tender PDFs here, or click to select multiple files',
    browsePdfs: 'Choose PDF files',
    fileLimitsNotice: 'Up to 30 files · Maximum 50 MB total · PDF files only',
    maxFilesReachedError: 'Maximum 30 files limit exceeded. Please upload fewer files.',
    maxSizeExceededError: 'Total upload size exceeds 50 MB limit. Please remove or compress some files.',
    nonPdfFileError: 'This file is not a PDF and was not added:',
    pdfReadError: 'Unable to read this PDF. It may be damaged or password protected.',
    uploadedFilesCount: 'Uploaded files',
    totalSize: 'Total size',
    clearAllFiles: 'Remove all files',
    pages: 'pages',
    duplicateGroup: 'Exact Duplicate Detected',
    duplicateWarning: 'Identical file content detected with',
    removeFile: 'Remove',
    notMatchedYet: 'Unmatched',
    matchedTo: 'Matched to',

    matchingWorkspace: 'Document Matching Workspace',
    matchingInstruction: 'Match each requirement with its corresponding PDF file. One file can be matched to at most one requirement.',
    availableFiles: 'Available Uploaded PDFs',
    tenderRequirements: 'Tender Requirements',
    order: 'Order',
    mandatory: 'Mandatory',
    optional: 'Optional',
    expiryRequired: 'Expiry required',
    expiryNotRequired: 'No expiry needed',
    matchedFile: 'Matched PDF File',
    selectFile: 'Select a PDF document...',
    noneMatched: 'No PDF matched yet',
    unmatch: 'Remove match',
    expiryDateLabel: 'Document Expiry Date',
    autoMatchByName: 'Suggest Matches',
    duplicatePreventedMessage: 'Cannot match: an identical duplicate file is already assigned to',
    alreadyMatchedElsewhere: 'Already assigned to another requirement',

    statusMissing: 'Missing',
    statusExpiryNeeded: 'Expiry date needed',
    statusExpired: 'Expired',
    statusNotProvided: 'Not provided',
    statusOK: 'OK',

    verificationSummary: 'Check Everything',
    totalRequirementsCount: 'Total requirements',
    okCount: 'Ready',
    missingCount: 'Missing',
    expiryNeededCount: 'Expiry date needed',
    expiredCount: 'Expired',
    notProvidedCount: 'Optional not provided',
    duplicateFilesCount: 'Duplicates',
    blockingNotice: 'Your package is not ready yet. Please fix the items marked as problems.',
    readyNotice: 'Everything looks good. Your package is ready to generate.',
    generatePackage: 'Generate Package',
    generatingPackage: 'Generating Official Package...',
    generationSuccessTitle: 'Package Generated Successfully',
    generationSuccessDesc: 'Your tender package has been combined with an official English cover page and footer on every page.',
    downloadPackage: 'Download Package',
    previewPackage: 'Preview Generated PDF',
    closePreview: 'Close Preview',
    totalPagesLabel: 'Total Pages',
    packageFilenameLabel: 'File Name',

    footerClientSideNotice: 'Tender Document Package Builder • 100% Client-Side In-Browser Processing'
  },
  bn: {
    appName: 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার',
    appSubtitle: 'আপনার পিডিএফ সংগ্রহ থেকে একটি পূর্ণাঙ্গ টেন্ডার সাবমিশন প্যাকেজ প্রস্তুত করুন।',
    tagline: 'যাচাই করুন. সাজান. জমা দিন.',
    contestBadge: 'অফিসিয়াল টেন্ডার সাবমিশন টুল',
    loadSample: 'নমুনা প্যাক লোড করুন',
    resetAll: 'সব রিসেট করুন',
    privacyBadge: 'সম্পূর্ণ ক্লায়েন্ট-সাইড প্রসেসিং • কোনো সার্ভার আপলোড নেই',
    exportCsv: 'চেকলিস্ট এক্সপোর্ট',
    saveProject: 'প্রজেক্ট সংরক্ষণ করুন',
    exportSession: 'ব্যাকআপ সেশন',
    indexPageToggle: 'ডকুমেন্ট ইনডেক্স পেজ যুক্ত করুন (বোনাস)',
    indexPageDesc: 'প্রতিটি ডকুমেন্টের সঠিক শুরু পৃষ্ঠার রেফারেন্স সহ ২য় পৃষ্ঠায় ডিরেক্টরি যুক্ত করে',
    themeBright: '☀ উজ্জ্বল',
    themeDark: '☾ অন্ধকার',

    dossierHeader: 'টেন্ডার প্যাকেজ',
    nav01: '০১ রিকোয়ারমেন্ট',
    nav02: '০২ ডকুমেন্টস',
    nav03: '০৩ ম্যাচিং',
    nav04: '০৪ যাচাই',
    nav05: '০৫ প্যাকেজ',

    readinessTitle: 'প্যাকেজ প্রস্তুতি',
    readinessDocsReady: 'ডকুমেন্ট প্রস্তুত',
    readinessNeedAttention: 'আইটেম সমাধান প্রয়োজন',
    readinessAllGood: 'আপনার টেন্ডার প্যাকেজ প্রস্তুত।',
    reviewDocuments: 'ডকুমেন্টসমূহ দেখুন',
    generateAgain: 'পুনরায় প্যাকেজ তৈরি করুন',

    emptyStateStep1: 'শুরু করতে টেন্ডার রিকোয়ারমেন্ট লোড করুন।',
    emptyStateStep2: 'আপনার প্যাকেজে অন্তর্ভুক্ত করার জন্য পিডিএফ ডকুমেন্টগুলো আপলোড করুন।',
    emptyStateNoMatch: 'এখনও কোনো পিডিএফ এই রিকোয়ারমেন্টে ম্যাচ করা হয়নি।',
    allReadyNotice: 'সবকিছু ঠিক আছে। আপনার প্যাকেজ তৈরি করার জন্য প্রস্তুত।',

    step1Title: 'রিকোয়ারমেন্ট লোড',
    step1Desc: 'টেন্ডারের requirements.json ফাইলটি আপলোড করুন',
    step2Title: 'পিডিএফ আপলোড',
    step2Desc: 'কাগজপত্রের ফাইল যুক্ত করুন (সর্বোচ্চ ৩০টি, ৫০ মেগাবাইট)',
    step3Title: 'ডকুমেন্ট ম্যাচিং',
    step3Desc: 'রিকোয়ারমেন্ট অনুযায়ী ফাইল ম্যাচ করুন ও মেয়াদ দিন',
    step4Title: 'যাচাই করুন',
    step4Desc: 'সবকিছু পরীক্ষা করুন ও ত্রুটি সমাধান করুন',

    tenderDetails: 'টেন্ডারের তথ্যাবলী',
    tenderId: 'টেন্ডার আইডি',
    tenderTitle: 'টেন্ডারের শিরোনাম',
    procuringEntity: 'সংগ্রহকারী কর্তৃপক্ষ (Procuring Entity)',
    bidderName: 'দরদাতা প্রতিষ্ঠান (Bidder)',
    submissionDeadline: 'জমা দেওয়ার শেষ সময় (Deadline)',
    statusBadge: 'টেন্ডার স্ট্যাটাস',

    uploadRequirements: 'টেন্ডার রিকোয়ারমেন্ট লোড করুন',
    requirementsDropText: 'এখানে requirements.json ফাইলটি ড্রপ করুন, বা ক্লিক করে বেছে নিন',
    browseJson: 'requirements.json বেছে নিন',
    requirementsLoadedSuccess: 'রিকোয়ারমেন্ট স্পেসিফিকেশন সফলভাবে লোড হয়েছে',
    invalidJsonError: 'ভুল JSON ফরম্যাট। অনুগ্রহ করে সঠিক JSON ফাইল প্রদান করুন।',
    missingRequiredFieldsError: 'রিকোয়ারমেন্টের কাঠামো ভুল। অবশ্যই "tender" এবং "requirements" তালিকা থাকতে হবে।',
    viewRawJson: 'রিকোয়ারমেন্ট বিবরণ দেখুন',

    uploadDocuments: 'এখানে আপনার টেন্ডার পিডিএফ ফাইলগুলো ড্রপ করুন',
    documentsDropText: 'এখানে পিডিএফ ফাইলগুলো ড্রপ করুন, অথবা ক্লিক করে একাধিক ফাইল বেছে নিন',
    browsePdfs: 'পিডিএফ ফাইল বাছাই করুন',
    fileLimitsNotice: 'অনূর্ধ্ব ৩০টি ফাইল · মোট সাইজ সর্বোচ্চ ৫০ মেগাবাইট · শুধুমাত্র পিডিএফ ফাইল',
    maxFilesReachedError: 'সর্বোচ্চ ৩০টি ফাইলের সীমা অতিক্রম করেছে।',
    maxSizeExceededError: 'মোট ফাইলের আকার ৫০ মেগাবাইটের বেশি হয়ে গেছে। কিছু ফাইল মুছে দিন।',
    nonPdfFileError: 'এই ফাইলটি পিডিএফ নয় এবং যুক্ত করা হয়নি:',
    pdfReadError: 'এই পিডিএফটি পড়া সম্ভব হয়নি। ফাইলটি ক্ষতিগ্রস্ত অথবা পাসওয়ার্ড সংরক্ষিত হতে পারে।',
    uploadedFilesCount: 'আপলোডকৃত ফাইল',
    totalSize: 'মোট সাইজ',
    clearAllFiles: 'সব ফাইল মুছুন',
    pages: 'পৃষ্ঠা',
    duplicateGroup: 'হুবহু ডুপ্লিকেট শনাক্ত হয়েছে',
    duplicateWarning: 'ফাইলের ভেতরের তথ্য হুবহু মিলে গেছে এর সাথে:',
    removeFile: 'মুছুন',
    notMatchedYet: 'ম্যাচ হয়নি',
    matchedTo: 'ম্যাচ করা হয়েছে',

    matchingWorkspace: 'ডকুমেন্ট ম্যাচিং ওয়ার্কস্পেস',
    matchingInstruction: 'আপলোডকৃত পিডিএফ ফাইলের সাথে টেন্ডার রিকোয়ারমেন্ট ম্যাচ করুন। একটি ফাইল সর্বোচ্চ একটি রিকোয়ারমেন্টে যুক্ত হতে পারে।',
    availableFiles: 'উপলব্ধ পিডিএফ ফাইলসমূহ',
    tenderRequirements: 'টেন্ডার রিকোয়ারমেন্ট',
    order: 'ক্রম',
    mandatory: 'বাধ্যতামূলক',
    optional: 'ঐচ্ছিক',
    expiryRequired: 'মেয়াদ প্রযোজ্য',
    expiryNotRequired: 'মেয়াদ প্রয়োজন নেই',
    matchedFile: 'নির্ধারিত পিডিএফ ফাইল',
    selectFile: 'একটি পিডিএফ নির্বাচন করুন...',
    noneMatched: 'এখনও কোনো পিডিএফ ম্যাচ হয়নি',
    unmatch: 'ম্যাচ বাতিল করুন',
    expiryDateLabel: 'ডকুমেন্টের মেয়াদের তারিখ',
    autoMatchByName: 'ম্যাচ প্রস্তাবনা',
    duplicatePreventedMessage: 'ম্যাচ করা যাবে না: একই কন্টেন্টের ফাইল ইতিমধ্যে যুক্ত আছে',
    alreadyMatchedElsewhere: 'ইতিমধ্যে অন্য রিকোয়ারমেন্টে ব্যবহৃত হয়েছে',

    statusMissing: 'Missing',
    statusExpiryNeeded: 'Expiry date needed',
    statusExpired: 'Expired',
    statusNotProvided: 'Not provided',
    statusOK: 'OK',

    verificationSummary: 'সবকিছু পরীক্ষা করুন',
    totalRequirementsCount: 'মোট রিকোয়ারমেন্ট',
    okCount: 'প্রস্তুত',
    missingCount: 'অনুপস্থিত',
    expiryNeededCount: 'মেয়াদ তারিখ দরকার',
    expiredCount: 'মেয়াদোত্তীর্ণ',
    notProvidedCount: 'ঐচ্ছিক বাদ দেওয়া হয়েছে',
    duplicateFilesCount: 'ডুপ্লিকেট',
    blockingNotice: 'আপনার প্যাকেজ এখনও প্রস্তুত নয়। সমস্যা হিসেবে চিহ্নিত আইটেমগুলো সংশোধন করুন।',
    readyNotice: 'সবকিছু ঠিক আছে। আপনার প্যাকেজ তৈরি করার জন্য প্রস্তুত।',
    generatePackage: 'প্যাকেজ তৈরি করুন',
    generatingPackage: 'অফিসিয়াল প্যাকেজ তৈরি হচ্ছে...',
    generationSuccessTitle: 'প্যাকেজ সফলভাবে তৈরি হয়েছে',
    generationSuccessDesc: 'ইংরেজি কভার পেজ এবং প্রতিটি পৃষ্ঠায় নম্বর সহ আপনার টেন্ডার প্যাকেজ প্রস্তুত।',
    downloadPackage: 'প্যাকেজ ডাউনলোড করুন',
    previewPackage: 'পিডিএফ প্রিভিউ',
    closePreview: 'প্রিভিউ বন্ধ করুন',
    totalPagesLabel: 'মোট পৃষ্ঠা',
    packageFilenameLabel: 'ফাইলের নাম',

    footerClientSideNotice: 'টেন্ডার ডকুমেন্ট প্যাকেজ বিল্ডার • ১০০% ক্লায়েন্ট-সাইড ব্রাউজার প্রসেসিং'
  }
};

/**
 * Returns translated label for DocumentStatus.
 */
export function getStatusText(status: DocumentStatus, lang: SupportedLanguage): string {
  if (lang === 'bn') {
    switch (status) {
      case 'OK':
        return 'OK (সঠিক)';
      case 'Missing':
        return 'Missing (অনুপস্থিত)';
      case 'Expiry date needed':
        return 'Expiry date needed (মেয়াদের তারিখ প্রয়োজন)';
      case 'Expired':
        return 'Expired (মেয়াদোত্তীর্ণ)';
      case 'Not provided':
        return 'Not provided (সরবরাহ করা হয়নি)';
    }
  }
  return status;
}
