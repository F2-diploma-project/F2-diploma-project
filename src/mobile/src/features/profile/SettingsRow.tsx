import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon, type IconName } from '../../components/icons/Icon';
import { useTheme } from '../../theme';

/** Рядок налаштувань (Figma «Профіль» / «Налаштування»): плашка іконки, назва, підпис і праворуч шеврон або перемикач. */
export function SettingsRow({ icon, title, subtitle, onPress, trailing, tone = 'primary' }: { icon: IconName; title: string; subtitle?: string; onPress?: () => void; trailing?: ReactNode; tone?: 'primary' | 'error' }) {
  const t = useTheme();
  const c = t.colors;
  const plate = tone === 'error' ? c.errorContainer : c.primaryContainer;
  const fg = tone === 'error' ? c.error : c.onSurface;
  const body = (
    <>
      <View style={[styles.plate, { backgroundColor: plate, borderRadius: t.radius.md - 2 }]}>
        <Icon name={icon} color={tone === 'error' ? c.error : c.primary} size={20} />
      </View>
      <View style={styles.text}>
        <Text style={[t.type.bodyLarge, { color: fg }]}>{title}</Text>
        {subtitle ? <Text style={[t.type.bodySmall, { color: c.onSurfaceVariant }]}>{subtitle}</Text> : null}
      </View>
      {trailing ?? (onPress && tone !== 'error' ? <Icon name="chevron_right" color={c.onSurfaceVariant} /> : null)}
    </>
  );
  const style = [styles.row, { paddingHorizontal: t.space.lg, paddingVertical: t.space.md, gap: t.space.md, minHeight: t.size.touchMin + t.space.md }];
  if (!onPress) return <View style={style}>{body}</View>;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title} onPress={onPress} style={({ pressed }) => [...style, { opacity: pressed ? 0.7 : 1 }]}>
      {body}
    </Pressable>
  );
}

/** Розділювач між рядками з відступом під плашку (64). */
export function SettingsDivider() {
  const t = useTheme();
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: t.colors.outlineVariant, marginLeft: t.space.lg * 4 }} />;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  plate: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
