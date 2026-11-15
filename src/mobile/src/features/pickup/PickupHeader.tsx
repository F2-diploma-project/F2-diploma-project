import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '../../components/icons/Icon';
import { useTheme } from '../../theme';

/** Шапка екранів видачі: кнопка «Закрити» / «Назад» і заголовок. */
export function PickupHeader({ title, icon, label, onPress }: { title: string; icon: IconName; label: string; onPress: () => void }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={[styles.row, { paddingHorizontal: t.space.sm, paddingVertical: t.space.sm, gap: t.space.xs }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={4} style={[styles.icon, { width: t.size.touchMin, height: t.size.touchMin }]}>
        <Icon name={icon} color={c.onSurface} />
      </Pressable>
      <Text accessibilityRole="header" style={[t.type.titleLarge, styles.title, { color: c.onSurface }]}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  icon: { alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1 },
});
