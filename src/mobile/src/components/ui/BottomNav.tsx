import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { Icon, type IconName } from '../icons/Icon';

export interface NavItem {
  key: string;
  label: string;
  icon: IconName;
}

/** Відступ навігації від низу екрана: безпечна зона (або 12) + 12. */
function useNavBottom() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom, 12) + 12;
}

/** Скільки місця знизу займає навігація разом із проміжком 12 над нею — для головної дії над навігацією. */
export function useBottomNavInset() {
  const t = useTheme();
  return useNavBottom() + t.size.navHeight + t.space.md;
}

/** Тінь «F2/Тінь м’яка» (y 8, розмиття 28, 8 %) — навігація й кнопка біля неї. */
export const SOFT_SHADOW = {
  shadowColor: '#0A2826',
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
} as const;

/** Висяча нижня навігація (варіант B): рівні пункти, активний залитий капсулою; `accessory` — кнопка праворуч у тому ж ряду. */
export function BottomNav({ items, active, onPress, accessory }: { items: NavItem[]; active: string; onPress: (key: string) => void; accessory?: ReactNode }) {
  const t = useTheme();
  const c = t.colors;
  const bottom = useNavBottom();
  const width = items.length <= 3 ? 264 : 388;
  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <View testID="bottom-nav-row" pointerEvents="box-none" style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.sm }}>
      <View accessibilityRole="tablist" style={[styles.bar, SOFT_SHADOW, { width, maxWidth: '100%', backgroundColor: c.card, borderRadius: t.radius.full, padding: 6 }]}>
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
      {accessory}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 12, right: 12, alignItems: 'center' },
  bar: { flexDirection: 'row' },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, paddingHorizontal: 2, gap: 2 },
});
