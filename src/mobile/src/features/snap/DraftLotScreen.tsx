import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityIndicator, Button, HelperText, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/icons/Icon';
import { Banner } from '../../components/ui';
import { ALLERGEN_LABEL, formatDiscount, formatPrice, formatTime, imageSource } from '../../data/format';
import { LotError, type AllergenCode, type LotsService, type StaffLot } from '../../data/types';
import { useTheme } from '../../theme';

const ALLERGENS = Object.keys(ALLERGEN_LABEL) as AllergenCode[];
const TIME = /^([01]\d|2[0-3]):([0-5]\d)$/;

interface Form {
  name: string;
  quantity: string;
  pickupTo: string;
  price: string;
  allergens: AllergenCode[];
}

const validate = (f: Form) => {
  const qty = Number(f.quantity);
  const price = Number(f.price.replace(',', '.'));
  return {
    name: f.name.trim() ? (f.name.trim().length > 200 ? 'Не довше 200 символів' : null) : 'Вкажіть назву',
    quantity: Number.isInteger(qty) && qty >= 1 ? null : 'Щонайменше 1',
    pickupTo: TIME.test(f.pickupTo) ? null : 'Час у форматі 21:00',
    price: Number.isFinite(price) && price > 0 ? null : 'Вкажіть ціну',
  };
};

/** Порожня чернетка для ручного додавання лота (`POST /v1/venue/lots`). */
const newLot = (): StaffLot => {
  const pickup = new Date();
  pickup.setHours(21, 0, 0, 0);
  return { id: 'new', name: '', base_price_minor: 0, regular_price_minor: null, quantity: 1, unit: 'pcs', pickup_to: pickup.toISOString(), status: 'draft', is_bundle: false, allergens: [], version: 0, photo: null };
};

