import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { userEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../theme';
import { AuthProvider } from '../data/auth';
import { MOCK_ACCOUNTS } from '../data/mockAuth';
import Login from '../app/login';
import CashierLayout from '../app/(cashier)/_layout';
import CashierLots from '../app/(cashier)/lots';
import CashierPickup from '../app/(cashier)/pickup';
import CashierProfile from '../app/(cashier)/profile';
import Index from '../app/index';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

let session: { role: 'cashier' | 'admin'; login: string } | null = { role: 'cashier', login: 'cashier.olena' };

const routes = {
  _layout: () => (
    <ThemeProvider>
      <AuthProvider initialSession={session}>
        <Slot />
      </AuthProvider>
    </ThemeProvider>
  ),
  login: Login,
  index: Index,
  '(cashier)/_layout': CashierLayout,
  '(cashier)/lots': CashierLots,
  '(cashier)/pickup': CashierPickup,
  '(cashier)/profile': CashierProfile,
};

describe('Вхід і ролі', () => {
  afterEach(() => { session = { role: 'cashier', login: 'cashier.olena' }; });

  it('без входу головна веде на екран входу', async () => {
    session = null;
    await renderRouter(routes, { initialUrl: '/' });
    expect(await screen.findByRole('header', { name: 'Вхід для персоналу' })).toBeOnTheScreen();
  });

  it('без входу екрани касира недоступні', async () => {
    session = null;
    await renderRouter(routes, { initialUrl: '/lots' });
    expect(await screen.findByRole('header', { name: 'Вхід для персоналу' })).toBeOnTheScreen();
  });

  it('після входу касир потрапляє на «Лоти»', async () => {
    session = null;
    const user = userEvent.setup();
    await renderRouter(routes, { initialUrl: '/login' });
    await user.type(await screen.findByLabelText('Логін'), MOCK_ACCOUNTS.cashier.login);
    await user.type(screen.getByLabelText('Пароль'), MOCK_ACCOUNTS.cashier.password);
    await user.press(screen.getByRole('button', { name: 'Увійти' }));
    expect(await screen.findByRole('header', { name: 'Лоти' }, { timeout: 3000 })).toBeOnTheScreen();
  });
});

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
