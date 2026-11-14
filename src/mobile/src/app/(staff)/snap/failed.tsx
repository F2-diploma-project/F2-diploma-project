import { useLocalSearchParams, useRouter } from 'expo-router';
import { FailedScreen } from '../../../features/snap/FailedScreen';

export default function SnapFailed() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code?: string }>();
  return <FailedScreen code={code ?? 'RETRIES_EXHAUSTED'} onRetry={() => router.replace('/snap/camera')} onManual={() => router.replace('/lot/new')} onClose={() => router.replace('/lots')} />;
}
