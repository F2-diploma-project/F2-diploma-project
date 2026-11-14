import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, SegmentedButtons, TextInput } from 'react-native-paper';
import { useTheme, type ThemePreference } from '../theme';

const SWATCHES = ['primary', 'primaryContainer', 'secondaryContainer', 'tertiaryContainer', 'errorContainer', 'screen', 'card', 'surfaceVariant', 'onSurface'] as const;

/** Службова сторінка: показує токени теми й зразки компонентів для перевірки у світлій і темній темі. */
export function ThemeShowcase() {
  const t = useTheme();
  const c = t.colors;
  const s = styles(t);

  return (
    <SafeAreaView style={[s.flex, { backgroundColor: c.screen }]}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={[t.type.headlineMedium, { color: c.onSurface }]}>Тема</Text>
        <Text testID="active-scheme" style={[t.type.bodyMedium, { color: c.onSurfaceVariant }]}>
          {t.scheme === 'dark' ? 'Темна тема' : 'Світла тема'}
        </Text>

        <SegmentedButtons
          density="small"
          value={t.preference}
          onValueChange={(v) => t.setPreference(v as ThemePreference)}
          buttons={[
            { value: 'light', label: 'Світла', accessibilityLabel: 'Світла', showSelectedCheck: false, labelStyle: t.type.labelMedium },
            { value: 'dark', label: 'Темна', accessibilityLabel: 'Темна', showSelectedCheck: false, labelStyle: t.type.labelMedium },
            { value: 'system', label: 'Як у системі', accessibilityLabel: 'Як у системі', showSelectedCheck: false, labelStyle: t.type.labelMedium },
          ]}
        />

        <View style={s.card}>
          <Text style={[t.type.titleSmall, { color: c.onSurface }]}>Кольори</Text>
          <View style={s.swatches}>
            {SWATCHES.map((name) => (
              <View key={name} style={s.swatch}>
                <View style={[s.chip, { backgroundColor: c[name] }]} />
                <Text style={[t.type.labelSmall, { color: c.onSurfaceVariant }]}>{name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.card}>
          <Text style={[t.type.titleLarge, { color: c.onSurface }]}>Заголовок · Onest</Text>
          <Text style={[t.type.bodyLarge, { color: c.onSurfaceVariant }]}>Круасан з мигдалем, 3 шт. Забрати сьогодні до 21:00.</Text>
        </View>

        <View style={[s.card, s.lotRow]}>
          <View style={s.thumb} />
          <View style={s.flex}>
            <Text style={[t.type.titleMedium, { color: c.onSurface }]}>Круасан з мигдалем</Text>
            <Text style={[t.type.bodyMedium, { color: c.onSurfaceVariant }]}>3 шт · до 21:00</Text>
          </View>
          <View style={s.price}>
            <Text style={[t.type.titleLarge, { color: c.onSurface }]}>45 ₴</Text>
            <View style={s.priceRow}>
              <Text style={[t.type.bodySmall, s.oldPrice, { color: c.onSurfaceVariant }]}>95 ₴</Text>
              <View style={s.discount}>
                <Text style={[t.type.labelMedium, { color: c.onPrimaryContainer }]}>−53 %</Text>
              </View>
            </View>
          </View>
        </View>

        <TextInput mode="outlined" label="Назва" value="Круасан з мигдалем" outlineStyle={{ borderRadius: t.radius.md }} />

        <Button testID="cta" mode="contained" icon="camera-outline" style={s.cta} contentStyle={s.ctaContent} labelStyle={t.type.labelLarge}>
          Сфотографувати вітрину
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = (t: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    flex: { flex: 1 },
    content: { padding: t.space.lg, gap: t.space.md },
    card: { backgroundColor: t.colors.card, borderRadius: t.radius.card, padding: t.space.lg, gap: t.space.sm },
    swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: t.space.md },
    swatch: { width: 96, gap: t.space.xs },
    chip: { height: 40, borderRadius: t.radius.md, borderWidth: StyleSheet.hairlineWidth, borderColor: t.colors.outlineVariant },
    lotRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.md, padding: t.space.md },
    thumb: { width: t.size.thumb + 8, height: t.size.thumb + 8, borderRadius: t.radius.thumb, backgroundColor: t.colors.surfaceVariant },
    price: { alignItems: 'flex-end', gap: t.space.xs },
    priceRow: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
    oldPrice: { textDecorationLine: 'line-through' },
    discount: { backgroundColor: t.colors.primaryContainer, borderRadius: t.radius.full, paddingHorizontal: t.space.sm, paddingVertical: 2 },
    cta: { minHeight: t.size.buttonHeight, borderRadius: t.radius.full },
    ctaContent: { height: t.size.buttonHeight },
  });
