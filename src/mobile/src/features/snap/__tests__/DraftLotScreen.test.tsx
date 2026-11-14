import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../../theme';
import { createMockBackend } from '../../../data/mockStore';
import { DraftLotScreen } from '../DraftLotScreen';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

const setup = async (lotId = 'lot-syrnyk') => {
  const backend = createMockBackend({ delayMs: 0 });
  const props = { onBack: jest.fn(), onSaved: jest.fn(), onPublished: jest.fn() };
  const user = userEvent.setup();
  await render(<ThemeProvider><DraftLotScreen lotId={lotId} service={backend.lots} {...props} /></ThemeProvider>);
  await screen.findByDisplayValue('Сирник із родзинками');
  return { backend, user, ...props };
};

describe('Чернетка лота', () => {
  it('заповнює поля з чернетки й показує знижку', async () => {
    await setup();
    expect(screen.getByDisplayValue('2')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('21:00')).toBeOnTheScreen();
    expect(screen.getByDisplayValue('40')).toBeOnTheScreen();
    expect(screen.getByText('Звичайна ціна 80 ₴ · знижка 50 %')).toBeOnTheScreen();
    expect(screen.getByRole('checkbox', { name: 'Молоко' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Горіхи' })).not.toBeChecked();
  });

  it('зміна ціни одразу перераховує знижку', async () => {
    const { user } = await setup();
    await user.clear(screen.getByLabelText('Нова ціна, ₴'));
    await user.type(screen.getByLabelText('Нова ціна, ₴'), '60');
    expect(screen.getByText('Звичайна ціна 80 ₴ · знижка 25 %')).toBeOnTheScreen();
  });

  it('не зберігає з помилками й підказує, що виправити', async () => {
    const { user, backend } = await setup();
    const spy = jest.spyOn(backend.lots, 'update');
    await user.clear(screen.getByLabelText('Назва'));
    await user.clear(screen.getByLabelText('Кількість'));
    await user.type(screen.getByLabelText('Кількість'), '0');
    await user.clear(screen.getByLabelText('Забрати до'));
    await user.type(screen.getByLabelText('Забрати до'), '25:99');
    await user.press(screen.getByRole('button', { name: 'Зберегти' }));
    expect(screen.getByText('Вкажіть назву')).toBeOnTheScreen();
    expect(screen.getByText('Щонайменше 1')).toBeOnTheScreen();
    expect(screen.getByText('Час у форматі 21:00')).toBeOnTheScreen();
    expect(spy).not.toHaveBeenCalled();
  });

  it('зберігає зміни з версією лота', async () => {
    const { user, backend, onSaved } = await setup();
    const spy = jest.spyOn(backend.lots, 'update');
    await user.press(screen.getByRole('checkbox', { name: 'Горіхи' }));
    await user.press(screen.getByRole('button', { name: 'Зберегти' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith('lot-syrnyk', expect.objectContaining({ version: 1, allergens: expect.arrayContaining(['nuts', 'milk', 'eggs']) }));
  });

  it('публікує лот', async () => {
    const { user, backend, onPublished } = await setup();
    await user.press(screen.getByRole('button', { name: 'Опублікувати' }));
    await waitFor(() => expect(onPublished).toHaveBeenCalledWith('lot-syrnyk'));
    expect((await backend.lots.get('lot-syrnyk')).status).toBe('active');
  });

  it('конфлікт версій — зрозуміле пояснення', async () => {
    const { user, backend } = await setup();
    await backend.lots.update('lot-syrnyk', { version: 1, quantity: 5 });
    await user.press(screen.getByRole('button', { name: 'Зберегти' }));
    expect(await screen.findByText(/Лот щойно змінив інший працівник/)).toBeOnTheScreen();
  });

  it('новий лот вручну створюється через create', async () => {
    const backend = createMockBackend({ delayMs: 0 });
    const spy = jest.spyOn(backend.lots, 'create');
    const onSaved = jest.fn();
    const user = userEvent.setup();
    await render(<ThemeProvider><DraftLotScreen lotId="new" service={backend.lots} onBack={jest.fn()} onSaved={onSaved} onPublished={jest.fn()} /></ThemeProvider>);
    expect(screen.getByRole('header', { name: 'Новий лот' })).toBeOnTheScreen();
    await user.type(screen.getByLabelText('Назва'), 'Пиріг з вишнею');
    await user.type(screen.getByLabelText('Нова ціна, ₴'), '55');
    await user.press(screen.getByRole('button', { name: 'Зберегти' }));
    await waitFor(() => expect(onSaved).toHaveBeenCalled());
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ name: 'Пиріг з вишнею', base_price_minor: 5500, quantity: 1 }));
  });
});
