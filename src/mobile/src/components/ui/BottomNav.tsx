import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Icon, type IconName } from '../icons/Icon';

export interface NavItem {
  key: string;
  label: string;
  icon: IconName;
}

/** Висяча нижня навігація (варіант B): рівні пункти, активний залитий капсулою. */
export function BottomNav({ items, active, onPress }: { items: NavItem[]; active: string; onPress: (key: string) => void }) {
  const t = useTheme();
  const c = t.colors;
  const insets = useSafeAreaInsets();
  const width = items.length <= 3 ? 264 : 388;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, 12) + 12 }]}>
      <View accessibilityRole="tablist" style={[styles.bar, { width, maxWidth: '100%', backgroundColor: c.card, borderRadius: t.radius.full, padding: 6 }]}>
        {items.map((item) => {
          const on = item.key === active;
          const fg = on ? c.onPrimaryContainer : c.onSurfaceVariant;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityLabel={item.label}
              accessibilityState={{ selected: on }}
              onPress={() => onPress(item.key)}
              style={[styles.item, { minHeight: t.size.touchMin, borderRadius: t.radius.full, backgroundColor: on ? c.primaryContainer : 'transparent' }]}
            >
              <Icon name={item.icon} color={fg} />
              <Text numberOfLines={1} style={[t.type.labelSmall, { color: fg }]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    shadowColor: '#0A2826',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 2, gap: 2 },
});
