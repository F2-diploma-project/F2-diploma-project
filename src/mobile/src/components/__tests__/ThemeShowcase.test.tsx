import { render, screen, userEvent } from '@testing-library/react-native';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { ThemeShowcase } from '../ThemeShowcase';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

const renderShowcase = () => render(<ThemeProvider><ThemeShowcase /></ThemeProvider>);

describe('Службова сторінка «Тема»', () => {
  it('показує кольори, типографіку й зразки компонентів', async () => {
    await renderShowcase();
    expect(screen.getByText('Тема')).toBeOnTheScreen();
    expect(screen.getByText('primary')).toBeOnTheScreen();
    expect(screen.getByText('Круасан з мигдалем')).toBeOnTheScreen();
    expect(screen.getByText('Сфотографувати вітрину')).toBeOnTheScreen();
    expect(screen.getByText('−53 %')).toBeOnTheScreen();
  });

  it('перемикає тему кнопками «Світла / Темна / Як у системі»', async () => {
    const user = userEvent.setup();
    await renderShowcase();
    expect(screen.getByTestId('active-scheme')).toHaveTextContent('Світла тема');
    await user.press(screen.getByRole('button', { name: 'Темна' }));
    expect(screen.getByTestId('active-scheme')).toHaveTextContent('Темна тема');
  });

  it('кнопки мають достатню зону натискання', async () => {
    await renderShowcase();
    const cta = screen.getByTestId('cta-container');
    expect(cta).toHaveStyle({ minHeight: 56 });
  });
});
