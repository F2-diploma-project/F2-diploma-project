import { Redirect, useRouter } from 'expo-router';
import { useAuth } from '../data/auth';
import { authService } from '../data/mockAuth';
import { LoginScreen } from '../features/auth/LoginScreen';

export default function Login() {
  const { session, signIn } = useAuth();
  const router = useRouter();
  if (session) return <Redirect href="/lots" />;
  return (
    <LoginScreen
      service={authService}
      onSignedIn={(s) => {
        signIn(s);
        // Екрани адміністратора — наступним кроком; поки обидві ролі потрапляють на лоти.
        router.replace('/lots');
      }}
    />
  );
}
