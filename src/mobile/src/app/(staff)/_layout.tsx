import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../data/auth';

/** Усі екрани персоналу доступні лише після входу. */
export default function StaffLayout() {
  const { session } = useAuth();
  if (!session) return <Redirect href="/login" />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
