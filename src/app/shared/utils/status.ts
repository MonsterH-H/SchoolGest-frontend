// Utility functions for status normalization and validation
export function normalizeStatus(s?: string): string {
  if (!s) return '';
  return s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

export const DONE_STATUSES = new Set([
  'traite', 'traitee', 'traitee', 'clos', 'cloture', 'rejete', 'rejetee', 'rejeté'
]);

export const PROCESSING_STATUSES = new Set([
  'en_cours', 'en cours', 'processing', 'traitement_en_cours'
]);

export function isDoneStatus(status?: string): boolean {
  return DONE_STATUSES.has(normalizeStatus(status));
}

export function isProcessingStatus(status?: string): boolean {
  return PROCESSING_STATUSES.has(normalizeStatus(status));
}

export function canProcessSignalement(signalement: any): boolean {
  if (!signalement) return false;
  if (signalement.processing) return false; // déjà en cours localement
  if (signalement.alreadyProcessed === true) return false; // drapeau serveur
  if (isDoneStatus(signalement.statut)) return false; // statut final
  if (isProcessingStatus(signalement.statut)) return false; // déjà en cours côté serveur
  return true;
}