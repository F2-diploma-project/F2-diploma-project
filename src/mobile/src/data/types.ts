/** Статус лота закладу — як `VenueLotStatus` у `docs/api/openapi.yaml`. */
export type VenueLotStatus = 'draft' | 'active' | 'sold_out' | 'withdrawn';

/** Коди алергенів (масив рядків `Allergens` в API). */
export type AllergenCode = 'gluten' | 'nuts' | 'milk' | 'eggs' | 'soy' | 'fish';

/**
 * Лот, як його бачить персонал. Поля відповідають `VenueLot` з API;
 * `regular_price_minor` — ціна позиції меню (`menu_item_id` → `MenuItem.base_price_minor`),
 * від неї рахується знижка.
 */
export interface StaffLot {
  id: string;
  name: string;
  base_price_minor: number;
  regular_price_minor: number | null;
  quantity: number;
  unit: 'pcs' | 'sets' | 'portions';
  pickup_to: string;
  status: VenueLotStatus;
  is_bundle: boolean;
  bundle_items?: { name: string; quantity: number }[];
  allergens: AllergenCode[];
  version: number;
  photo: number | string | null;
  note?: string;
}

/** Зміна лота (`UpdateLotRequest`): версія обов'язкова для оптимістичного блокування. */
export interface LotPatch {
  version: number;
  name?: string;
  base_price_minor?: number;
  quantity?: number;
  pickup_to?: string;
  allergens?: AllergenCode[];
}

/** Створення лота (`CreateLotRequest`); `bundle_items` — для смарт-бандла. */
export interface LotCreate {
  name: string;
  base_price_minor: number;
  regular_price_minor?: number | null;
  quantity: number;
  pickup_to: string;
  allergens?: AllergenCode[];
  bundle_items?: { name: string; quantity: number }[];
  photo?: number | string | null;
}

export type LotErrorCode = 'VERSION_CONFLICT' | 'INVALID_STATE' | 'NOT_FOUND' | 'NETWORK';

export class LotError extends Error {
  constructor(public readonly code: LotErrorCode) {
    super(code);
  }
}

export interface LotsService {
  list(status: VenueLotStatus): Promise<StaffLot[]>;
  counts(): Promise<Record<VenueLotStatus, number>>;
  get(lotId: string): Promise<StaffLot>;
  create(input: LotCreate): Promise<StaffLot>;
  update(lotId: string, patch: LotPatch): Promise<StaffLot>;
  publish(lotId: string): Promise<StaffLot>;
  unpublish(lotId: string): Promise<void>;
}
