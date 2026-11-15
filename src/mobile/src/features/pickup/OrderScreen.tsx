import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../components/icons/Icon';
import { Banner, EmptyState, TopBar } from '../../components/ui';
import { formatPrice, formatTime, imageSource } from '../../data/format';
import { isLate, PickupError, type OrderPreview, type PickupRef, type PickupService, type Redemption } from '../../data/pickup';
import { useTheme } from '../../theme';

type Load =
  | { state: 'loading' }
  | { state: 'ready'; order: OrderPreview }
  | { state: 'not_found' }
  | { state: 'error'; code: 'NETWORK' | 'RATE_LIMITED' };

interface Props {
  service: PickupService;
  pickupRef: PickupRef;
  onIssued: (r: Redemption) => void;
  onClose: () => void;
  onScan: () => void;
  onManual: () => void;
}

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();

function ActionButton({ label, onPress, mode, icon, busy }: { label: string; onPress: () => void; mode: 'contained' | 'outlined'; icon?: IconName; busy: boolean }) {
  const t = useTheme();
  return (
    <Button
      mode={mode}
      onPress={onPress}
      disabled={busy}
      loading={busy && mode === 'contained'}
      icon={icon ? ({ color }) => <Icon name={icon} color={color} size={20} /> : undefined}
      style={{ borderRadius: t.radius.full }}
      contentStyle={{ height: t.size.buttonHeight }}
      labelStyle={t.type.labelLarge}
    >
      {label}
    </Button>
  );
}

