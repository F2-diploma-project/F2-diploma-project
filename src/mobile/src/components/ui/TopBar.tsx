import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../icons/Icon';

/**
 * Шапка екранів, що відкриваються поверх (рішення Марії, 2026-11-15):
 * стрілка «Назад» (крок назад у потоці) — ліворуч, хрестик «Закрити» (вийти з потоку) — праворуч.
 */
export function TopBar({ title, onBack, onClose }: { title: string; onBack?: () => void; onClose?: () => void }) {
  const t = useTheme();
  const c = t.colors;
  const button = (icon: 'arrow_back' | 'close', label: string, onPress: () => void) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4} style={[styles.icon, { width: t.size.touchMin, height: t.size.touchMin }]}>
      <Icon name={icon} color={c.onSurface} />
    </Pressable>
  );
  return (
    <View testID="top-bar" style={[styles.row, { paddingVertical: t.space.sm, paddingLeft: onBack ? t.space.sm : t.space.lg, paddingRight: t.space.sm, gap: t.space.xs }]}>
      {onBack ? button('arrow_back', 'Назад', onBack) : null}
      <Text accessibilityRole="header" style={[t.type.titleLarge, styles.title, { color: c.onSurface }]}>{title}</Text>
      {onClose ? button('close', 'Закрити', onClose) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 64 },
  icon: { alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1 },
});
