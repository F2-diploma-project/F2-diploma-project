import { LotError, type LotsService, type StaffLot, type VenueLotStatus } from './types';
import type { BundleSuggestion, PickedImage, RecognitionItem, RecognitionJob, RecognitionService } from './recognition';
import { isLate, PickupError, type OrderPreview, type PickupRef, type PickupService, type Redemption } from './pickup';

/** Спільне сховище заглушки: лоти, завдання розпізнавання. Замінюється на клієнт API. */
const at = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const P = {
  croissant: require('../../assets/photos/croissant_b.jpg'),
  set: require('../../assets/photos/set.jpg'),
  quiche: require('../../assets/photos/quiche_a.jpg'),
  bread: require('../../assets/photos/bread.jpg'),
  syrtea: require('../../assets/photos/syrtea.jpg'),
  syrnyk: require('../../assets/photos/syrnyk.jpg'),
  coffee: require('../../assets/photos/coffee.jpg'),
};

export const FIXTURE_LOTS: StaffLot[] = [
  { id: 'lot-croissant', name: 'Круасан з мигдалем', base_price_minor: 4500, regular_price_minor: 9500, quantity: 3, unit: 'pcs', pickup_to: at(21), status: 'active', is_bundle: false, allergens: ['gluten', 'nuts', 'milk'], version: 1, photo: P.croissant },
  { id: 'lot-set-coffee', name: 'Сет «Круасан + кава»', base_price_minor: 7900, regular_price_minor: 14000, quantity: 2, unit: 'sets', pickup_to: at(21), status: 'active', is_bundle: true, allergens: ['gluten', 'milk'], version: 1, photo: P.set },
  { id: 'lot-quiche', name: 'Кіш зі шпинатом', base_price_minor: 6000, regular_price_minor: 12000, quantity: 1, unit: 'pcs', pickup_to: at(21), status: 'active', is_bundle: false, allergens: ['gluten', 'eggs', 'milk'], version: 1, photo: P.quiche },
  { id: 'lot-bread', name: 'Багет житній', base_price_minor: 2500, regular_price_minor: 4800, quantity: 4, unit: 'pcs', pickup_to: at(21), status: 'active', is_bundle: false, allergens: ['gluten'], version: 1, photo: P.bread },
  { id: 'lot-syrnyk', name: 'Сирник із родзинками', base_price_minor: 4000, regular_price_minor: 8000, quantity: 2, unit: 'pcs', pickup_to: at(21), status: 'draft', is_bundle: false, allergens: ['milk', 'eggs'], version: 1, photo: P.syrtea, note: '2 шт · перевірте ціну' },
  { id: 'lot-set-tea', name: 'Сет «Сирник + чай»', base_price_minor: 6500, regular_price_minor: 11500, quantity: 2, unit: 'sets', pickup_to: at(21), status: 'draft', is_bundle: true, allergens: ['milk', 'eggs'], version: 1, photo: P.syrnyk, note: 'Запропонований набір' },
  { id: 'lot-coffee-sold', name: 'Кава фільтр', base_price_minor: 3000, regular_price_minor: 5500, quantity: 0, unit: 'portions', pickup_to: at(21), status: 'sold_out', is_bundle: false, allergens: [], version: 1, photo: P.coffee },
];

/** Що «бачить» Vision на тестовому фото вітрини. */
export const FIXTURE_RECOGNITION = {
  items: [
    { name: 'Круасан з мигдалем', quantity: 3, confidence: 0.94, price: 4500, regular: 9500, photo: P.croissant, allergens: ['gluten', 'nuts', 'milk'], box: { x: 0.05, y: 0.05, width: 0.45, height: 0.45 } },
    { name: 'Сирник із родзинками', quantity: 2, confidence: 0.88, price: 4000, regular: 8000, photo: P.syrtea, allergens: ['milk', 'eggs'], box: { x: 0.5, y: 0.05, width: 0.45, height: 0.45 } },
    { name: 'Кава фільтр', quantity: 6, confidence: 0.81, price: 3000, regular: 5500, photo: P.coffee, allergens: [], box: { x: 0.05, y: 0.5, width: 0.45, height: 0.45 } },
    { name: 'Булочка з корицею', quantity: 4, confidence: 0.58, price: 3500, regular: 6500, photo: null, allergens: ['gluten', 'milk'], box: { x: 0.5, y: 0.5, width: 0.45, height: 0.45 } },
  ],
  bundle: { name: 'Сет «Круасан + кава»', items: [{ name: 'Круасан з мигдалем', quantity: 1 }, { name: 'Кава фільтр', quantity: 1 }], price_minor: 6900, regular_price_minor: 15000 } as BundleSuggestion,
} as const;

const token = (seed: string) => `${seed}${'_'.repeat(43)}`.slice(0, 43);
const minutesFromNow = (m: number) => new Date(Date.now() + m * 60_000).toISOString();

