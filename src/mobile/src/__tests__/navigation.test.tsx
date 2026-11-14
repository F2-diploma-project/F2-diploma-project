import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { userEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../theme';
import CashierLayout from '../app/(cashier)/_layout';
import CashierLots from '../app/(cashier)/lots';
import CashierPickup from '../app/(cashier)/pickup';
import CashierProfile from '../app/(cashier)/profile';
import Index from '../app/index';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

const routes = {
  _layout: () => (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  ),
  index: Index,
  '(cashier)/_layout': CashierLayout,
  '(cashier)/lots': CashierLots,
  '(cashier)/pickup': CashierPickup,
  '(cashier)/profile': CashierProfile,
};

describe('Навігація касира', () => {
  it('з головної відкриває «Лоти» з нижньою навігацією', async () => {
    await renderRouter(routes, { initialUrl: '/' });
    expect(await screen.findByRole('header', { name: 'Лоти' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Лоти' })).toBeSelected();
  });

  it('перехід на «Видачу» через нижню навігацію', async () => {
    const user = userEvent.setup();
    await renderRouter(routes, { initialUrl: '/lots' });
    await user.press(await screen.findByRole('tab', { name: 'Видача' }));
    expect(await screen.findByRole('header', { name: 'Видача' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Видача' })).toBeSelected();
  });
});
