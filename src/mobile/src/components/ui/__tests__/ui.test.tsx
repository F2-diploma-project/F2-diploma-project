import { render, screen, userEvent } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { ThemeProvider } from '../../../theme';
import { colors } from '../../../theme/tokens';
import { Banner } from '../Banner';
import { BottomNav } from '../BottomNav';
import { EmptyState } from '../EmptyState';
import { LotCard } from '../LotCard';
import { SegmentTabs } from '../SegmentTabs';
import { Toast } from '../Toast';
import type { StaffLot } from '../../../data/types';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));
const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

const lot: StaffLot = {
  id: 'l1', name: 'Кіш зі шпинатом', base_price_minor: 6000, regular_price_minor: 12000, quantity: 1, unit: 'pcs',
  pickup_to: new Date(2026, 10, 15, 21, 0).toISOString(), status: 'active', is_bundle: false, photo: null, allergens: [], version: 1,
};

describe('LotCard', () => {
  it('показує назву, ціну, стару ціну й знижку', async () => {
    await wrap(<LotCard lot={{ ...lot, quantity: 3 }} />);
    expect(screen.getByText('Кіш зі шпинатом')).toBeOnTheScreen();
    expect(screen.getByText('60 ₴')).toBeOnTheScreen();
    expect(screen.getByText('120 ₴')).toBeOnTheScreen();
    expect(screen.getByText('−50 %')).toBeOnTheScreen();
    expect(screen.queryByTestId('low-stock')).toBeNull();
  });
  it('«Лишився останній» — позначка з іконкою, а не лише колір', async () => {
    await wrap(<LotCard lot={lot} />);
    expect(screen.getByTestId('low-stock')).toHaveTextContent('Лишився останній');
    expect(screen.getByTestId('icon-timer', { includeHiddenElements: true })).toBeOnTheScreen();
  });
  it('доступна назва для читача екрана', async () => {
    await wrap(<LotCard lot={lot} />);
    expect(screen.getByLabelText('Кіш зі шпинатом, 60 ₴ замість 120 ₴, Лишився останній')).toBeOnTheScreen();
  });
});

describe('SegmentTabs', () => {
  it('позначає активну вкладку й перемикає', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    await wrap(<SegmentTabs value="a" onChange={onChange} items={[{ value: 'a', label: 'Активні · 4' }, { value: 'b', label: 'Чернетки · 2' }]} />);
    expect(screen.getByRole('tab', { name: 'Активні · 4' })).toBeSelected();
    await user.press(screen.getByRole('tab', { name: 'Чернетки · 2' }));
    expect(onChange).toHaveBeenCalledWith('b');
  });
});

describe('BottomNav', () => {
  it('рендерить пункти й повідомляє про натискання', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await wrap(<BottomNav active="lots" onPress={onPress} items={[{ key: 'lots', label: 'Лоти', icon: 'sell' }, { key: 'pickup', label: 'Видача', icon: 'qr_code_scanner' }]} />);
    expect(screen.getByRole('tab', { name: 'Лоти' })).toBeSelected();
    await user.press(screen.getByRole('tab', { name: 'Видача' }));
    expect(onPress).toHaveBeenCalledWith('pickup');
  });
  it('пункти не менші за 48 точок', async () => {
    await wrap(<BottomNav active="lots" onPress={jest.fn()} items={[{ key: 'lots', label: 'Лоти', icon: 'sell' }]} />);
    expect(screen.getByRole('tab', { name: 'Лоти' })).toHaveStyle({ minHeight: 48 });
  });
});

describe('Banner, EmptyState, Toast', () => {
  it('банер інформації — біла картка', async () => {
    await wrap(<Banner kind="info" icon="photo_camera" text="Чернетки з фото вітрини." />);
    expect(screen.getByText('Чернетки з фото вітрини.')).toBeOnTheScreen();
    expect(screen.getByTestId('banner')).toHaveStyle({ backgroundColor: colors.light.card });
  });
  it('порожній стан з дією', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    await wrap(<EmptyState icon="cloud_off" title="Немає зв’язку" text="Спробуйте ще раз." actionLabel="Спробувати ще раз" onAction={onAction} />);
    await user.press(screen.getByRole('button', { name: 'Спробувати ще раз' }));
    expect(onAction).toHaveBeenCalled();
  });
  it('сповіщення зі скасуванням', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    await wrap(<Toast text="Лот опубліковано" actionLabel="Скасувати" onAction={onAction} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/Лот опубліковано/);
    await user.press(screen.getByRole('button', { name: 'Скасувати' }));
    expect(onAction).toHaveBeenCalled();
  });
});