/** Тестові замовлення для «Видачі»: код під QR і вміст QR (токен). Час рахується від моменту запуску. */
export const FIXTURE_ORDERS = {
  awaiting: { code: 'K7Q-4M2', token: token('qrAwaitingK7Q4M2'), lot_name: 'Сет «Круасан + кава»', photo: P.set, quantity: 2, unit_price_minor: 6900, pickupFromMin: -60, pickupToMin: 120, redeemedMin: null },
  late: { code: 'L8T-3P5', token: token('qrLateL8T3P5'), lot_name: 'Кіш зі шпинатом', photo: P.quiche, quantity: 1, unit_price_minor: 6000, pickupFromMin: -240, pickupToMin: -45, redeemedMin: null },
  redeemed: { code: 'R2D-9X4', token: token('qrRedeemedR2D9X4'), lot_name: 'Круасан з мигдалем', photo: P.croissant, quantity: 3, unit_price_minor: 4500, pickupFromMin: -120, pickupToMin: 90, redeemedMin: -25 },
} as const;

export interface MockOptions {
  lots?: StaffLot[];
  delayMs?: number;
  fail?: boolean;
  /** Розпізнавання: `ok` — позиції знайдено, `empty` — нічого не знайдено. */
  recognition?: 'ok' | 'empty';
  /** Скільки опитувань завдання проходить до результату. */
  processingPolls?: number;
  /** Ліміт запитів із кодом підтвердження за хвилину (як у API — 10). */
  codeAttemptsPerMinute?: number;
}

