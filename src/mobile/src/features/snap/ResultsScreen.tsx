import { useCallback, useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/icons/Icon';
import { Banner, IconChip, LotCard } from '../../components/ui';
import { formatDiscount, formatPrice, plural } from '../../data/format';
import type { BundleSuggestion, RecognitionItem, RecognitionService } from '../../data/recognition';
import type { LotsService, StaffLot } from '../../data/types';
import { useTheme } from '../../theme';

const BUNDLE_PHOTOS = [require('../../../assets/photos/croissant_b.jpg'), require('../../../assets/photos/coffee.jpg')];

function ReviewCard({ item, onDecide }: { item: RecognitionItem; onDecide: (decision: 'accept' | 'reject', fix: { name: string; quantity: number }) => Promise<void> }) {
  const t = useTheme();
  const c = t.colors;
  const [name, setName] = useState(item.name);
  const [qty, setQty] = useState(String(item.quantity));
  const [busy, setBusy] = useState(false);
  const quantity = Number.parseInt(qty, 10);
  const valid = name.trim().length > 0 && Number.isInteger(quantity) && quantity >= 1;
  const decide = async (d: 'accept' | 'reject') => {
    setBusy(true);
    try {
      await onDecide(d, { name: name.trim(), quantity });
    } finally {
      setBusy(false);
    }
  };
  return (
    <View testID="review-card" style={[styles.box, { backgroundColor: c.tertiaryContainer, borderRadius: t.radius.card, padding: t.space.lg, gap: t.space.md }]}>
      <View style={[styles.row, { gap: t.space.md }]}>
        <IconChip icon="help" color={c.tertiary} background={c.iconPlate} />
        <Text style={[t.type.bodyMedium, styles.flex, { color: c.onTertiaryContainer }]}>
          Не впевнені ({Math.round(item.confidence * 100)} %). Перевірте назву й кількість.
        </Text>
      </View>
      <TextInput mode="outlined" label="Назва" accessibilityLabel="Назва" value={name} onChangeText={setName} dense theme={{ roundness: t.radius.md }} style={{ backgroundColor: c.card }} />
      <TextInput mode="outlined" label="Кількість" accessibilityLabel="Кількість" value={qty} onChangeText={setQty} keyboardType="number-pad" dense theme={{ roundness: t.radius.md }} style={{ backgroundColor: c.card }} />
      <View style={[styles.row, { gap: t.space.sm }]}>
        <Button mode="contained" disabled={!valid || busy} onPress={() => decide('accept')} accessibilityLabel="Додати" labelStyle={t.type.labelLarge}>
          Додати
        </Button>
        <Button mode="text" disabled={busy} onPress={() => decide('reject')} accessibilityLabel="Це не те" labelStyle={t.type.labelLarge}>
          Це не те
        </Button>
      </View>
    </View>
  );
}

function BundleCard({ bundle, onAdd, onDismiss }: { bundle: BundleSuggestion; onAdd: () => void; onDismiss: () => void }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={[styles.box, { backgroundColor: c.secondaryContainer, borderRadius: t.radius.card, paddingHorizontal: t.space.lg, paddingBottom: t.space.lg, paddingTop: t.space.sm, gap: t.space.md }]}>
      <View style={[styles.row, styles.between]}>
        <View style={[styles.tag, { backgroundColor: c.iconPlate, borderRadius: t.radius.full }]}>
          <Icon name="bolt" color={c.primary} size={16} />
          <Text style={[t.type.labelMedium, { color: c.onSecondaryContainer }]}>Пропонуємо набір</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Не треба" onPress={onDismiss} style={styles.close}>
          <Icon name="close" color={c.onSecondaryContainer} size={20} />
        </Pressable>
      </View>
      <View style={[styles.row, { gap: t.space.md }]}>
        <View style={styles.stack} aria-hidden>
          {BUNDLE_PHOTOS.map((src, i) => (
            <Image key={i} source={src} style={[styles.stackPhoto, { left: i * 36, borderColor: c.iconPlate }]} />
          ))}
        </View>
        <View style={styles.flex}>
          <Text style={[t.type.titleMedium, { color: c.onSecondaryContainer }]}>{bundle.name}</Text>
          <Text style={[t.type.bodySmall, { color: c.onSecondaryContainer }]}>{bundle.items.map((i) => i.name).join(' і ')}</Text>
        </View>
        <View style={styles.price}>
          <Text style={[t.type.titleLarge, { color: c.onSecondaryContainer }]}>{formatPrice(bundle.price_minor)}</Text>
          <View style={[styles.row, { gap: 6 }]}>
            <Text style={[t.type.bodySmall, styles.strike, { color: c.onSecondaryContainer }]}>{formatPrice(bundle.regular_price_minor)}</Text>
            <View style={[styles.pill, { backgroundColor: c.iconPlate, borderRadius: t.radius.full }]}>
              <Text style={[t.type.labelMedium, { color: c.onSecondaryContainer }]}>{formatDiscount(bundle.price_minor, bundle.regular_price_minor)}</Text>
            </View>
          </View>
        </View>
      </View>
      <Button
        mode="contained"
        onPress={onAdd}
        accessibilityLabel="Додати набір до чернеток"
        icon={({ color }) => <Icon name="add" color={color} size={20} />}
        style={{ borderRadius: t.radius.full }}
        contentStyle={{ height: t.size.touchMin }}
        labelStyle={t.type.labelLarge}
      >
        Додати набір до чернеток
      </Button>
    </View>
  );
}

