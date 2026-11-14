import { formatDiscount, formatPrice, isLowStock, lotSubtitle, plural } from '../format';
import type { StaffLot } from '../types';

const lot = (patch: Partial<StaffLot> = {}): StaffLot => ({
  id: 'l', name: 'Круасан', base_price_minor: 4500, regular_price_minor: 9500, quantity: 3, unit: 'pcs',
  pickup_to: new Date(2026, 10, 15, 21, 0).toISOString(), status: 'active', is_bundle: false, photo: null, allergens: [], version: 1, ...patch,
});

describe('формат цін', () => {
  it('гривні без копійок і з копійками', () => {
    expect(formatPrice(4500)).toBe('45 ₴');
    expect(formatPrice(4550)).toBe('45,50 ₴');
    expect(formatPrice(1248000)).toBe('12 480 ₴');
  });
  it('знижка від ціни меню', () => {
    expect(formatDiscount(4500, 9500)).toBe('−53 %');
    expect(formatDiscount(4500, null)).toBeNull();
    expect(formatDiscount(4500, 4500)).toBeNull();
  });
});

describe('підпис лота', () => {
  it('кількість, одиниця й час видачі', () => {
    expect(lotSubtitle(lot())).toBe('3 шт · до 21:00');
    expect(lotSubtitle(lot({ quantity: 2, unit: 'sets' }))).toBe('2 набори · до 21:00');
    expect(lotSubtitle(lot({ quantity: 5, unit: 'portions' }))).toBe('5 порцій · до 21:00');
  });
  it('останній екземпляр', () => {
    expect(isLowStock(lot({ quantity: 1 }))).toBe(true);
    expect(lotSubtitle(lot({ quantity: 1 }))).toBe('Лишився останній');
  });
  it('примітка чернетки має пріоритет', () => {
    expect(lotSubtitle(lot({ status: 'draft', note: 'Запропонований набір' }))).toBe('Запропонований набір');
  });
  it('українська множина', () => {
    expect(plural(1, ['набір', 'набори', 'наборів'])).toBe('набір');
    expect(plural(11, ['набір', 'набори', 'наборів'])).toBe('наборів');
    expect(plural(22, ['набір', 'набори', 'наборів'])).toBe('набори');
  });
});
