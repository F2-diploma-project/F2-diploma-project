import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { createMockBackend } from '../../../data/mockStore';
import { loadNotificationPrefs } from '../../../data/settings';
import { ThemeProvider } from '../../../theme';
import { HelpScreen } from '../HelpScreen';
import { NotificationsScreen } from '../NotificationsScreen';
import { ProfileScreen } from '../ProfileScreen';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);
const handlers = () => ({ onNotifications: jest.fn(), onHelp: jest.fn(), onSignOut: jest.fn() });

describe('Профіль касира', () => {
  it('картка працівника: ініціали, ім’я, роль, заклад', async () => {
    await wrap(<ProfileScreen login="cashier.olena" service={createMockBackend({ delayMs: 0 }).profile} {...handlers()} />);
    expect(await screen.findByText('Олена Коваль')).toBeOnTheScreen();
    expect(screen.getByText('ОК')).toBeOnTheScreen();
    expect(screen.getByText('Касир')).toBeOnTheScreen();
    expect(screen.getByText('Пекарня «Жито»')).toBeOnTheScreen();
  });

  it('«Сьогодні»: власні лоти й видані замовлення з правильними закінченнями', async () => {
    await wrap(<ProfileScreen login="cashier.olena" service={createMockBackend({ delayMs: 0 }).profile} {...handlers()} />);
    expect(await screen.findByText('Сьогодні')).toBeOnTheScreen();
    expect(await screen.findByLabelText('4 лоти опубліковано')).toBeOnTheScreen();
    expect(screen.getByLabelText('1 замовлення видано')).toBeOnTheScreen();
  });

  it('тема перемикається на місці', async () => {
    const user = userEvent.setup();
    await wrap(<ProfileScreen login="cashier.olena" service={createMockBackend({ delayMs: 0 }).profile} {...handlers()} />);
    await screen.findByText('Олена Коваль');
    expect(screen.getByRole('tab', { name: 'Як у системі' })).toBeSelected();
    await user.press(screen.getByRole('tab', { name: 'Темна' }));
    expect(screen.getByRole('tab', { name: 'Темна' })).toBeSelected();
  });

  it('«Сповіщення», «Допомога», «Вийти»', async () => {
    const h = handlers();
    const user = userEvent.setup();
    await wrap(<ProfileScreen login="cashier.olena" service={createMockBackend({ delayMs: 0 }).profile} {...h} />);
    await screen.findByText('Олена Коваль');
    await user.press(screen.getByRole('button', { name: /^Сповіщення/ }));
    await user.press(screen.getByRole('button', { name: /^Допомога/ }));
    await user.press(screen.getByRole('button', { name: 'Вийти' }));
    expect(h.onNotifications).toHaveBeenCalled();
    expect(h.onHelp).toHaveBeenCalled();
    expect(h.onSignOut).toHaveBeenCalled();
  });

  it('версія внизу', async () => {
    await wrap(<ProfileScreen login="cashier.olena" service={createMockBackend({ delayMs: 0 }).profile} {...handlers()} />);
    expect(await screen.findByText(/^Версія \d+\.\d+/)).toBeOnTheScreen();
  });

  it('немає зв’язку — пояснення й повтор; налаштування й «Вийти» доступні', async () => {
    await wrap(<ProfileScreen login="cashier.olena" service={createMockBackend({ delayMs: 0, fail: true }).profile} {...handlers()} />);
    expect(await screen.findByText('Не вдалося завантажити профіль')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Спробувати ще раз' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Вийти' })).toBeOnTheScreen();
  });
});

describe('Сповіщення', () => {
  beforeEach(() => AsyncStorage.clear());

  it('за замовчуванням обидва перемикачі ввімкнено; вибір зберігається на телефоні', async () => {
    await wrap(<NotificationsScreen onBack={jest.fn()} />);
    const orders = await screen.findByRole('switch', { name: /^Нові замовлення/ });
    const drafts = screen.getByRole('switch', { name: /^Готові чернетки з фото/ });
    await waitFor(() => expect(orders).toBeChecked());
    expect(drafts).toBeChecked();
    await act(async () => { fireEvent(drafts, 'valueChange', false); });
    await waitFor(() => expect(screen.getByRole('switch', { name: /^Готові чернетки з фото/ })).not.toBeChecked());
    await waitFor(async () => expect((await loadNotificationPrefs()).drafts).toBe(false));
    expect(screen.getByText(/Сповіщення приходять лише на цей телефон/)).toBeOnTheScreen();
  });

  it('стрілка «Назад»', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    await wrap(<NotificationsScreen onBack={onBack} />);
    await user.press(screen.getByRole('button', { name: 'Назад' }));
    expect(onBack).toHaveBeenCalled();
  });
});

describe('Допомога', () => {
  it('три розділи інструкцій і «Назад»', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    await wrap(<HelpScreen onBack={onBack} />);
    expect(screen.getByRole('header', { name: 'Допомога' })).toBeOnTheScreen();
    expect(screen.getByText('Як опублікувати лоти')).toBeOnTheScreen();
    expect(screen.getByText('Як видати замовлення')).toBeOnTheScreen();
    expect(screen.getByText('Якщо щось пішло не так')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Назад' }));
    expect(onBack).toHaveBeenCalled();
  });
});
