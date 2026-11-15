import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { backend } from '../../../data/mockStore';
import { OrderScreen } from '../../../features/pickup/OrderScreen';
import { pickupSession } from '../../../features/pickup/session';

export default function RedeemOrder() {
  const router = useRouter();
  const [pickupRef] = useState(() => pickupSession.ref());
  if (!pickupRef) return <Redirect href="/pickup" />;
  return (
    <OrderScreen
      service={backend.pickup}
      pickupRef={pickupRef}
      onIssued={(r) => {
        pickupSession.setRedemption(r);
        router.replace('/redeem/done');
      }}
      onClose={() => router.dismissTo('/pickup')}
      onScan={() => router.dismissTo('/pickup')}
      onManual={() => router.replace('/redeem/code')}
    />
  );
}
