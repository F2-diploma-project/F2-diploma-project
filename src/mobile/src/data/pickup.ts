/** Типи й правила «Видачі» — відповідають `docs/api/openapi.yaml` (Redemptions). */

export type OrderStatus = 'awaiting_pickup' | 'picked_up';

/** `POST /v1/venue/redemptions/lookup` → `OrderPreview`. */
export interface OrderPreview {
  order_id: string;
  confirmation_code: string;
  lot_name: string;
  /** У API — `photo_url`; число — вбудоване тестове фото заглушки. */
  photo: string | number | null;
  quantity: number;
  unit_price_minor: number;
  total_minor: number;
  currency: 'UAH';
  pickup_from: string;
  pickup_to: string;
  status: OrderStatus;
  redeemed_at: string | null;
}

/** `POST /v1/venue/redemptions` → `Redemption`. */
export interface Redemption {
  order_id: string;
  confirmation_code: string;
  lot_name: string;
  quantity: number;
  redeemed_at: string;
  late: boolean;
}

/** Замовлення визначається QR-токеном або кодом підтвердження (рівно одне). */
export type PickupRef = { token: string } | { confirmation_code: string };

export type PickupErrorCode = 'TOKEN_NOT_FOUND' | 'TOKEN_ALREADY_USED' | 'TOKEN_EXPIRED' | 'RATE_LIMITED' | 'NETWORK';

export class PickupError extends Error {
  constructor(
    public readonly code: PickupErrorCode,
    /** Для `TOKEN_ALREADY_USED` — коли замовлення видали. */
    public readonly redeemedAt: string | null = null,
  ) {
    super(code);
  }
}

export interface PickupService {
  lookup(ref: PickupRef): Promise<OrderPreview>;
  redeem(ref: PickupRef, options?: { allowLate?: boolean }): Promise<Redemption>;
}

export const CODE_LENGTH = 6;
const CODE_PATTERN = /^[A-Z0-9]{3}-[A-Z0-9]{3}$/;
/** Кириличні літери, що виглядають як латинські (касир може набрати код в українській розкладці). */
const CYRILLIC_TWINS: Record<string, string> = { А: 'A', В: 'B', Е: 'E', К: 'K', М: 'M', Н: 'H', О: 'O', Р: 'P', С: 'C', Т: 'T', Х: 'X', І: 'I' };

/** Приводить введення до вигляду `K7Q-4M2`: великі латинські літери й цифри, дефіс після третього символу. */
export function normalizeCode(input: string): string {
  const chars = [...input.toUpperCase()]
    .map((ch) => CYRILLIC_TWINS[ch] ?? ch)
    .filter((ch) => /[A-Z0-9]/.test(ch))
    .slice(0, CODE_LENGTH)
    .join('');
  return chars.length > 3 ? `${chars.slice(0, 3)}-${chars.slice(3)}` : chars;
}

/** Скільки символів коду вже введено (без дефіса). */
export function codeLength(code: string): number {
  return code.replace(/-/g, '').length;
}

export function isCompleteCode(code: string): boolean {
  return CODE_PATTERN.test(code);
}

/** Вікно видачі вже минуло. */
export function isLate(order: Pick<OrderPreview, 'pickup_to'>, now: Date = new Date()): boolean {
  return now.getTime() > new Date(order.pickup_to).getTime();
}
