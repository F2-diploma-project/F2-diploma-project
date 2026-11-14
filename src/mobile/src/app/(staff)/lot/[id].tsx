import { useLocalSearchParams, useRouter } from 'expo-router';
import { backend } from '../../../data/mockStore';
import { DraftLotScreen } from '../../../features/snap/DraftLotScreen';

export default function LotEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/lots?tab=draft'));
  return <DraftLotScreen lotId={id} service={backend.lots} onBack={back} onSaved={() => router.replace('/lots?tab=draft')} onPublished={(lotId) => router.replace(`/lots?published=${lotId}`)} />;
}