/** «Знайдено на фото»: чернетки з розпізнаних позицій, позиції для перевірки, пропозиція набору. */
export function ResultsScreen({ jobId, recognition, lots, onOpenLot, onSaved, onPublished, onClose }: {
  jobId: string;
  recognition: RecognitionService;
  lots: LotsService;
  onOpenLot: (lotId: string) => void;
  onSaved: () => void;
  onPublished: (count: number) => void;
  onClose: () => void;
}) {
  const t = useTheme();
  const c = t.colors;
  const [items, setItems] = useState<RecognitionItem[] | null>(null);
  const [drafts, setDrafts] = useState<Record<string, StaffLot>>({});
  const [bundle, setBundle] = useState<BundleSuggestion | null>(null);
  const [bundleAdded, setBundleAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDraft = useCallback(async (lotId: string) => {
    const lot = await lots.get(lotId);
    setDrafts((d) => ({ ...d, [lotId]: lot }));
  }, [lots]);

  useEffect(() => {
    let alive = true;
    recognition.getJob(jobId).then(async (job) => {
      if (!alive) return;
      setItems(job.items);
      setBundle(job.bundle_suggestion ?? null);
      await Promise.all(job.items.filter((i) => i.lot_id).map((i) => loadDraft(i.lot_id as string)));
    }).catch(() => alive && setError('Не вдалося завантажити результат. Спробуйте ще раз.'));
    return () => {
      alive = false;
    };
  }, [jobId, recognition, loadDraft]);

  const accepted = (items ?? []).filter((i) => i.lot_id && (i.review_status === 'auto_accepted' || i.review_status === 'accepted'));
  const pending = (items ?? []).filter((i) => i.review_status === 'pending_review');

  const decide = async (item: RecognitionItem, decision: 'accept' | 'reject', fix: { name: string; quantity: number }) => {
    const next = await recognition.review(jobId, item.id, decision, decision === 'accept' ? fix : undefined);
    if (next.lot_id) await loadDraft(next.lot_id);
    setItems((list) => (list ?? []).map((i) => (i.id === item.id ? next : i)));
  };

  const addBundle = async () => {
    if (!bundle) return;
    await lots.create({ name: bundle.name, base_price_minor: bundle.price_minor, regular_price_minor: bundle.regular_price_minor, quantity: 1, pickup_to: Object.values(drafts)[0]?.pickup_to ?? new Date().toISOString(), bundle_items: bundle.items, photo: BUNDLE_PHOTOS[0] });
    setBundle(null);
    setBundleAdded(true);
  };

  const publishAll = async () => {
    setBusy(true);
    setError(null);
    try {
      const ids = accepted.map((i) => i.lot_id as string);
      for (const id of ids) await lots.publish(id);
      onPublished(ids.length);
    } catch {
      setError('Не вдалося опублікувати всі лоти. Перевірте звʼязок і спробуйте ще раз.');
    } finally {
      setBusy(false);
    }
  };

  const n = accepted.length;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.screen }]}>
      <View style={[styles.row, { paddingHorizontal: t.space.sm, paddingVertical: t.space.sm }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Закрити" onPress={onClose} style={styles.close}>
          <Icon name="close" color={c.onSurface} />
        </Pressable>
        <Text accessibilityRole="header" style={[t.type.titleLarge, { color: c.onSurface }]}>Знайдено на фото</Text>
      </View>
      {items === null && !error ? (
        <View style={styles.center}><ActivityIndicator color={c.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: t.space.lg, paddingBottom: t.space.lg, gap: t.space.sm }}>
          {error ? <Banner kind="error" icon="error" text={error} /> : null}
          {n > 0 ? <Banner kind="ok" icon="check_circle" text={`Розпізнано ${n} ${plural(n, ['позицію', 'позиції', 'позицій'])}. Перевірте й опублікуйте.`} /> : null}
          {bundleAdded ? <Banner kind="info" icon="bolt" text="Набір додано до чернеток" /> : null}
          {accepted.map((i) => {
            const lot = drafts[i.lot_id as string];
            return lot ? <LotCard key={i.id} lot={lot} onPress={() => onOpenLot(lot.id)} /> : null;
          })}
          {pending.map((i) => (
            <ReviewCard key={i.id} item={i} onDecide={(d, fix) => decide(i, d, fix)} />
          ))}
          {bundle ? <BundleCard bundle={bundle} onAdd={addBundle} onDismiss={() => setBundle(null)} /> : null}
        </ScrollView>
      )}
      <View style={[styles.row, { padding: t.space.lg, gap: t.space.md }]}>
        <Button mode="outlined" onPress={onSaved} style={[styles.flex, { borderRadius: t.radius.full }]} contentStyle={{ height: t.size.buttonHeight }} labelStyle={t.type.labelLarge}>
          Зберегти
        </Button>
        <Button mode="contained" onPress={publishAll} loading={busy} disabled={busy || n === 0} accessibilityLabel="Опублікувати всі" style={[styles.flex, { borderRadius: t.radius.full }]} contentStyle={{ height: t.size.buttonHeight }} labelStyle={t.type.labelLarge}>
          Опублікувати всі
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { justifyContent: 'space-between' },
  box: {},
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, paddingLeft: 8, paddingRight: 12 },
  close: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  stack: { width: 92, height: 56 },
  stackPhoto: { position: 'absolute', top: 0, width: 56, height: 56, borderRadius: 16, borderWidth: 2 },
  price: { alignItems: 'flex-end', gap: 4 },
  strike: { textDecorationLine: 'line-through' },
  pill: { paddingHorizontal: 8, paddingVertical: 2 },
});