/** Перегляд замовлення перед видачею (`lookup`) і сама видача (`redeem`). */
export function OrderScreen({ service, pickupRef, onIssued, onClose, onScan, onManual }: Props) {
  const t = useTheme();
  const c = t.colors;
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [reloadKey, setReloadKey] = useState(0);
  const [busy, setBusy] = useState(false);
  // Захист від подвійної видачі: другий натиск під час запиту ігнорується ще до оновлення стану.
  const inFlight = useRef(false);

  useEffect(() => {
    let alive = true;
    service.lookup(pickupRef).then(
      (order) => alive && setLoad({ state: 'ready', order }),
      (e: unknown) => {
        if (!alive) return;
        if (e instanceof PickupError && e.code === 'TOKEN_NOT_FOUND') setLoad({ state: 'not_found' });
        else setLoad({ state: 'error', code: e instanceof PickupError && e.code === 'RATE_LIMITED' ? 'RATE_LIMITED' : 'NETWORK' });
      },
    );
    return () => {
      alive = false;
    };
  }, [service, pickupRef, reloadKey]);

  const reload = () => {
    setLoad({ state: 'loading' });
    setReloadKey((k) => k + 1);
  };

  const issue = async (allowLate: boolean) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    try {
      onIssued(await service.redeem(pickupRef, { allowLate }));
    } catch (e: unknown) {
      // Стан змінився між переглядом і видачею (видали з іншої каси, минув термін) — показуємо актуальний.
      if (e instanceof PickupError && (e.code === 'TOKEN_ALREADY_USED' || e.code === 'TOKEN_EXPIRED')) reload();
      else setLoad({ state: 'error', code: e instanceof PickupError && e.code === 'RATE_LIMITED' ? 'RATE_LIMITED' : 'NETWORK' });
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  let body: React.ReactNode;
  let actions: React.ReactNode[] = [];
  if (load.state === 'loading') {
    body = (
      <View style={styles.center}>
        <ActivityIndicator color={c.primary} size="large" />
        <Text style={[t.type.bodyLarge, { color: c.onSurfaceVariant, marginTop: t.space.lg }]}>Шукаємо замовлення…</Text>
      </View>
    );
  } else if (load.state === 'not_found') {
    body = (
      <View style={styles.center}>
        <EmptyState icon="error" tone="error" title="Код не знайдено" text="Такого замовлення в цьому закладі немає. Перевірте, чи покупець показує код саме вашого закладу." />
      </View>
    );
    actions = [
        <ActionButton key="Сканувати ще раз" label="Сканувати ще раз" onPress={onScan} mode="contained" icon="qr_code_scanner" busy={busy} />,
        <ActionButton key="Ввести код вручну" label="Ввести код вручну" onPress={onManual} mode="outlined" icon="keyboard" busy={busy} />,
      ];
  } else if (load.state === 'error') {
    const limited = load.code === 'RATE_LIMITED';
    body = (
      <View style={styles.center}>
        <EmptyState
          icon={limited ? 'timer' : 'cloud_off'}
          title={limited ? 'Забагато спроб' : 'Немає зв’язку'}
          text={limited ? 'Код вводили надто часто. Зачекайте хвилину й спробуйте ще раз.' : 'Не вдалося перевірити замовлення. Перевірте інтернет і спробуйте ще раз.'}
        />
      </View>
    );
    actions = [
        <ActionButton key="Спробувати ще раз" label="Спробувати ще раз" onPress={reload} mode="contained" busy={busy} />,
        <ActionButton key="Сканувати інше" label="Сканувати інше" onPress={onScan} mode="outlined" icon="qr_code_scanner" busy={busy} />,
      ];
  } else {
    const { order } = load;
    const now = new Date();
    const late = isLate(order, now);
    const until = formatTime(order.pickup_to);
    let banner: React.ReactNode;
    if (order.status === 'picked_up') {
      const at = order.redeemed_at ?? order.pickup_to;
      const when = sameDay(new Date(at), now) ? `сьогодні о ${formatTime(at)}` : `о ${formatTime(at)}`;
      banner = <Banner kind="warn" icon="warning" text={`Це замовлення вже видано ${when}. Повторно видати не можна.`} />;
      actions = [
        <ActionButton key="Сканувати інше" label="Сканувати інше" onPress={onScan} mode="contained" icon="qr_code_scanner" busy={busy} />,
      ];
    } else if (late) {
      banner = <Banner kind="warn" icon="warning" text={`Час видачі минув о ${until}. Перевірте, чи замовлення ще є і чи воно придатне.`} />;
      actions = [
        <ActionButton key="Усе одно видати" label="Усе одно видати" onPress={() => issue(true)} mode="contained" busy={busy} />,
        <ActionButton key="Не видавати" label="Не видавати" onPress={onClose} mode="outlined" busy={busy} />,
      ];
    } else {
      banner = <Banner kind="ok" icon="check_circle" text="Оплачено. Можна видавати." />;
      actions = [
        <ActionButton key="Видати замовлення" label="Видати замовлення" onPress={() => issue(false)} mode="contained" icon="check" busy={busy} />,
      ];
    }
    const deadline =
      late
        ? `Треба було забрати до ${until}`
        : sameDay(new Date(order.pickup_to), now)
          ? `Забрати сьогодні до ${until}`
          : `Забрати до ${until}`;
    body = (
      <ScrollView contentContainerStyle={{ padding: t.space.lg, gap: t.space.md }}>
        {banner}
        <View style={[styles.card, { backgroundColor: c.card, borderRadius: t.radius.card, padding: t.space.lg, gap: t.space.md }]}>
          <View style={styles.row}>
            <Text style={[t.type.titleMedium, styles.flex, { color: c.onSurface }]}>Код {order.confirmation_code}</Text>
            <Text style={[t.type.titleLarge, { color: c.primary }]}>{formatPrice(order.total_minor)}</Text>
          </View>
          <View style={[styles.row, { gap: t.space.md }]}>
            <View style={[styles.thumb, { borderRadius: t.radius.sm, backgroundColor: c.surfaceVariant }]}>
              {order.photo !== null ? <Image source={imageSource(order.photo)} style={styles.photo} accessibilityIgnoresInvertColors /> : <Icon name="image" color={c.onSurfaceVariant} size={20} />}
            </View>
            <Text style={[t.type.bodyLarge, styles.flex, { color: c.onSurface }]}>{order.lot_name}</Text>
            <Text style={[t.type.bodyMedium, { color: c.onSurfaceVariant }]}>× {order.quantity}</Text>
            <Text style={[t.type.bodyMedium, { color: c.onSurface }]}>{formatPrice(order.total_minor)}</Text>
          </View>
          <View style={[styles.dashed, { borderColor: c.outlineVariant }]} />
          <View style={[styles.row, { backgroundColor: c.surfaceVariant, borderRadius: t.radius.lg, padding: t.space.sm, gap: t.space.sm }]}>
            <View style={[styles.plate, { backgroundColor: c.iconPlate, borderRadius: t.radius.sm }]}>
              <Icon name="schedule" color={c.onSurface} size={20} />
            </View>
            <Text style={[t.type.bodyMedium, styles.flex, { color: c.onSurface }]}>{deadline}</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.screen }]}>
      <TopBar title="Замовлення" onClose={onClose} />
      <View style={styles.flex}>{body}</View>
      {actions.length ? <View style={{ padding: t.space.lg, gap: t.space.md }}>{actions}</View> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  card: {},
  row: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 40, height: 40, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%' },
  dashed: { borderTopWidth: 1, borderStyle: 'dashed' },
  plate: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
