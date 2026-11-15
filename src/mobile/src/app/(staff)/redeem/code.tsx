import { useRouter } from 'expo-router';
import { CodeEntryScreen } from '../../../features/pickup/CodeEntryScreen';
import { pickupSession } from '../../../features/pickup/session';

export default function RedeemCode() {
  const router = useRouter();
  return (
    <CodeEntryScreen
      onBack={() => router.back()}
      onSubmit={(code) => {
        pickupSession.setRef({ confirmation_code: code });
        router.replace('/redeem/order');
      }}
    />
  );
}
