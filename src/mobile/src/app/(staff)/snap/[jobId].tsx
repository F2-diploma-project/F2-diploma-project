import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { backend } from '../../../data/mockStore';
import { RecognizeScreen } from '../../../features/snap/RecognizeScreen';

export default function SnapRecognize() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const onResult = useCallback((id: string) => router.replace(`/snap/results/${id}`), [router]);
  const onFailed = useCallback((code: string) => router.replace(`/snap/failed?code=${code}`), [router]);
  return <RecognizeScreen jobId={jobId} service={backend.recognition} onResult={onResult} onFailed={onFailed} onBack={() => router.replace('/lots?tab=draft')} />;
}