/** Дата сьогодні з часом HH:MM → ISO. */
const todayAt = (hhmm: string, base: string) => {
  const d = new Date(base);
  const [h, m] = hhmm.split(':').map(Number);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

/** Редагування й публікація чернетки лота (з фото вітрини або вручну). */
export function DraftLotScreen({ lotId, service, onBack, onSaved, onPublished }: {
  lotId: string;
  service: LotsService;
  onBack: () => void;
  onSaved: () => void;
  onPublished: (lotId: string) => void;
}) {
  const t = useTheme();
  const c = t.colors;
  const [lot, setLot] = useState<StaffLot | null>(() => (lotId === 'new' ? newLot() : null));
  const [form, setForm] = useState<Form | null>(() => (lotId === 'new' ? { name: '', quantity: '1', pickupTo: '21:00', price: '', allergens: [] } : null));
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState<'save' | 'publish' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (lotId === 'new') return;
    service.get(lotId).then((l) => {
      if (!alive) return;
      setLot(l);
      setForm({ name: l.name, quantity: String(l.quantity), pickupTo: formatTime(l.pickup_to), price: String(l.base_price_minor / 100), allergens: l.allergens });
    }).catch(() => alive && setError('Не вдалося відкрити лот. Спробуйте ще раз.'));
    return () => {
      alive = false;
    };
  }, [lotId, service]);

  if (!lot || !form) {
    return (
      <SafeAreaView style={[styles.flex, styles.center, { backgroundColor: c.surface }]}>
        {error ? <Banner kind="error" icon="error" text={error} /> : <ActivityIndicator color={c.primary} />}
      </SafeAreaView>
    );
  }

  const errors = validate(form);
  const show = (k: keyof typeof errors) => (touched ? errors[k] : null);
  const priceMinor = Math.round(Number(form.price.replace(',', '.')) * 100);
  const discount = Number.isFinite(priceMinor) ? formatDiscount(priceMinor, lot.regular_price_minor) : null;
  const set = (patch: Partial<Form>) => setForm((f) => (f ? { ...f, ...patch } : f));
  const toggle = (a: AllergenCode) => set({ allergens: form.allergens.includes(a) ? form.allergens.filter((x) => x !== a) : [...form.allergens, a] });

  const save = async (mode: 'save' | 'publish') => {
    setTouched(true);
    setError(null);
    if (Object.values(errors).some(Boolean)) return;
    setBusy(mode);
    try {
      const values = { name: form.name.trim(), quantity: Number(form.quantity), pickup_to: todayAt(form.pickupTo, lot.pickup_to), base_price_minor: priceMinor, allergens: form.allergens };
      const updated = lot.id === 'new' ? await service.create(values) : await service.update(lot.id, { version: lot.version, ...values });
      setLot(updated);
      if (mode === 'publish') {
        await service.publish(updated.id);
        onPublished(updated.id);
      } else {
        onSaved();
      }
    } catch (e) {
      setError(e instanceof LotError && e.code === 'VERSION_CONFLICT'
        ? 'Лот щойно змінив інший працівник. Поверніться до списку й відкрийте його знову.'
        : 'Не вдалося зберегти. Перевірте звʼязок і спробуйте ще раз.');
    } finally {
      setBusy(null);
    }
  };

  const field = { mode: 'outlined' as const, theme: { roundness: t.radius.md }, style: { backgroundColor: c.surface } };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.surface }]}>
      <View style={[styles.row, { paddingHorizontal: t.space.sm, paddingVertical: t.space.sm }]}>
        <Pressable accessibilityRole="button" accessibilityLabel="Назад" onPress={onBack} style={styles.icon}>
          <Icon name="arrow_back" color={c.onSurface} />
        </Pressable>
        <Text accessibilityRole="header" style={[t.type.titleLarge, styles.flex, { color: c.onSurface }]}>{lot.id === 'new' ? 'Новий лот' : 'Чернетка лота'}</Text>
      </View>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: t.space.lg, paddingBottom: t.space.lg, gap: t.space.md }} keyboardShouldPersistTaps="handled">
          <View style={[styles.photo, { borderRadius: t.radius.lg, backgroundColor: c.surfaceVariant }]}>
            {lot.photo ? <Image source={imageSource(lot.photo)} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
            <View style={[styles.status, { backgroundColor: c.surfaceVariant, borderRadius: t.radius.full }]}>
              <Icon name="edit" color={c.onSurfaceVariant} size={16} />
              <Text style={[t.type.labelLarge, { color: c.onSurfaceVariant }]}>{lot.status === 'draft' ? 'Чернетка' : 'Опубліковано'}</Text>
            </View>
          </View>
          {error ? <Banner kind="error" icon="error" text={error} /> : null}
          <View>
            <TextInput {...field} label="Назва" accessibilityLabel="Назва" value={form.name} onChangeText={(name) => set({ name })} error={Boolean(show('name'))} />
            {show('name') ? <HelperText type="error">{show('name')}</HelperText> : null}
          </View>
          <View style={[styles.row, styles.top, { gap: t.space.md }]}>
            <View style={styles.flex}>
              <TextInput {...field} label="Кількість" accessibilityLabel="Кількість" value={form.quantity} onChangeText={(quantity) => set({ quantity })} keyboardType="number-pad" error={Boolean(show('quantity'))} />
              {show('quantity') ? <HelperText type="error">{show('quantity')}</HelperText> : null}
            </View>
            <View style={styles.flex}>
              <TextInput {...field} label="Забрати до" accessibilityLabel="Забрати до" value={form.pickupTo} onChangeText={(pickupTo) => set({ pickupTo })} keyboardType="numbers-and-punctuation" error={Boolean(show('pickupTo'))} />
              {show('pickupTo') ? <HelperText type="error">{show('pickupTo')}</HelperText> : null}
            </View>
          </View>
          <View>
            <TextInput {...field} label="Нова ціна, ₴" accessibilityLabel="Нова ціна, ₴" value={form.price} onChangeText={(price) => set({ price })} keyboardType="decimal-pad" error={Boolean(show('price'))} />
            {show('price') ? (
              <HelperText type="error">{show('price')}</HelperText>
            ) : lot.regular_price_minor ? (
              <HelperText type="info">
                {`Звичайна ціна ${formatPrice(lot.regular_price_minor)}${discount ? ` · знижка ${discount.replace('−', '')}` : ''}`.replace(/ /g, ' ')}
              </HelperText>
            ) : null}
          </View>
          <View style={{ gap: t.space.sm }}>
            <Text style={[t.type.titleSmall, { color: c.onSurface }]}>Алергени</Text>
            <View style={[styles.chips, { gap: t.space.sm }]}>
              {ALLERGENS.map((a) => {
                const on = form.allergens.includes(a);
                return (
                  <Pressable
                    key={a}
                    accessibilityRole="checkbox"
                    accessibilityLabel={ALLERGEN_LABEL[a]}
                    accessibilityState={{ checked: on }}
                    onPress={() => toggle(a)}
                    style={[styles.chip, { minHeight: 40, borderRadius: t.radius.sm, backgroundColor: on ? c.secondaryContainer : 'transparent', borderColor: on ? c.secondaryContainer : c.outline }]}
                  >
                    {on ? <Icon name="check" color={c.onSecondaryContainer} size={18} /> : null}
                    <Text style={[t.type.labelLarge, { color: on ? c.onSecondaryContainer : c.onSurfaceVariant }]}>{ALLERGEN_LABEL[a]}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={[styles.row, { padding: t.space.lg, gap: t.space.md }]}>
        <Button mode="outlined" onPress={() => save('save')} loading={busy === 'save'} disabled={Boolean(busy)} accessibilityLabel="Зберегти" style={[styles.flex, { borderRadius: t.radius.full }]} contentStyle={{ height: t.size.buttonHeight }} labelStyle={t.type.labelLarge}>
          Зберегти
        </Button>
        {lot.status === 'draft' ? (
          <Button mode="contained" onPress={() => save('publish')} loading={busy === 'publish'} disabled={Boolean(busy)} accessibilityLabel="Опублікувати" style={[styles.flex, { borderRadius: t.radius.full }]} contentStyle={{ height: t.size.buttonHeight }} labelStyle={t.type.labelLarge}>
            Опублікувати
          </Button>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  top: { alignItems: 'flex-start' },
  icon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  photo: { height: 168, overflow: 'hidden', padding: 12 },
  status: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingVertical: 4, paddingLeft: 8, paddingRight: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderWidth: 1 },
});
