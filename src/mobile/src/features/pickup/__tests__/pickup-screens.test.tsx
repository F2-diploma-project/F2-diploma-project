import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { ThemeProvider } from '../../../theme';
import { createMockBackend, FIXTURE_ORDERS } from '../../../data/mockStore';
import { CodeEntryScreen } from '../CodeEntryScreen';
import { IssuedScreen } from '../IssuedScreen';
import { OrderScreen } from '../OrderScreen';
import { ScannerScreen } from '../ScannerScreen';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

const mockPermission = { granted: true, canAskAgain: true };
let mockScan: ((e: { data: string; type: string }) => void) | undefined;
jest.mock('expo-camera', () => ({
  useCameraPermissions: () => [mockPermission, jest.fn()],
  CameraView: (props: { onBarcodeScanned?: (e: { data: string; type: string }) => void }) => {
    mockScan = props.onBarcodeScanned;
    const { View } = jest.requireActual('react-native');
    return <View testID="camera" />;
  },
}));

const wrap = (ui: ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);
const service = () => createMockBackend({ delayMs: 0 }).pickup;

describe('Сканер видачі', () => {
  beforeEach(() => { mockPermission.granted = true; mockScan = undefined; });

  it('показує видошукач, мітку й «Ввести код вручну»', async () => {
    const onManual = jest.fn();
    const user = userEvent.setup();
    await wrap(<ScannerScreen active onScanned={jest.fn()} onManual={onManual} />);
    expect(screen.getByRole('header', { name: 'Видача' })).toBeOnTheScreen();
    expect(screen.getByText('Видача замовлень')).toBeOnTheScreen();
    expect(screen.getByTestId('camera')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Ввести код вручну' }));
    expect(onManual).toHaveBeenCalled();
  });

  it('QR замовлення передається один раз, навіть якщо камера бачить його кілька разів', async () => {
    const onScanned = jest.fn();
    await wrap(<ScannerScreen active onScanned={onScanned} onManual={jest.fn()} />);
    mockScan?.({ data: FIXTURE_ORDERS.awaiting.token, type: 'qr' });
    mockScan?.({ data: FIXTURE_ORDERS.awaiting.token, type: 'qr' });
    expect(onScanned).toHaveBeenCalledTimes(1);
    expect(onScanned).toHaveBeenCalledWith({ token: FIXTURE_ORDERS.awaiting.token });
  });

  it('чужий QR — підказка, а не перехід', async () => {
    const onScanned = jest.fn();
    await wrap(<ScannerScreen active onScanned={onScanned} onManual={jest.fn()} />);
    mockScan?.({ data: 'https://example.com', type: 'qr' });
    expect(onScanned).not.toHaveBeenCalled();
    expect(await screen.findByText('Це не QR-код замовлення. Попросіть покупця відкрити замовлення в застосунку.')).toBeOnTheScreen();
  });

  it('неактивний екран (інша вкладка) не вмикає камеру', async () => {
    await wrap(<ScannerScreen active={false} onScanned={jest.fn()} onManual={jest.fn()} />);
    expect(screen.queryByTestId('camera')).toBeNull();
  });

  it('без доступу до камери — пояснення й «Ввести код вручну»', async () => {
    mockPermission.granted = false;
    const onManual = jest.fn();
    const user = userEvent.setup();
    await wrap(<ScannerScreen active onScanned={jest.fn()} onManual={onManual} />);
    expect(screen.getByText('Немає доступу до камери')).toBeOnTheScreen();
    expect(screen.queryByTestId('camera')).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Ввести код вручну' }));
    expect(onManual).toHaveBeenCalled();
  });
});

describe('Код вручну', () => {
  it('приводить код до вигляду K7Q-4M2 і сам шукає після 6 символів', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();
    await wrap(<CodeEntryScreen onSubmit={onSubmit} onBack={jest.fn()} />);
    const input = screen.getByLabelText('Код замовлення');
    await user.type(input, 'k7q4m');
    expect(screen.getByText('Ще 1 символ — і замовлення знайдеться саме')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Знайти замовлення' })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
    await user.type(input, '2');
    expect(onSubmit).toHaveBeenCalledWith('K7Q-4M2');
  });

  it('показує символи в окремих клітинках', async () => {
    const user = userEvent.setup();
    await wrap(<CodeEntryScreen onSubmit={jest.fn()} onBack={jest.fn()} />);
    await user.type(screen.getByLabelText('Код замовлення'), 'K7');
    expect(screen.getByTestId('code-cell-0')).toHaveTextContent('K');
    expect(screen.getByTestId('code-cell-1')).toHaveTextContent('7');
    expect(screen.getByTestId('code-cell-2')).toHaveTextContent('');
    expect(screen.getByText('Ще 4 символи — і замовлення знайдеться саме')).toBeOnTheScreen();
  });
});

describe('Замовлення', () => {
  const handlers = () => ({ onIssued: jest.fn(), onClose: jest.fn(), onScan: jest.fn(), onManual: jest.fn() });

  it('знайдено: зелений банер, код, лот × кількість, сума; «Видати» видає', async () => {
    const h = handlers();
    const user = userEvent.setup();
    await wrap(<OrderScreen service={service()} pickupRef={{ confirmation_code: FIXTURE_ORDERS.awaiting.code }} {...h} />);
    expect(await screen.findByText('Оплачено. Можна видавати.')).toBeOnTheScreen();
    expect(screen.getByText('Код K7Q-4M2')).toBeOnTheScreen();
    expect(screen.getByText('Сет «Круасан + кава»')).toBeOnTheScreen();
    expect(screen.getByText('× 2')).toBeOnTheScreen();
    expect(screen.getAllByText('138 ₴').length).toBeGreaterThan(0);
    expect(screen.getByText(/^Забрати (сьогодні )?до \d\d:\d\d$/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Видати замовлення' }));
    await waitFor(() => expect(h.onIssued).toHaveBeenCalledWith(expect.objectContaining({ confirmation_code: 'K7Q-4M2', late: false })));
  });

  it('після терміну: попередження; «Усе одно видати» видає з позначкою; «Не видавати» закриває', async () => {
    const h = handlers();
    const user = userEvent.setup();
    await wrap(<OrderScreen service={service()} pickupRef={{ confirmation_code: FIXTURE_ORDERS.late.code }} {...h} />);
    expect(await screen.findByText(/^Час видачі минув о \d\d:\d\d\. Перевірте, чи замовлення ще є і чи воно придатне\.$/)).toBeOnTheScreen();
    expect(screen.getByText(/^Треба було забрати до \d\d:\d\d$/)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Видати замовлення' })).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Не видавати' }));
    expect(h.onClose).toHaveBeenCalled();
    await user.press(screen.getByRole('button', { name: 'Усе одно видати' }));
    await waitFor(() => expect(h.onIssued).toHaveBeenCalledWith(expect.objectContaining({ late: true })));
  });

  it('уже видано: попередження з часом, видати не можна, «Сканувати інше»', async () => {
    const h = handlers();
    const user = userEvent.setup();
    await wrap(<OrderScreen service={service()} pickupRef={{ token: FIXTURE_ORDERS.redeemed.token }} {...h} />);
    expect(await screen.findByText(/^Це замовлення вже видано (сьогодні )?о \d\d:\d\d\. Повторно видати не можна\.$/)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /видати/i })).toBeNull();
    await user.press(screen.getByRole('button', { name: 'Сканувати інше' }));
    expect(h.onScan).toHaveBeenCalled();
  });

  it('не знайдено: пояснення, «Сканувати ще раз» і «Ввести код вручну»', async () => {
    const h = handlers();
    const user = userEvent.setup();
    await wrap(<OrderScreen service={service()} pickupRef={{ confirmation_code: 'ZZZ-999' }} {...h} />);
    expect(await screen.findByText('Код не знайдено')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Сканувати ще раз' }));
    expect(h.onScan).toHaveBeenCalled();
    await user.press(screen.getByRole('button', { name: 'Ввести код вручну' }));
    expect(h.onManual).toHaveBeenCalled();
  });

  it('«Видати» вимикається на час запиту — друге натискання не видає вдруге', async () => {
    const h = handlers();
    const user = userEvent.setup();
    const svc = createMockBackend({ delayMs: 50 }).pickup;
    const redeem = jest.spyOn(svc, 'redeem');
    await wrap(<OrderScreen service={svc} pickupRef={{ confirmation_code: FIXTURE_ORDERS.awaiting.code }} {...h} />);
    const btn = await screen.findByRole('button', { name: 'Видати замовлення' });
    await user.press(btn);
    await user.press(btn);
    await waitFor(() => expect(h.onIssued).toHaveBeenCalledTimes(1));
    expect(redeem).toHaveBeenCalledTimes(1);
  });

  it('немає зв’язку — пояснення й повтор', async () => {
    await wrap(<OrderScreen service={createMockBackend({ delayMs: 0, fail: true }).pickup} pickupRef={{ confirmation_code: FIXTURE_ORDERS.awaiting.code }} {...handlers()} />);
    expect(await screen.findByText('Немає зв’язку')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Спробувати ще раз' })).toBeOnTheScreen();
  });
});

describe('Видано', () => {
  it('код, час і «Сканувати наступне»', async () => {
    const onNext = jest.fn();
    const user = userEvent.setup();
    const at = new Date(2026, 10, 15, 20, 14).toISOString();
    await wrap(<IssuedScreen redemption={{ order_id: 'o', confirmation_code: 'K7Q-4M2', lot_name: 'Сет', quantity: 2, redeemed_at: at, late: false }} onNext={onNext} />);
    expect(screen.getByText('Видано')).toBeOnTheScreen();
    expect(screen.getByText('Замовлення K7Q-4M2 видано о 20:14. Запис додано в журнал.')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Сканувати наступне' }));
    expect(onNext).toHaveBeenCalled();
  });

  it('видано після терміну — це сказано окремо', async () => {
    const at = new Date(2026, 10, 15, 21, 30).toISOString();
    await wrap(<IssuedScreen redemption={{ order_id: 'o', confirmation_code: 'L8T-3P5', lot_name: 'Кіш', quantity: 1, redeemed_at: at, late: true }} onNext={jest.fn()} />);
    expect(screen.getByText('Замовлення L8T-3P5 видано о 21:30 після терміну. Запис додано в журнал.')).toBeOnTheScreen();
  });
});
