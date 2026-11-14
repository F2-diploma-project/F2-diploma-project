import { Text } from 'react-native';
import { render, screen, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { colors } from '../tokens';
import { buildPaperTheme } from '../paperTheme';

const mockScheme = { value: 'light' as 'light' | 'dark' | null };
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockScheme.value,
}));

function Probe() {
  const theme = useTheme();
  return (
    <>
      <Text testID="scheme">{theme.scheme}</Text>
      <Text testID="pref">{theme.preference}</Text>
      <Text testID="primary">{theme.colors.primary}</Text>
      <Text testID="toDark" onPress={() => theme.setPreference('dark')}>dark</Text>
      <Text testID="toSystem" onPress={() => theme.setPreference('system')}>system</Text>
    </>
  );
}

describe('ThemeProvider', () => {
  afterEach(() => { mockScheme.value = 'light'; });

  it('за замовчуванням іде за системою: світла', async () => {
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('pref')).toHaveTextContent('system');
    expect(screen.getByTestId('scheme')).toHaveTextContent('light');
    expect(screen.getByTestId('primary')).toHaveTextContent(colors.light.primary);
  });

  it('за системою: темна', async () => {
    mockScheme.value = 'dark';
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    expect(screen.getByTestId('scheme')).toHaveTextContent('dark');
    expect(screen.getByTestId('primary')).toHaveTextContent(colors.dark.primary);
  });

  it('ручний вибір переважає систему й повертається до неї', async () => {
    await render(<ThemeProvider><Probe /></ThemeProvider>);
    await act(async () => { screen.getByTestId('toDark').props.onPress(); });
    expect(screen.getByTestId('scheme')).toHaveTextContent('dark');
    await act(async () => { screen.getByTestId('toSystem').props.onPress(); });
    expect(screen.getByTestId('scheme')).toHaveTextContent('light');
  });

  it('useTheme поза провайдером — зрозуміла помилка', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    await expect(render(<Probe />)).rejects.toThrow('useTheme');
    spy.mockRestore();
  });
});

describe('тема React Native Paper', () => {
  it('бере кольори з наших токенів', () => {
    const light = buildPaperTheme('light');
    const dark = buildPaperTheme('dark');
    expect(light.dark).toBe(false);
    expect(dark.dark).toBe(true);
    expect(light.colors.primary).toBe(colors.light.primary);
    expect(dark.colors.primaryContainer).toBe(colors.dark.primaryContainer);
    expect(light.colors.background).toBe(colors.light.screen);
    expect(light.roundness).toBe(4);
  });

  it('використовує шрифт Onest', () => {
    const t = buildPaperTheme('light');
    expect(t.fonts.bodyLarge.fontFamily).toBe('Onest_400Regular');
    expect(t.fonts.titleLarge.fontFamily).toBe('Onest_600SemiBold');
  });
});
