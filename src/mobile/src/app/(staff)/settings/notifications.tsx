import { useRouter } from 'expo-router';
import { NotificationsScreen } from '../../../features/profile/NotificationsScreen';

export default function SettingsNotifications() {
  const router = useRouter();
  return <NotificationsScreen onBack={() => router.back()} />;
}
