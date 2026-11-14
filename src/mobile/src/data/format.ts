import type { StaffLot } from './types';

const UAH = ' ₴';

/** 4500 → «45 ₴»; копійки показуються лише якщо вони є. */
export function formatPrice(minor: number): string {
  const whole = Math.floor(minor / 100);
  const cents = minor % 100;
  const grouped = whole.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return cents ? `${grouped},${cents.toString().padStart(2, '0')}${UAH}` : `${grouped}${UAH}`;
}

/** Знижка у відсотках, округлена: 45 від 95 → «−53 %». */
export function formatDiscount(priceMinor: number, regularMinor: number | null): string | null {
  if (!regularMinor || regularMinor <= priceMinor) return null;
  const percent = Math.round((1 - priceMinor / regularMinor) * 100);
  return `−${percent} %`;
}

/** Час видачі у форматі 21:00 за місцевим часом. */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

const UNIT: Record<StaffLot['unit'], [string, string, string]> = {
  pcs: ['шт', 'шт', 'шт'],
  sets: ['набір', 'набори', 'наборів'],
  portions: ['порція', 'порції', 'порцій'],
};

/** Українська множина: 1 набір, 2 набори, 5 наборів. */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export function isLowStock(lot: StaffLot): boolean {
  return lot.status === 'active' && lot.quantity === 1;
}

/** Підпис під назвою: «3 шт · до 21:00», «Лишився останній» або примітка чернетки. */
export function lotSubtitle(lot: StaffLot): string {
  if (lot.note) return lot.note;
  if (isLowStock(lot)) return 'Лишився останній';
  if (lot.status === 'sold_out') return `Розпродано · до ${formatTime(lot.pickup_to)}`;
  return `${lot.quantity} ${plural(lot.quantity, UNIT[lot.unit])} · до ${formatTime(lot.pickup_to)}`;
}

/** Джерело зображення: локальний ресурс (число з `require`) або адреса знімка. */
export function imageSource(photo: number | string): number | { uri: string } {
  return typeof photo === 'string' ? { uri: photo } : photo;
}

/** Підписи алергенів українською (коди — як в API). */
export const ALLERGEN_LABEL: Record<import('./types').AllergenCode, string> = {
  gluten: 'Глютен',
  nuts: 'Горіхи',
  milk: 'Молоко',
  eggs: 'Яйця',
  soy: 'Соя',
  fish: 'Риба',
};
