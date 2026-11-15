import { useIsFocused, useRouter } from 'expo-router';
import { useAuth } from '../../../data/auth';
import { backend } from '../../../data/mockStore';
import { ProfileScreen } from '../../../features/profile/ProfileScreen';

export default function CashierProfile() {
  const router = useRouter();
  const { session, signOut } = useAuth();
  const focused = useIsFocused();
  if (!session) return null;
  return (
    <ProfileScreen
      // Повернення на вкладку перечитує підсумок дня.
      key={focused ? 'focused' : 'blurred'}
      login={session.login}
      service={backend.profile}
      onNotifications={() => router.push('/settings/notifications')}
      onHelp={() => router.push('/settings/help')}
      onSignOut={signOut}
    />
  );
}
