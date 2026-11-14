import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';

export interface SegmentItem<T extends string> {
  value: T;
  label: string;
}

/** Вкладки-перемикач (компонент «Вкладки» у Figma): капсула, активна вкладка — біла з бірюзовим текстом. */
export function SegmentTabs<T extends string>({ items, value, onChange }: { items: SegmentItem<T>[]; value: T; onChange: (value: T) => void }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View accessibilityRole="tablist" style={[styles.track, { backgroundColor: c.surfaceVariant, borderRadius: t.radius.full, padding: t.space.xs }]}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item.value)}
            style={[styles.item, { borderRadius: t.radius.full, backgroundColor: active ? c.card : 'transparent', minHeight: 44 }]}
          >
            <Text numberOfLines={1} style={[t.type.titleSmall, { color: active ? c.primary : c.onSurfaceVariant }]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
});
