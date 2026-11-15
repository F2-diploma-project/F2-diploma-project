import { useRouter } from 'expo-router';
import { HelpScreen } from '../../../features/profile/HelpScreen';

export default function SettingsHelp() {
  const router = useRouter();
  return <HelpScreen onBack={() => router.back()} />;
}
