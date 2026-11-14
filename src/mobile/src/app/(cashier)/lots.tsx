import { useLocalSearchParams } from 'expo-router';
import { lotsService } from '../../data/mockLots';
import { LotsScreen } from '../../features/lots/LotsScreen';

export default function CashierLots() {
  const { published } = useLocalSearchParams<{ published?: string }>();
  return <LotsScreen service={lotsService} publishedLotId={published} />;
}
