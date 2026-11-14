import { render, screen, userEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../../theme';
import { FailedScreen } from '../FailedScreen';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

describe('Не вдалося розпізнати', () => {
  it('пояснює причину за кодом і пропонує дії', async () => {
    const props = { onRetry: jest.fn(), onManual: jest.fn(), onClose: jest.fn() };
    const user = userEvent.setup();
    await render(<ThemeProvider><FailedScreen code="EMPTY_RESULT" {...props} /></ThemeProvider>);
    expect(screen.getByText(/На фото не видно позицій/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Сфотографувати ще раз' }));
    await user.press(screen.getByRole('button', { name: 'Додати лот вручну' }));
    expect(props.onRetry).toHaveBeenCalled();
    expect(props.onManual).toHaveBeenCalled();
  });

  it('невідомий код — загальне пояснення', async () => {
    await render(<ThemeProvider><FailedScreen code="SCHEMA_INVALID" onRetry={jest.fn()} onManual={jest.fn()} onClose={jest.fn()} /></ThemeProvider>);
    expect(screen.getByText(/Не вдалося розпізнати фото/)).toBeOnTheScreen();
  });
});
