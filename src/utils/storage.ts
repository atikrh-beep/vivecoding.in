import { RequirementsPayload } from '../types/tender';

export interface SavedSession {
  version: number;
  timestamp: string;
  payload: RequirementsPayload | null;
  matches: Record<string, string>; // requirementId -> fileId
  expiryDates: Record<string, string>; // requirementId -> YYYY-MM-DD
  fileMetadata: {
    id: string;
    name: string;
    size: number;
    hash: string;
    pageCount: number;
  }[];
}

const STORAGE_KEY = 'tender_builder_active_session_v1';

/**
 * Saves current workspace state to browser localStorage.
 */
export function saveSessionToLocalStorage(session: SavedSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (err) {
    console.warn('Could not save session to localStorage:', err);
  }
}

/**
 * Retrieves saved session from browser localStorage.
 */
export function loadSessionFromLocalStorage(): SavedSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Could not load session from localStorage:', err);
    return null;
  }
}

/**
 * Clears saved session from browser localStorage.
 */
export function clearSavedSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Could not clear session:', err);
  }
}

/**
 * Exports current workspace project as a JSON file.
 */
export function exportSessionToFile(session: SavedSession, tenderId: string = 'Tender'): void {
  const cleanId = tenderId.replace(/[/\\?%*:|"<>]/g, '_');
  const filename = `${cleanId}_ProjectSession.json`;
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
