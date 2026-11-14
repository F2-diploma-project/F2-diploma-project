import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { IconChip } from './IconChip';

/** Світле сповіщення (замість темного снекбару): плашка з іконкою, текст і дія. */
export function Toast({ text, actionLabel, onAction }: { text: string; actionLabel?: string; onAction?: () => void }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={[styles.box, { backgroundColor: c.card, borderRadius: t.radius.card, gap: t.space.md }]}>
      <IconChip icon="check_circle" color={c.primary} background={c.primaryContainer} radius={10} />
      <Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={[t.type.bodyLarge, styles.text, { color: c.onSurface }]}>{text}</Text>
      {actionLabel && onAction ? (
        <Pressable accessibilityRole="button" accessibilityLabel={actionLabel} onPress={onAction} style={[styles.action, { minHeight: t.size.touchMin, borderRadius: t.radius.full }]}>
          <Text style={[t.type.labelLarge, { color: c.primary }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 8,
    shadowColor: '#0A2826',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  text: { flex: 1 },
  action: { justifyContent: 'center', paddingHorizontal: 12 },
});
