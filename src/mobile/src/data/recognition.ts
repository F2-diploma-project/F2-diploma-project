/** Типи й правила Snap & Sell — відповідають `docs/api/openapi.yaml` (Recognition). */

export type RecognitionJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'needs_review';
export type RecognitionErrorCode =
  | 'TENANT_MISMATCH'
  | 'IMAGE_MISSING'
  | 'IMAGE_CORRUPT'
  | 'VISION_REJECTED'
  | 'SCHEMA_INVALID'
  | 'EMPTY_RESULT'
  | 'RETRIES_EXHAUSTED';
export type ReviewStatus = 'auto_accepted' | 'pending_review' | 'accepted' | 'rejected';

export interface RecognitionItem {
  id: string;
  position: number;
  name: string;
  quantity: number;
  confidence: number;
  review_status: ReviewStatus;
  lot_id: string | null;
}

/**
 * Пропозиція смарт-бандла. У API її ще немає (відкрите питання) — поле додано лише в заглушці,
 * сам набір створюється через `POST /v1/venue/lots` з `bundle_items`.
 */
export interface BundleSuggestion {
  name: string;
  items: { name: string; quantity: number }[];
  price_minor: number;
  regular_price_minor: number;
}

export interface RecognitionJob {
  id: string;
  status: RecognitionJobStatus;
  error_code: RecognitionErrorCode | null;
  items: RecognitionItem[];
  bundle_suggestion?: BundleSuggestion | null;
}

export interface PickedImage {
  /** Адреса знімка; число — вбудоване тестове фото (лише режим розробки). */
  uri: string | number;
  mimeType?: string | null;
  fileSize?: number | null;
}

export interface RecognitionService {
  createJob(image: PickedImage): Promise<{ job_id: string }>;
  getJob(jobId: string): Promise<RecognitionJob>;
  review(jobId: string, itemId: string, decision: 'accept' | 'reject', fix?: { name?: string; quantity?: number }): Promise<RecognitionItem>;
  /** Фото, з якого запущено завдання (для показу на екранах). */
  photoOf(jobId: string): string | number | null;
}

/** Межі з API: JPEG або PNG, не більше 10 485 760 байт. */
export const MAX_IMAGE_BYTES = 10_485_760;
const ALLOWED = ['image/jpeg', 'image/png'];

export type ImageProblem = 'TYPE' | 'SIZE' | null;

/**
 * Перевірка перед завантаженням: тип за MIME від системи (не за іменем файлу) і розмір.
 * Сервер додатково перевіряє сигнатуру файлу.
 */
export function checkImage(image: PickedImage): ImageProblem {
  if (!image.mimeType || !ALLOWED.includes(image.mimeType.toLowerCase())) return 'TYPE';
  if (image.fileSize != null && image.fileSize > MAX_IMAGE_BYTES) return 'SIZE';
  return null;
}

export const IMAGE_PROBLEM_TEXT: Record<Exclude<ImageProblem, null>, string> = {
  TYPE: 'Підходять лише фото JPEG або PNG.',
  SIZE: 'Фото завелике — до 10 МБ. Зробіть знімок камерою застосунку.',
};

/** Чи завдання вже має результат. */
export const isFinished = (s: RecognitionJobStatus) => s === 'completed' || s === 'needs_review' || s === 'failed';
