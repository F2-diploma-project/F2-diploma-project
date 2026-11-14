import { Image, StyleSheet, Text, View } from 'react-native';
import { formatDiscount, formatPrice, isLowStock, lotSubtitle } from '../../data/format';
import type { StaffLot } from '../../data/types';
import { useTheme } from '../../theme';
import { Icon } from '../icons/Icon';

/** Картка лота: фото, назва, залишок, ціна зі старою ціною й знижкою (компонент «Лот / рядок» у Figma). */
export function LotCard({ lot }: { lot: StaffLot }) {
  const t = useTheme();
  const c = t.colors;
  const price = formatPrice(lot.base_price_minor);
  const old = lot.regular_price_minor ? formatPrice(lot.regular_price_minor) : null;
  const discount = formatDiscount(lot.base_price_minor, lot.regular_price_minor);
  const low = isLowStock(lot);
  const subtitle = lotSubtitle(lot);
  const label = [lot.name, old ? `${price} замість ${old}` : price, subtitle].join(', ').replace(/ /g, ' ');

  return (
    <View accessible accessibilityLabel={label} style={[styles.card, { backgroundColor: c.card, borderRadius: t.radius.card, padding: t.space.md, gap: t.space.md }]}>
      <View style={[styles.thumb, { borderRadius: t.radius.thumb, backgroundColor: c.surfaceVariant }]}>
        {lot.photo ? <Image source={lot.photo} style={styles.photo} /> : <Icon name="image" color={c.outline} />}
      </View>
      <View style={styles.text}>
        <Text style={[t.type.titleMedium, { color: c.onSurface }]} numberOfLines={2}>{lot.name}</Text>
        {low ? (
          <View testID="low-stock" style={[styles.pill, { backgroundColor: c.errorContainer, borderRadius: t.radius.full, gap: t.space.xs }]}>
            <Icon name="timer" color={c.onErrorContainer} size={14} />
            <Text style={[t.type.labelMedium, { color: c.onErrorContainer }]}>{subtitle}</Text>
          </View>
        ) : (
          <Text style={[t.type.bodyMedium, { color: c.onSurfaceVariant }]}>{subtitle}</Text>
        )}
      </View>
      <View style={[styles.price, { gap: t.space.xs }]}>
        <Text style={[t.type.titleLarge, { color: c.onSurface }]}>{price}</Text>
        {old && discount ? (
          <View style={[styles.row, { gap: t.space.sm - 2 }]}>
            <Text style={[t.type.bodySmall, styles.strike, { color: c.onSurfaceVariant }]}>{old}</Text>
            <View style={[styles.discount, { backgroundColor: c.primaryContainer, borderRadius: t.radius.full }]}>
              <Text style={[t.type.labelMedium, { color: c.onPrimaryContainer }]}>{discount}</Text>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center' },
  thumb: { width: 64, height: 64, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  photo: { width: '100%', height: '100%' },
  text: { flex: 1, gap: 4, alignItems: 'flex-start' },
  pill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2, paddingLeft: 6, paddingRight: 8 },
  price: { alignItems: 'flex-end' },
  row: { flexDirection: 'row', alignItems: 'center' },
  strike: { textDecorationLine: 'line-through' },
  discount: { paddingHorizontal: 8, paddingVertical: 2 },
});
