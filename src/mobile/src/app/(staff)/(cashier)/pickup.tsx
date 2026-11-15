import { useIsFocused, useRouter } from 'expo-router';
import { FIXTURE_ORDERS } from '../../../data/mockStore';
import { ScannerScreen } from '../../../features/pickup/ScannerScreen';
import { pickupSession } from '../../../features/pickup/session';

export default function CashierPickup() {
  const router = useRouter();
  const focused = useIsFocused();
  return (
    <ScannerScreen
      active={focused}
      onScanned={(ref) => {
        pickupSession.setRef(ref);
        router.push('/redeem/order');
      }}
      onManual={() => router.push('/redeem/code')}
      devToken={__DEV__ ? FIXTURE_ORDERS.awaiting.token : undefined}
    />
  );
}
