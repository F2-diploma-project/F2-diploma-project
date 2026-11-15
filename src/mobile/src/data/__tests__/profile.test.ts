import AsyncStorage from '@react-native-async-storage/async-storage';
import { createMockBackend, FIXTURE_ORDERS } from '../mockStore';
import { DEFAULT_NOTIFICATIONS, loadNotificationPrefs, loadThemePreference, saveNotificationPrefs, saveThemePreference } from '../settings';

describe('профіль (заглушка)', () => {
  it('хто я: ім’я, роль і заклад за логіном', async () => {
    const me = await createMockBackend({ delayMs: 0 }).profile.me('cashier.olena');
    expect(me).toEqual({ staff: expect.objectContaining({ login: 'cashier.olena', display_name: 'Олена Коваль', role: 'cashier' }), venue: expect.objectContaining({ name: 'Пекарня «Жито»' }) });
  });

  it('підсумок дня рахує власні дії: опубліковані лоти й видані замовлення', async () => {
    const backend = createMockBackend({ delayMs: 0 });
    const before = await backend.profile.today();
    await backend.pickup.redeem({ confirmation_code: FIXTURE_ORDERS.awaiting.code });
    const draft = (await backend.lots.list('draft'))[0];
    await backend.lots.publish(draft.id);
    const after = await backend.profile.today();
    expect(after.redeemed_orders).toBe(before.redeemed_orders + 1);
    expect(after.published_lots).toBe(before.published_lots + 1);
  });

  it('немає зв’язку → помилка', async () => {
    await expect(createMockBackend({ delayMs: 0, fail: true }).profile.today()).rejects.toBeTruthy();
  });
});

describe('налаштування на телефоні', () => {
  beforeEach(() => AsyncStorage.clear());

  it('тема: за замовчуванням нічого, потім те, що збережено', async () => {
    expect(await loadThemePreference()).toBeNull();
    await saveThemePreference('dark');
    expect(await loadThemePreference()).toBe('dark');
  });

  it('пошкоджене значення теми ігнорується', async () => {
    await AsyncStorage.setItem('f2.theme', 'purple');
    expect(await loadThemePreference()).toBeNull();
  });

  it('сповіщення: за замовчуванням усе ввімкнено, вибір зберігається', async () => {
    expect(await loadNotificationPrefs()).toEqual(DEFAULT_NOTIFICATIONS);
    await saveNotificationPrefs({ ...DEFAULT_NOTIFICATIONS, drafts: false });
    expect(await loadNotificationPrefs()).toEqual({ ...DEFAULT_NOTIFICATIONS, drafts: false });
  });
});
