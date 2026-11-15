import { Image } from 'react-native';
import { render, screen, userEvent, waitFor, within } from '@testing-library/react-native';
import { ThemeProvider } from '../../../theme';
import { createMockBackend } from '../../../data/mockStore';
import { ResultsScreen } from '../ResultsScreen';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));
// Імітація ImageLoader у jest-expo застаріла для RN 0.88 — розмір фото підставляємо самі.
jest.spyOn(Image, 'getSize').mockImplementation((() => Promise.resolve({ width: 1000, height: 800 })) as unknown as typeof Image.getSize);

const setup = async () => {
  const backend = createMockBackend({ delayMs: 0, processingPolls: 0 });
  const { job_id } = await backend.recognition.createJob({ uri: 'file:///shot.jpg', mimeType: 'image/jpeg', fileSize: 1 });
  await backend.recognition.getJob(job_id);
  const props = { onOpenLot: jest.fn(), onSaved: jest.fn(), onPublished: jest.fn(), onClose: jest.fn() };
  const user = userEvent.setup();
  await render(<ThemeProvider><ResultsScreen jobId={job_id} recognition={backend.recognition} lots={backend.lots} {...props} /></ThemeProvider>);
  await screen.findByText('Круасан з мигдалем');
  return { backend, job_id, user, ...props };
};

describe('«Знайдено на фото»', () => {
  it('чернетки впевнено розпізнаних позицій і банер', async () => {
    await setup();
    expect(screen.getByText('Розпізнано 3 позиції. Перевірте й опублікуйте.')).toBeOnTheScreen();
    expect(screen.getByText('Сирник із родзинками')).toBeOnTheScreen();
    expect(screen.getByText('Кава фільтр')).toBeOnTheScreen();
  });

  it('невпевнену позицію треба підтвердити: «Додати» створює чернетку', async () => {
    const { user } = await setup();
    const card = screen.getByTestId('review-card');
    expect(within(card).getByText('Не впевнені · 58 %')).toBeOnTheScreen();
    expect(within(card).getByText('Перевірте назву й кількість')).toBeOnTheScreen();
    expect(within(card).getByTestId('review-photo', { includeHiddenElements: true })).toBeOnTheScreen();
    await user.clear(within(card).getByLabelText('Назва'));
    await user.type(within(card).getByLabelText('Назва'), 'Булочка з маком');
    await user.press(within(card).getByRole('button', { name: 'Додати до чернеток' }));
    expect(await screen.findByText('Булочка з маком')).toBeOnTheScreen();
    expect(screen.queryByTestId('review-card')).toBeNull();
    expect(screen.getByText('Розпізнано 4 позиції. Перевірте й опублікуйте.')).toBeOnTheScreen();
  });

  it('«Це не те» прибирає невпевнену позицію', async () => {
    const { user } = await setup();
    await user.press(within(screen.getByTestId('review-card')).getByRole('button', { name: 'Це не те' }));
    await waitFor(() => expect(screen.queryByTestId('review-card')).toBeNull());
    expect(screen.queryByText('Булочка з корицею')).toBeNull();
  });

  it('пропозиція набору: додати створює набір-чернетку', async () => {
    const { user, backend } = await setup();
    const spy = jest.spyOn(backend.lots, 'create');
    expect(screen.getByText('Сет «Круасан + кава»')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Додати набір до чернеток' }));
    await waitFor(() => expect(spy).toHaveBeenCalledWith(expect.objectContaining({ bundle_items: expect.any(Array), base_price_minor: 6900 })));
    expect(await screen.findByText('Набір додано до чернеток')).toBeOnTheScreen();
  });

  it('пропозицію набору можна закрити', async () => {
    const { user } = await setup();
    await user.press(screen.getByRole('button', { name: 'Не треба' }));
    expect(screen.queryByText('Пропонуємо набір')).toBeNull();
  });

  it('«Опублікувати всі» публікує чернетки цього фото', async () => {
    const { user, onPublished, backend } = await setup();
    await user.press(screen.getByRole('button', { name: 'Опублікувати всі' }));
    await waitFor(() => expect(onPublished).toHaveBeenCalledWith(3));
    const active = await backend.lots.list('active');
    expect(active.map((l) => l.name)).toEqual(expect.arrayContaining(['Сирник із родзинками', 'Кава фільтр']));
  });

  it('натискання на чернетку відкриває редагування', async () => {
    const { user, onOpenLot } = await setup();
    await user.press(screen.getByRole('button', { name: /Кава фільтр/ }));
    expect(onOpenLot).toHaveBeenCalledWith(expect.stringMatching(/^lot-/));
  });
});
