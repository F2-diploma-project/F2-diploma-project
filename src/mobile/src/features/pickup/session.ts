import type { PickupRef, Redemption } from '../../data/pickup';

/**
 * Передача QR-токена / коду й результату видачі між екранами в пам'яті, а не в адресі маршруту:
 * токен і код — це «ключ» до замовлення, їм не місце в історії навігації (у веб-версії — в адресному рядку).
 */
let pendingRef: PickupRef | null = null;
let lastRedemption: Redemption | null = null;

export const pickupSession = {
  setRef(ref: PickupRef) {
    pendingRef = ref;
  },
  ref(): PickupRef | null {
    return pendingRef;
  },
  setRedemption(r: Redemption) {
    lastRedemption = r;
    pendingRef = null;
  },
  redemption(): Redemption | null {
    return lastRedemption;
  },
};
