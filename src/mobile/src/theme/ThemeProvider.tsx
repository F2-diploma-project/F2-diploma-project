import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { buildPaperTheme } from './paperTheme';
import { colors, radius, size, space, typeScale, type ColorTokens, type Scheme } from './tokens';

export type ThemePreference = Scheme | 'system';

export interface AppTheme {
  scheme: Scheme;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  colors: ColorTokens;
  space: typeof space;
  radius: typeof radius;
  size: typeof size;
  type: typeof typeScale;
}

const ThemeContext = createContext<AppTheme | null>(null);

export function ThemeProvider({ children, initialPreference = 'system' }: { children: ReactNode; initialPreference?: ThemePreference }) {
  const system = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>(initialPreference);
  const scheme: Scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<AppTheme>(
    () => ({ scheme, preference, setPreference, colors: colors[scheme], space, radius, size, type: typeScale }),
    [scheme, preference],
  );
  const paperTheme = useMemo(() => buildPaperTheme(scheme), [scheme]);

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme(): AppTheme {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('useTheme потрібно викликати всередині ThemeProvider');
  return theme;
}
