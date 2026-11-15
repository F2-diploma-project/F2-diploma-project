import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import appConfig from '../../../app.json';
import { Icon, type IconName } from '../../components/icons/Icon';
import { useBottomNavInset } from '../../components/ui/BottomNav';
import { ScreenHeader, SegmentTabs } from '../../components/ui';
import { imageSource, plural } from '../../data/format';
import { initials, type Me, type ProfileService, type TodaySummary } from '../../data/profile';
import { useTheme, type ThemePreference } from '../../theme';
import { SettingsDivider, SettingsRow } from './SettingsRow';

const ROLE_LABEL: Record<Me['staff']['role'], string> = { cashier: 'Касир', admin: 'Адміністратор' };
const VERSION = appConfig.expo.version.split('.').slice(0, 2).join('.');

type Load = { state: 'loading' } | { state: 'ready'; me: Me; today: TodaySummary } | { state: 'error' };

interface Props {
  login: string;
  service: ProfileService;
  onNotifications: () => void;
  onHelp: () => void;
  onSignOut: () => void;
}

function Metric({ icon, value, label }: { icon: IconName; value: number; label: string }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View accessible accessibilityLabel={`${value} ${label}`} style={[styles.metric, { backgroundColor: c.primaryContainer, borderRadius: t.radius.lg, padding: t.space.md, gap: t.space.sm }]}>
      <View style={[styles.row, { gap: t.space.sm }]}>
        <View style={[styles.miniPlate, { backgroundColor: c.iconPlate, borderRadius: t.radius.sm }]}>
          <Icon name={icon} color={c.primary} size={20} />
        </View>
        <Text style={[t.type.headlineSmall, { color: c.onPrimaryContainer }]}>{value}</Text>
      </View>
      <Text style={[t.type.bodyMedium, { color: c.onPrimaryContainer }]}>{label}</Text>
    </View>
  );
}

/** Профіль касира: хто я, підсумок за сьогодні, тема, сповіщення, допомога, вихід. */
export function ProfileScreen({ login, service, onNotifications, onHelp, onSignOut }: Props) {
  const t = useTheme();
  const c = t.colors;
  const bottomInset = useBottomNavInset();
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let alive = true;
    Promise.all([service.me(login), service.today()]).then(
      ([me, today]) => alive && setLoad({ state: 'ready', me, today }),
      () => alive && setLoad({ state: 'error' }),
    );
    return () => {
      alive = false;
    };
  }, [service, login, reloadKey]);

  const card = { backgroundColor: c.card, borderRadius: t.radius.card };
  const themes: { value: ThemePreference; label: string }[] = [
    { value: 'light', label: 'Світла' },
    { value: 'dark', label: 'Темна' },
    { value: 'system', label: 'Як у системі' },
  ];

  let top: React.ReactNode;
  if (load.state === 'loading') {
    top = (
      <View style={[card, styles.center, { padding: t.space.xl }]}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  } else if (load.state === 'error') {
    top = (
      <View style={[card, { padding: t.space.lg, gap: t.space.md }]}>
        <View style={[styles.row, { gap: t.space.md }]}>
          <Icon name="cloud_off" color={c.onSurfaceVariant} />
          <Text style={[t.type.bodyLarge, styles.flex, { color: c.onSurface }]}>Не вдалося завантажити профіль</Text>
        </View>
        <Button
          mode="contained-tonal"
          onPress={() => {
            setLoad({ state: 'loading' });
            setReloadKey((k) => k + 1);
          }}
          style={{ borderRadius: t.radius.full }}
          labelStyle={t.type.labelLarge}
        >
          Спробувати ще раз
        </Button>
      </View>
    );
  } else {
    const { me, today } = load;
    top = (
      <>
        <View style={[card, styles.row, { padding: t.space.lg, gap: t.space.lg }]}>
          <View style={[styles.avatar, { backgroundColor: c.primaryContainer, borderRadius: t.radius.full }]}>
            <Text style={[t.type.titleMedium, { color: c.onPrimaryContainer }]}>{initials(me.staff.display_name)}</Text>
          </View>
          <View style={[styles.flex, { gap: t.space.xs }]}>
            <Text style={[t.type.titleLarge, { color: c.onSurface }]}>{me.staff.display_name}</Text>
            <View style={[styles.row, { gap: t.space.sm }]}>
              <View style={[styles.chip, { backgroundColor: c.primaryContainer, borderRadius: t.radius.full }]}>
                <Text style={[t.type.labelMedium, { color: c.onPrimaryContainer }]}>{ROLE_LABEL[me.staff.role]}</Text>
              </View>
              {me.venue.photo !== null ? <Image source={imageSource(me.venue.photo)} style={[styles.venuePhoto, { borderRadius: t.radius.full }]} aria-hidden /> : null}
              <Text style={[t.type.bodySmall, styles.flex, { color: c.onSurfaceVariant }]} numberOfLines={1}>{me.venue.name}</Text>
            </View>
          </View>
        </View>
        <View style={[card, { padding: t.space.lg, gap: t.space.md }]}>
          <Text accessibilityRole="header" style={[t.type.titleSmall, { color: c.onSurface }]}>Сьогодні</Text>
          <View style={[styles.row, { gap: t.space.sm }]}>
            <Metric icon="sell" value={today.published_lots} label={`${plural(today.published_lots, ['лот', 'лоти', 'лотів'])} опубліковано`} />
            <Metric icon="check_circle" value={today.redeemed_orders} label={`${plural(today.redeemed_orders, ['замовлення', 'замовлення', 'замовлень'])} видано`} />
          </View>
        </View>
      </>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: c.screen }]}>
      <ScreenHeader title="Профіль" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.space.lg, paddingBottom: bottomInset, gap: t.space.md }}>
        {top}
        <View style={[card, { paddingVertical: t.space.xs }]}>
          <View style={{ paddingHorizontal: t.space.lg, paddingVertical: t.space.md, gap: t.space.md }}>
            <View style={[styles.row, { gap: t.space.md }]}>
              <View style={[styles.plate, { backgroundColor: c.primaryContainer, borderRadius: t.radius.md - 2 }]}>
                <Icon name="dark_mode" color={c.primary} size={20} />
              </View>
              <Text style={[t.type.bodyLarge, { color: c.onSurface }]}>Тема</Text>
            </View>
            <SegmentTabs items={themes} value={t.preference} onChange={t.setPreference} />
          </View>
          <SettingsDivider />
          <SettingsRow icon="notifications" title="Сповіщення" subtitle="Нові замовлення й готові чернетки" onPress={onNotifications} />
          <SettingsDivider />
          <SettingsRow icon="help" title="Допомога" subtitle="Як публікувати лоти й видавати замовлення" onPress={onHelp} />
        </View>
        <View style={[card, { paddingVertical: t.space.xs }]}>
          <SettingsRow icon="logout" title="Вийти" tone="error" onPress={onSignOut} />
        </View>
        <Text style={[t.type.bodySmall, styles.version, { color: c.onSurfaceVariant }]}>Версія {VERSION} · F2</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: 8, paddingVertical: 2 },
  venuePhoto: { width: 20, height: 20 },
  metric: { flex: 1 },
  miniPlate: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  plate: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  version: { textAlign: 'center' },
});
