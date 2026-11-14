import { MD3DarkTheme, MD3LightTheme, configureFonts, type MD3Theme } from 'react-native-paper';
import { colors, typeScale, type Scheme } from './tokens';

/** Тема React Native Paper, заповнена токенами дизайн-системи (Figma). */
export function buildPaperTheme(scheme: Scheme): MD3Theme {
  const base = scheme === 'dark' ? MD3DarkTheme : MD3LightTheme;
  const c = colors[scheme];
  return {
    ...base,
    dark: scheme === 'dark',
    roundness: 4,
    fonts: configureFonts({ config: typeScale }),
    colors: {
      ...base.colors,
      primary: c.primary,
      onPrimary: c.onPrimary,
      primaryContainer: c.primaryContainer,
      onPrimaryContainer: c.onPrimaryContainer,
      secondary: c.secondary,
      onSecondary: c.onSecondary,
      secondaryContainer: c.secondaryContainer,
      onSecondaryContainer: c.onSecondaryContainer,
      tertiary: c.tertiary,
      onTertiary: c.onTertiary,
      tertiaryContainer: c.tertiaryContainer,
      onTertiaryContainer: c.onTertiaryContainer,
      error: c.error,
      onError: c.onError,
      errorContainer: c.errorContainer,
      onErrorContainer: c.onErrorContainer,
      background: c.screen,
      onBackground: c.onBackground,
      surface: c.surface,
      onSurface: c.onSurface,
      surfaceVariant: c.surfaceVariant,
      onSurfaceVariant: c.onSurfaceVariant,
      outline: c.outline,
      outlineVariant: c.outlineVariant,
      inverseSurface: c.inverseSurface,
      inverseOnSurface: c.inverseOnSurface,
      inversePrimary: c.inversePrimary,
    },
  };
}
