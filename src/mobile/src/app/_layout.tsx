import { Onest_400Regular, Onest_500Medium, Onest_600SemiBold, useFonts } from '@expo-google-fonts/onest';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../theme';

function Shell() {
  const { scheme } = useTheme();
  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({ Onest_400Regular, Onest_500Medium, Onest_600SemiBold });
  if (!loaded) return null;
  return (
    <ThemeProvider>
      <Shell />
    </ThemeProvider>
  );
}
