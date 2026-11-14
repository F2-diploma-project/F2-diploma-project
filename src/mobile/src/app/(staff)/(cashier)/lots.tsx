import { useLocalSearchParams, useRouter } from 'expo-router';
import { lotsService } from '../../../data/mockLots';
import { LotsScreen } from '../../../features/lots/LotsScreen';

export default function CashierLots() {
  const router = useRouter();
  const { published, count, tab } = useLocalSearchParams<{ published?: string; count?: string; tab?: 'active' | 'draft' | 'sold_out' }>();
  return (
    <LotsScreen
      key={`${published ?? ''}-${count ?? ''}-${tab ?? ''}`}
      service={lotsService}
      publishedLotId={published}
      publishedCount={count ? Number(count) : undefined}
      initialTab={tab}
      onSnap={() => router.push('/snap/camera')}
      onOpenLot={(id) => router.push(`/lot/${id}`)}
    />
  );
}
