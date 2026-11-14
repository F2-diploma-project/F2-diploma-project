import { Tabs, usePathname, useRouter } from 'expo-router';
import { BottomNav, type NavItem } from '../../../components/ui';

const ITEMS: NavItem[] = [
  { key: 'lots', label: 'Лоти', icon: 'sell' },
  { key: 'pickup', label: 'Видача', icon: 'qr_code_scanner' },
  { key: 'profile', label: 'Профіль', icon: 'person' },
];

function CashierTabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const active = ITEMS.find((i) => pathname.startsWith(`/${i.key}`))?.key ?? 'lots';
  return <BottomNav items={ITEMS} active={active} onPress={(key) => router.navigate(`/${key}` as '/lots')} />;
}

/** Екрани касира з висячою нижньою навігацією. */
export default function CashierLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={() => <CashierTabBar />}>
      <Tabs.Screen name="lots" />
      <Tabs.Screen name="pickup" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
