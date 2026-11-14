import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import type { IconName } from '../icons/Icon';
import { IconChip } from './IconChip';

export type BannerKind = 'info' | 'ok' | 'warn' | 'error';

/** Банер: інформація — біла картка з обведенням; успіх, попередження, помилка — кольорові плашки. Поля 12 з усіх боків. */
export function Banner({ kind, icon, text }: { kind: BannerKind; icon: IconName; text: string }) {
  const t = useTheme();
  const c = t.colors;
  const look = {
    info: { bg: c.card, fg: c.onSurfaceVariant, icon: c.primary, plate: c.primaryContainer },
    ok: { bg: c.primaryContainer, fg: c.onPrimaryContainer, icon: c.primary, plate: c.iconPlate },
    warn: { bg: c.tertiaryContainer, fg: c.onTertiaryContainer, icon: c.tertiary, plate: c.iconPlate },
    error: { bg: c.errorContainer, fg: c.onErrorContainer, icon: c.error, plate: c.iconPlate },
  }[kind];
  return (
    <View
      testID="banner"
      accessibilityRole={kind === 'error' ? 'alert' : undefined}
      style={[styles.box, { backgroundColor: look.bg, borderRadius: t.radius.lg, padding: t.space.md, gap: t.space.md }, kind === 'info' && { borderWidth: 1, borderColor: c.outlineVariant }]}
    >
      <IconChip icon={icon} color={look.icon} background={look.plate} />
      <Text style={[t.type.bodyMedium, styles.text, { color: look.fg }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', alignItems: 'center' },
  text: { flex: 1 },
});
