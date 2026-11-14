import { useLocalSearchParams, useRouter } from 'expo-router';
import { backend } from '../../../../data/mockStore';
import { ResultsScreen } from '../../../../features/snap/ResultsScreen';

export default function SnapResults() {
  const router = useRouter();
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  return (
    <ResultsScreen
      jobId={jobId}
      recognition={backend.recognition}
      lots={backend.lots}
      onOpenLot={(id) => router.push(`/lot/${id}`)}
      onSaved={() => router.replace('/lots?tab=draft')}
      onPublished={(n) => router.replace(`/lots?count=${n}`)}
      onClose={() => router.replace('/lots?tab=draft')}
    />
  );
}
