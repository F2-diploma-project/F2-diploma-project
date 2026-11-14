import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../../theme';
import { createMockAuthService, MOCK_ACCOUNTS } from '../../../data/mockAuth';
import type { AuthService } from '../../../data/auth';
import { LoginScreen } from '../LoginScreen';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

const setup = async (service: AuthService = createMockAuthService({ delayMs: 0 })) => {
  const onSignedIn = jest.fn();
  const user = userEvent.setup();
  await render(<ThemeProvider><LoginScreen service={service} onSignedIn={onSignedIn} /></ThemeProvider>);
  const fill = async (login: string, password: string) => {
    await user.type(screen.getByLabelText('Логін'), login);
    await user.type(screen.getByLabelText('Пароль'), password);
  };
  const submit = () => user.press(screen.getByRole('button', { name: 'Увійти' }));
  return { onSignedIn, user, fill, submit };
};

describe('Екран входу', () => {
  it('показує заголовок, поля й кнопку', async () => {
    await setup();
    expect(screen.getByRole('header', { name: 'Вхід для персоналу' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Логін')).toBeOnTheScreen();
    expect(screen.getByLabelText('Пароль')).toBeOnTheScreen();
    expect(screen.getByText(/визначиться автоматично/)).toBeOnTheScreen();
  });

  it('кнопка неактивна, доки поля порожні', async () => {
    await setup();
    expect(screen.getByRole('button', { name: 'Увійти' })).toBeDisabled();
  });

  it('перевіряє формат логіна й довжину пароля до запиту', async () => {
    const service = createMockAuthService({ delayMs: 0 });
    const spy = jest.spyOn(service, 'login');
    const { fill, submit } = await setup(service);
    await fill('олена', 'short');
    await submit();
    expect(screen.getByText('Лише латинські літери, цифри, крапка, дефіс або підкреслення')).toBeOnTheScreen();
    expect(screen.getByText('Щонайменше 12 символів')).toBeOnTheScreen();
    expect(spy).not.toHaveBeenCalled();
  });

  it('показує й ховає пароль', async () => {
    const { user } = await setup();
    expect(screen.getByLabelText('Пароль')).toHaveProp('secureTextEntry', true);
    await user.press(screen.getByRole('button', { name: 'Показати пароль' }));
    expect(screen.getByLabelText('Пароль')).toHaveProp('secureTextEntry', false);
    expect(screen.getByRole('button', { name: 'Сховати пароль' })).toBeOnTheScreen();
  });

  it('успішний вхід касира', async () => {
    const { fill, submit, onSignedIn } = await setup();
    await fill(MOCK_ACCOUNTS.cashier.login, MOCK_ACCOUNTS.cashier.password);
    await submit();
    await waitFor(() => expect(onSignedIn).toHaveBeenCalledWith(expect.objectContaining({ role: 'cashier', login: MOCK_ACCOUNTS.cashier.login })));
  });

  it('невірні дані — однакове повідомлення для логіна й пароля', async () => {
    const { fill, submit, onSignedIn } = await setup();
    await fill(MOCK_ACCOUNTS.cashier.login, 'wrong-password-123');
    await submit();
    expect(await screen.findByText('Невірний логін або пароль.')).toBeOnTheScreen();
    expect(onSignedIn).not.toHaveBeenCalled();
  });

  it('заблокований обліковий запис — час розблокування', async () => {
    const { fill, submit } = await setup();
    await fill(MOCK_ACCOUNTS.locked.login, MOCK_ACCOUNTS.locked.password);
    await submit();
    expect(await screen.findByText(/Забагато невдалих спроб\. Спробуйте після \d{2}:\d{2}\./)).toBeOnTheScreen();
  });

  it('немає зв’язку', async () => {
    const { fill, submit } = await setup(createMockAuthService({ delayMs: 0, offline: true }));
    await fill(MOCK_ACCOUNTS.cashier.login, MOCK_ACCOUNTS.cashier.password);
    await submit();
    expect(await screen.findByText(/Немає зв’язку/)).toBeOnTheScreen();
  });

  it('«Забули пароль?» пояснює, що робити', async () => {
    const { user } = await setup();
    await user.press(screen.getByRole('button', { name: 'Забули пароль?' }));
    expect(screen.getByText(/Пароль змінює адміністратор закладу/)).toBeOnTheScreen();
  });
});
