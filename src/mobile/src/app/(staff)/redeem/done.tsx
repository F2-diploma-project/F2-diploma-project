import { Redirect, useRouter } from 'expo-router';
import { useState } from 'react';
import { IssuedScreen } from '../../../features/pickup/IssuedScreen';
import { pickupSession } from '../../../features/pickup/session';

export default function RedeemDone() {
  const router = useRouter();
  const [redemption] = useState(() => pickupSession.redemption());
  if (!redemption) return <Redirect href="/pickup" />;
  return <IssuedScreen redemption={redemption} onNext={() => router.dismissTo('/pickup')} />;
}
