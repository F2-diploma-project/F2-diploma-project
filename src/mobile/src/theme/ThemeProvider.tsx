import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { loadThemePreference, saveThemePreference } from '../data/settings';
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

/** `persist` — запам'ятовувати вибір теми на телефоні (у застосунку ввімкнено; у тестах екранів — ні). */
export function ThemeProvider({ children, initialPreference = 'system', persist = false }: { children: ReactNode; initialPreference?: ThemePreference; persist?: boolean }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(initialPreference);
  useEffect(() => {
    if (!persist) return;
    let alive = true;
    loadThemePreference().then((saved) => {
      if (alive && saved) setPreferenceState(saved);
    });
    return () => {
      alive = false;
    };
  }, [persist]);
  const setPreference = useCallback(
    (next: ThemePreference) => {
      setPreferenceState(next);
      if (persist) void saveThemePreference(next);
    },
    [persist],
  );
  const scheme: Scheme = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<AppTheme>(
    () => ({ scheme, preference, setPreference, colors: colors[scheme], space, radius, size, type: typeScale }),
    [scheme, preference, setPreference],
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
