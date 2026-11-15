import { createMockBackend, FIXTURE_ORDERS } from '../mockStore';
import { codeLength, isCompleteCode, isLate, normalizeCode, PickupError } from '../pickup';

describe('код підтвердження', () => {
  it('великі літери, дефіс після третього символу, не довше 6 символів', () => {
    expect(normalizeCode('k7q4m2')).toBe('K7Q-4M2');
    expect(normalizeCode('K7')).toBe('K7');
    expect(normalizeCode('K7Q')).toBe('K7Q');
    expect(normalizeCode('k7q-4')).toBe('K7Q-4');
    expect(normalizeCode('K7Q-4M2X9')).toBe('K7Q-4M2');
  });

  it('прибирає пробіли й зайві знаки', () => {
    expect(normalizeCode(' k7q 4m2 ')).toBe('K7Q-4M2');
    expect(normalizeCode('k7q_4m2!')).toBe('K7Q-4M2');
  });

  it('кириличні двійники з української розкладки стають латинськими', () => {
    expect(normalizeCode('К7Т-4М2')).toBe('K7T-4M2');
    expect(normalizeCode('асе')).toBe('ACE');
  });

  it('рахує введені символи й визначає повний код', () => {
    expect(codeLength('K7Q-4')).toBe(4);
    expect(isCompleteCode('K7Q-4M2')).toBe(true);
    expect(isCompleteCode('K7Q-4M')).toBe(false);
  });
});

describe('термін видачі', () => {
  it('замовлення пізнє, коли зараз пізніше за pickup_to', () => {
    const order = { pickup_to: '2026-11-15T21:00:00+02:00' };
    expect(isLate(order, new Date('2026-11-15T20:59:00+02:00'))).toBe(false);
    expect(isLate(order, new Date('2026-11-15T21:01:00+02:00'))).toBe(true);
  });
});

describe('сервіс видачі (заглушка)', () => {
  const setup = () => createMockBackend({ delayMs: 0 }).pickup;
  const awaiting = FIXTURE_ORDERS.awaiting;

  it('знаходить замовлення за кодом і за QR-токеном, нічого не змінюючи', async () => {
    const pickup = setup();
    const byCode = await pickup.lookup({ confirmation_code: awaiting.code });
    expect(byCode).toMatchObject({ lot_name: 'Сет «Круасан + кава»', quantity: 2, total_minor: 13800, status: 'awaiting_pickup', redeemed_at: null });
    const byToken = await pickup.lookup({ token: awaiting.token });
    expect(byToken.order_id).toBe(byCode.order_id);
    expect((await pickup.lookup({ confirmation_code: awaiting.code })).status).toBe('awaiting_pickup');
  });

  it('невідомий код → TOKEN_NOT_FOUND', async () => {
    await expect(setup().lookup({ confirmation_code: 'ZZZ-999' })).rejects.toMatchObject({ code: 'TOKEN_NOT_FOUND' });
  });

  it('видача змінює стан; повторна видача → TOKEN_ALREADY_USED із часом видачі', async () => {
    const pickup = setup();
    const done = await pickup.redeem({ confirmation_code: awaiting.code });
    expect(done).toMatchObject({ confirmation_code: awaiting.code, late: false });
    expect((await pickup.lookup({ token: awaiting.token })).status).toBe('picked_up');
    const err = await pickup.redeem({ token: awaiting.token }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(PickupError);
    expect(err).toMatchObject({ code: 'TOKEN_ALREADY_USED', redeemedAt: done.redeemed_at });
  });

  it('уже видане замовлення в перегляді — picked_up із часом, а не помилка', async () => {
    const order = await setup().lookup({ confirmation_code: FIXTURE_ORDERS.redeemed.code });
    expect(order.status).toBe('picked_up');
    expect(order.redeemed_at).not.toBeNull();
  });

  it('після терміну: без allowLate → TOKEN_EXPIRED, з allowLate → видано з late', async () => {
    const pickup = setup();
    const ref = { confirmation_code: FIXTURE_ORDERS.late.code };
    await expect(pickup.redeem(ref)).rejects.toMatchObject({ code: 'TOKEN_EXPIRED' });
    expect(await pickup.redeem(ref, { allowLate: true })).toMatchObject({ late: true });
  });

  it('обмеження спроб введення коду → RATE_LIMITED', async () => {
    const pickup = createMockBackend({ delayMs: 0, codeAttemptsPerMinute: 2 }).pickup;
    await pickup.lookup({ confirmation_code: 'AAA-111' }).catch(() => undefined);
    await pickup.lookup({ confirmation_code: 'AAA-112' }).catch(() => undefined);
    await expect(pickup.lookup({ confirmation_code: awaiting.code })).rejects.toMatchObject({ code: 'RATE_LIMITED' });
    await expect(pickup.lookup({ token: awaiting.token })).resolves.toMatchObject({ status: 'awaiting_pickup' });
  });

  it('немає зв’язку → NETWORK', async () => {
    await expect(createMockBackend({ delayMs: 0, fail: true }).pickup.lookup({ confirmation_code: awaiting.code })).rejects.toMatchObject({ code: 'NETWORK' });
  });
});
