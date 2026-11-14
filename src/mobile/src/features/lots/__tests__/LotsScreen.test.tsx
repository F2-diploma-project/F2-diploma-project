import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../../theme';
import { createMockLotsService, FIXTURE_LOTS } from '../../../data/mockLots';
import { LotsScreen } from '../LotsScreen';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

const show = (props: Partial<Parameters<typeof LotsScreen>[0]> = {}) =>
  render(<ThemeProvider><LotsScreen service={createMockLotsService({ delayMs: 0 })} {...props} /></ThemeProvider>);

describe('Екран «Лоти» касира', () => {
  it('спершу показує завантаження, потім активні лоти', async () => {
    await show();
    expect(screen.getByText('Завантажуємо лоти…')).toBeOnTheScreen();
    expect(await screen.findByText('Круасан з мигдалем')).toBeOnTheScreen();
    expect(screen.getByText('Кіш зі шпинатом')).toBeOnTheScreen();
    expect(screen.queryByText('Сирник із родзинками')).toBeNull();
  });

  it('кількість у вкладках', async () => {
    await show();
    expect(await screen.findByRole('tab', { name: 'Активні · 4' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Чернетки · 2' })).toBeOnTheScreen();
  });

  it('вкладка «Чернетки» — банер і чернетки', async () => {
    const user = userEvent.setup();
    await show();
    await user.press(await screen.findByRole('tab', { name: 'Чернетки · 2' }));
    expect(await screen.findByText('Сирник із родзинками')).toBeOnTheScreen();
    expect(screen.getByText(/Чернетки з фото вітрини/)).toBeOnTheScreen();
  });

  it('порожній список', async () => {
    await render(<ThemeProvider><LotsScreen service={createMockLotsService({ delayMs: 0, lots: [] })} /></ThemeProvider>);
    expect(await screen.findByText('Активних лотів немає')).toBeOnTheScreen();
  });

  it('немає зв’язку → повторна спроба', async () => {
    const user = userEvent.setup();
    const failing = createMockLotsService({ delayMs: 0, fail: true });
    const ok = createMockLotsService({ delayMs: 0 });
    const service = { ...failing, list: jest.fn(failing.list).mockImplementationOnce(failing.list).mockImplementation(ok.list), counts: ok.counts };
    await render(<ThemeProvider><LotsScreen service={service} /></ThemeProvider>);
    expect(await screen.findByText('Немає зв’язку')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Спробувати ще раз' }));
    expect(await screen.findByText('Круасан з мигдалем')).toBeOnTheScreen();
  });

  it('після публікації — сповіщення, «Скасувати» повертає лот у чернетки', async () => {
    const user = userEvent.setup();
    const service = createMockLotsService({ delayMs: 0 });
    const spy = jest.spyOn(service, 'unpublish');
    await render(<ThemeProvider><LotsScreen service={service} publishedLotId={FIXTURE_LOTS[0].id} /></ThemeProvider>);
    expect(await screen.findByRole('alert')).toHaveTextContent(/Лот опубліковано/);
    await user.press(screen.getByRole('button', { name: 'Скасувати' }));
    expect(spy).toHaveBeenCalledWith(FIXTURE_LOTS[0].id);
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull());
  });

  it('головна дія — «Сфотографувати вітрину»', async () => {
    const onSnap = jest.fn();
    const user = userEvent.setup();
    await show({ onSnap });
    await user.press(screen.getByRole('button', { name: 'Сфотографувати вітрину' }));
    expect(onSnap).toHaveBeenCalled();
  });
});
