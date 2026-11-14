/** Статус лота закладу — як `VenueLotStatus` у `docs/api/openapi.yaml`. */
export type VenueLotStatus = 'draft' | 'active' | 'sold_out' | 'withdrawn';

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
  photo: number | null;
  note?: string;
}

export interface LotsService {
  list(status: VenueLotStatus): Promise<StaffLot[]>;
  counts(): Promise<Record<VenueLotStatus, number>>;
  unpublish(lotId: string): Promise<void>;
}
