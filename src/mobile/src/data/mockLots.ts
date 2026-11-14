import type { LotsService, StaffLot, VenueLotStatus } from './types';

/** Тестові дані до появи API лотів (`GET /v1/venue/lots`). Тексти й ціни — як у макетах Figma. */
const today = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

export const FIXTURE_LOTS: StaffLot[] = [
  { id: 'lot-croissant', name: 'Круасан з мигдалем', base_price_minor: 4500, regular_price_minor: 9500, quantity: 3, unit: 'pcs', pickup_to: today(21), status: 'active', is_bundle: false, photo: require('../../assets/photos/croissant_b.jpg') },
  { id: 'lot-set-coffee', name: 'Сет «Круасан + кава»', base_price_minor: 7900, regular_price_minor: 14000, quantity: 2, unit: 'sets', pickup_to: today(21), status: 'active', is_bundle: true, photo: require('../../assets/photos/set.jpg') },
  { id: 'lot-quiche', name: 'Кіш зі шпинатом', base_price_minor: 6000, regular_price_minor: 12000, quantity: 1, unit: 'pcs', pickup_to: today(21), status: 'active', is_bundle: false, photo: require('../../assets/photos/quiche_a.jpg') },
  { id: 'lot-bread', name: 'Багет житній', base_price_minor: 2500, regular_price_minor: 4800, quantity: 4, unit: 'pcs', pickup_to: today(21), status: 'active', is_bundle: false, photo: require('../../assets/photos/bread.jpg') },
  { id: 'lot-syrnyk', name: 'Сирник із родзинками', base_price_minor: 4000, regular_price_minor: 8000, quantity: 2, unit: 'pcs', pickup_to: today(21), status: 'draft', is_bundle: false, photo: require('../../assets/photos/syrtea.jpg'), note: '2 шт · перевірте ціну' },
  { id: 'lot-set-tea', name: 'Сет «Сирник + чай»', base_price_minor: 6500, regular_price_minor: 11500, quantity: 2, unit: 'sets', pickup_to: today(21), status: 'draft', is_bundle: true, photo: require('../../assets/photos/syrnyk.jpg'), note: 'Запропонований набір' },
  { id: 'lot-coffee', name: 'Кава фільтр', base_price_minor: 3000, regular_price_minor: 5500, quantity: 0, unit: 'portions', pickup_to: today(21), status: 'sold_out', is_bundle: false, photo: require('../../assets/photos/coffee.jpg') },
];

export interface MockOptions {
  lots?: StaffLot[];
  delayMs?: number;
  fail?: boolean;
}

/** Заглушка сервісу лотів з тим самим інтерфейсом, що й майбутній клієнт API. */
export function createMockLotsService({ lots = FIXTURE_LOTS, delayMs = 400, fail = false }: MockOptions = {}): LotsService {
  let data = lots.map((l) => ({ ...l }));
  const wait = () => new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new Error('NETWORK')) : resolve()), delayMs));
  return {
    async list(status: VenueLotStatus) {
      await wait();
      return data.filter((l) => l.status === status);
    },
    async counts() {
      await wait();
      const c: Record<VenueLotStatus, number> = { draft: 0, active: 0, sold_out: 0, withdrawn: 0 };
      for (const l of data) c[l.status] += 1;
      return c;
    },
    async unpublish(lotId: string) {
      await wait();
      data = data.map((l) => (l.id === lotId ? { ...l, status: 'draft' } : l));
    },
  };
}

export const lotsService = createMockLotsService();
