import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemePreference } from '../theme/ThemeProvider';

/** Налаштування, що зберігаються лише на цьому телефоні (рішення Марії, 2026-11-15). */
const THEME_KEY = 'f2.theme';
const NOTIFICATIONS_KEY = 'f2.notifications';

export interface NotificationPrefs {
  /** Нові замовлення — коли покупець оплатив лот. */
  orders: boolean;
  /** Готові чернетки з фото — коли розпізнавання завершилось. */
  drafts: boolean;
}

export const DEFAULT_NOTIFICATIONS: NotificationPrefs = { orders: true, drafts: true };

const THEMES: ThemePreference[] = ['light', 'dark', 'system'];

export async function loadThemePreference(): Promise<ThemePreference | null> {
  try {
    const value = await AsyncStorage.getItem(THEME_KEY);
    return THEMES.find((t) => t === value) ?? null;
  } catch {
    return null;
  }
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  try {
    await AsyncStorage.setItem(THEME_KEY, preference);
  } catch {
    // Не вдалося зберегти — тема діє до перезапуску, працювати це не заважає.
  }
}

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const raw = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    if (!raw) return DEFAULT_NOTIFICATIONS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null) return DEFAULT_NOTIFICATIONS;
    const p = parsed as Partial<Record<keyof NotificationPrefs, unknown>>;
    return {
      orders: typeof p.orders === 'boolean' ? p.orders : DEFAULT_NOTIFICATIONS.orders,
      drafts: typeof p.drafts === 'boolean' ? p.drafts : DEFAULT_NOTIFICATIONS.drafts,
    };
  } catch {
    return DEFAULT_NOTIFICATIONS;
  }
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(prefs));
  } catch {
    // Див. saveThemePreference.
  }
}