export function createMockBackend({ lots = FIXTURE_LOTS, delayMs = 400, fail = false, recognition = 'ok', processingPolls = 2, codeAttemptsPerMinute = 10 }: MockOptions = {}) {
  let data: StaffLot[] = lots.map((l) => ({ ...l }));
  const jobs = new Map<string, { job: RecognitionJob; polls: number; photo: string | number | null }>();
  let seq = 0;
  const wait = () => new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new LotError('NETWORK')) : resolve()), delayMs));
  const find = (id: string) => {
    const lot = data.find((l) => l.id === id);
    if (!lot) throw new LotError('NOT_FOUND');
    return lot;
  };
  const save = (lot: StaffLot) => {
    data = data.map((l) => (l.id === lot.id ? lot : l));
    return { ...lot };
  };
  const createLot = (input: Partial<StaffLot> & Pick<StaffLot, 'name' | 'base_price_minor' | 'quantity' | 'pickup_to'>): StaffLot => {
    const lot: StaffLot = {
      id: `lot-new-${++seq}`, regular_price_minor: null, unit: input.bundle_items ? 'sets' : 'pcs', status: 'draft', is_bundle: Boolean(input.bundle_items),
      allergens: [], version: 1, photo: null, ...input,
    };
    data = [lot, ...data];
    return { ...lot };
  };

  const lotsService: LotsService = {
    async list(status: VenueLotStatus) {
      await wait();
      return data.filter((l) => l.status === status).map((l) => ({ ...l }));
    },
    async counts() {
      await wait();
      const c: Record<VenueLotStatus, number> = { draft: 0, active: 0, sold_out: 0, withdrawn: 0 };
      for (const l of data) c[l.status] += 1;
      return c;
    },
    async get(id) {
      await wait();
      return { ...find(id) };
    },
    async create(input) {
      await wait();
      return createLot({ ...input, allergens: input.allergens ?? [] });
    },
    async update(id, patch) {
      await wait();
      const lot = find(id);
      if (patch.version !== lot.version) throw new LotError('VERSION_CONFLICT');
      const { version: _v, ...rest } = patch;
      return save({ ...lot, ...rest, note: undefined, version: lot.version + 1 });
    },
    async publish(id) {
      await wait();
      const lot = find(id);
      if (lot.status !== 'draft') throw new LotError('INVALID_STATE');
      return save({ ...lot, status: 'active', note: undefined, version: lot.version + 1 });
    },
    async unpublish(id) {
      await wait();
      const lot = find(id);
      save({ ...lot, status: 'draft', version: lot.version + 1 });
    },
  };

  const recognitionService: RecognitionService = {
    async createJob(image: PickedImage) {
      await wait();
      const id = `job-${++seq}`;
      jobs.set(id, { job: { id, status: 'queued', error_code: null, items: [] }, polls: 0, photo: image.uri });
      return { job_id: id };
    },
    async getJob(jobId) {
      await wait();
      const entry = jobs.get(jobId);
      if (!entry) throw new LotError('NOT_FOUND');
      entry.polls += 1;
      if (entry.polls <= processingPolls) {
        entry.job = { ...entry.job, status: entry.polls === 1 ? 'queued' : 'processing' };
      } else if (entry.job.status === 'queued' || entry.job.status === 'processing') {
        if (recognition === 'empty') {
          entry.job = { ...entry.job, status: 'failed', error_code: 'EMPTY_RESULT' };
        } else {
          const items: RecognitionItem[] = FIXTURE_RECOGNITION.items.map((it, i) => {
            const auto = it.confidence >= 0.7;
            const lot = auto
              ? createLot({ name: it.name, base_price_minor: it.price, regular_price_minor: it.regular, quantity: it.quantity, pickup_to: at(21), photo: it.photo, allergens: [...it.allergens] as StaffLot['allergens'], unit: it.name.startsWith('Кава') ? 'portions' : 'pcs' })
              : null;
            return { id: `${jobId}-item-${i + 1}`, position: i + 1, name: it.name, quantity: it.quantity, confidence: it.confidence, review_status: auto ? 'auto_accepted' : 'pending_review', lot_id: lot?.id ?? null, box: it.box };
          });
          const pending = items.some((i) => i.review_status === 'pending_review');
          entry.job = { ...entry.job, status: pending ? 'needs_review' : 'completed', items, bundle_suggestion: FIXTURE_RECOGNITION.bundle };
        }
      }
      return { ...entry.job, items: entry.job.items.map((i) => ({ ...i })) };
    },
    async review(jobId, itemId, decision, fix) {
      await wait();
      const entry = jobs.get(jobId);
      if (!entry) throw new LotError('NOT_FOUND');
      const item = entry.job.items.find((i) => i.id === itemId);
      if (!item) throw new LotError('NOT_FOUND');
      const source = FIXTURE_RECOGNITION.items[item.position - 1];
      let next: RecognitionItem;
      if (decision === 'accept') {
        const name = fix?.name ?? item.name;
        const quantity = fix?.quantity ?? item.quantity;
        const lot = createLot({ name, base_price_minor: source.price, regular_price_minor: source.regular, quantity, pickup_to: at(21), photo: source.photo, allergens: [...source.allergens] as StaffLot['allergens'] });
        next = { ...item, name, quantity, review_status: 'accepted', lot_id: lot.id };
      } else {
        next = { ...item, review_status: 'rejected' };
      }
      const items = entry.job.items.map((i) => (i.id === itemId ? next : i));
      entry.job = { ...entry.job, items, status: items.some((i) => i.review_status === 'pending_review') ? 'needs_review' : 'completed' };
      return { ...next };
    },
    photoOf(jobId) {
      return jobs.get(jobId)?.photo ?? null;
    },
  };

  const orders: (OrderPreview & { token: string })[] = Object.values(FIXTURE_ORDERS).map((o, i) => ({
    order_id: `order-${i + 1}`,
    confirmation_code: o.code,
    token: o.token,
    lot_name: o.lot_name,
    photo: o.photo,
    quantity: o.quantity,
    unit_price_minor: o.unit_price_minor,
    total_minor: o.unit_price_minor * o.quantity,
    currency: 'UAH',
    pickup_from: minutesFromNow(o.pickupFromMin),
    pickup_to: minutesFromNow(o.pickupToMin),
    status: o.redeemedMin === null ? 'awaiting_pickup' : 'picked_up',
    redeemed_at: o.redeemedMin === null ? null : minutesFromNow(o.redeemedMin),
  }));
  const codeAttempts: number[] = [];
  const pickupWait = () =>
    new Promise<void>((resolve, reject) => setTimeout(() => (fail ? reject(new PickupError('NETWORK')) : resolve()), delayMs));
  const findOrder = (ref: PickupRef) => {
    if ('confirmation_code' in ref) {
      const now = Date.now();
      while (codeAttempts.length && now - codeAttempts[0] > 60_000) codeAttempts.shift();
      if (codeAttempts.length >= codeAttemptsPerMinute) throw new PickupError('RATE_LIMITED');
      codeAttempts.push(now);
    }
    const order = orders.find((o) => ('token' in ref ? o.token === ref.token : o.confirmation_code === ref.confirmation_code));
    if (!order) throw new PickupError('TOKEN_NOT_FOUND');
    return order;
  };
  const preview = ({ token: _token, ...rest }: OrderPreview & { token: string }): OrderPreview => ({ ...rest });

  const pickupService: PickupService = {
    async lookup(ref) {
      await pickupWait();
      return preview(findOrder(ref));
    },
    async redeem(ref, { allowLate = false } = {}) {
      await pickupWait();
      const order = findOrder(ref);
      if (order.status === 'picked_up') throw new PickupError('TOKEN_ALREADY_USED', order.redeemed_at);
      const late = isLate(order);
      if (late && !allowLate) throw new PickupError('TOKEN_EXPIRED');
      order.status = 'picked_up';
      order.redeemed_at = new Date().toISOString();
      const result: Redemption = { order_id: order.order_id, confirmation_code: order.confirmation_code, lot_name: order.lot_name, quantity: order.quantity, redeemed_at: order.redeemed_at, late };
      return result;
    },
  };

  return { lots: lotsService, recognition: recognitionService, pickup: pickupService };
}

/** Один екземпляр на весь застосунок (поки немає API). */
export const backend = createMockBackend();
