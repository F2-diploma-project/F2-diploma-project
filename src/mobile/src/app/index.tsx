import { Redirect } from 'expo-router';
import { useAuth } from '../data/auth';

export default function Index() {
  const { session } = useAuth();
  return <Redirect href={session ? '/lots' : '/login'} />;
}
