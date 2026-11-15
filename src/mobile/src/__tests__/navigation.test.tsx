import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { userEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../theme';
import { AuthProvider } from '../data/auth';
import { MOCK_ACCOUNTS } from '../data/mockAuth';
import Login from '../app/login';
import StaffLayout from '../app/(staff)/_layout';
import CashierLayout from '../app/(staff)/(cashier)/_layout';
import CashierLots from '../app/(staff)/(cashier)/lots';
import CashierPickup from '../app/(staff)/(cashier)/pickup';
import CashierProfile from '../app/(staff)/(cashier)/profile';
import SnapCamera from '../app/(staff)/snap/camera';
import LotEditor from '../app/(staff)/lot/[id]';
import RedeemCode from '../app/(staff)/redeem/code';
import RedeemOrder from '../app/(staff)/redeem/order';
import RedeemDone from '../app/(staff)/redeem/done';
import SettingsNotifications from '../app/(staff)/settings/notifications';
import SettingsHelp from '../app/(staff)/settings/help';
import Index from '../app/index';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));
jest.mock('expo-camera', () => ({
  useCameraPermissions: () => [{ granted: true, canAskAgain: true }, jest.fn()],
  CameraView: () => null,
}));
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));

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
  '(staff)/_layout': StaffLayout,
  '(staff)/(cashier)/_layout': CashierLayout,
  '(staff)/(cashier)/lots': CashierLots,
  '(staff)/(cashier)/pickup': CashierPickup,
  '(staff)/(cashier)/profile': CashierProfile,
  '(staff)/snap/camera': SnapCamera,
  '(staff)/lot/[id]': LotEditor,
  '(staff)/redeem/code': RedeemCode,
  '(staff)/redeem/order': RedeemOrder,
  '(staff)/redeem/done': RedeemDone,
  '(staff)/settings/notifications': SettingsNotifications,
  '(staff)/settings/help': SettingsHelp,
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

  it('«Сфотографувати вітрину» відкриває камеру Snap & Sell', async () => {
    const user = userEvent.setup();
    await renderRouter(routes, { initialUrl: '/lots' });
    await user.press(await screen.findByRole('button', { name: 'Сфотографувати вітрину' }));
    expect(await screen.findByText('Snap & Sell · фото вітрини')).toBeOnTheScreen();
  });

  it('кнопка камери є на всіх вкладках касира і відкриває камеру', async () => {
    const user = userEvent.setup();
    await renderRouter(routes, { initialUrl: '/lots' });
    expect(await screen.findByRole('button', { name: 'Сфотографувати вітрину' })).toBeOnTheScreen();
    await user.press(screen.getByRole('tab', { name: 'Видача' }));
    await screen.findByRole('header', { name: 'Видача' });
    expect(screen.getByRole('button', { name: 'Сфотографувати вітрину' })).toBeOnTheScreen();
    await user.press(screen.getByRole('tab', { name: 'Профіль' }));
    await screen.findByRole('header', { name: 'Профіль' });
    await user.press(screen.getByRole('button', { name: 'Сфотографувати вітрину' }));
    expect(await screen.findByText('Snap & Sell · фото вітрини')).toBeOnTheScreen();
  });

  it('чернетка відкривається для редагування з вкладки «Чернетки»', async () => {
    const user = userEvent.setup();
    await renderRouter(routes, { initialUrl: '/lots?tab=draft' });
    await user.press(await screen.findByRole('button', { name: /Сирник із родзинками/ }, { timeout: 3000 }));
    expect(await screen.findByRole('header', { name: 'Чернетка лота' })).toBeOnTheScreen();
  });
});

describe('Видача замовлення', () => {
  it('код вручну → замовлення → «Видати» → «Видано» → назад до сканера', async () => {
    const user = userEvent.setup();
    await renderRouter(routes, { initialUrl: '/pickup' });
    await user.press(await screen.findByRole('button', { name: 'Ввести код вручну' }));
    await user.type(await screen.findByLabelText('Код замовлення'), 'k7q4m2');
    expect(await screen.findByText('Код K7Q-4M2', {}, { timeout: 3000 })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Видати замовлення' }));
    expect(await screen.findByText('Видано', {}, { timeout: 3000 })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Сканувати наступне' }));
    expect(await screen.findByRole('header', { name: 'Видача' })).toBeOnTheScreen();
  });
});

describe('Профіль', () => {
  it('профіль → сповіщення → назад → допомога → назад → «Вийти» веде на вхід', async () => {
    const user = userEvent.setup();
    await renderRouter(routes, { initialUrl: '/profile' });
    expect(await screen.findByText('Олена Коваль', {}, { timeout: 3000 })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: /^Сповіщення/ }));
    expect(await screen.findByRole('header', { name: 'Сповіщення' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Назад' }));
    await user.press(await screen.findByRole('button', { name: /^Допомога/ }));
    expect(await screen.findByText('Як видати замовлення')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Назад' }));
    await user.press(await screen.findByRole('button', { name: 'Вийти' }));
    expect(await screen.findByRole('header', { name: 'Вхід для персоналу' })).toBeOnTheScreen();
  });
});
