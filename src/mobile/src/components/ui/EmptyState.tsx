import { Image, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { useTheme } from '../../theme';
import { Icon, type IconName } from '../icons/Icon';

const PHOTOS = [require('../../../assets/photos/croissant_b.jpg'), require('../../../assets/photos/coffee.jpg')];

/** Порожній стан з ілюстрацією: коло з іконкою між двома фото страв. */
export function EmptyState({ icon, title, text, actionLabel, onAction, tone = 'primary' }: { icon: IconName; title: string; text: string; actionLabel?: string; onAction?: () => void; tone?: 'primary' | 'error' }) {
  const t = useTheme();
  const c = t.colors;
  const circleBg = tone === 'error' ? c.errorContainer : c.primaryContainer;
  const circleFg = tone === 'error' ? c.onErrorContainer : c.onPrimaryContainer;
  return (
    <View style={[styles.wrap, { gap: t.space.md, paddingHorizontal: t.space['2xl'] }]}>
      <View style={styles.art} aria-hidden>
        <Image source={PHOTOS[0]} style={[styles.photo, styles.left, { borderColor: c.card, borderRadius: 18 }]} />
        <Image source={PHOTOS[1]} style={[styles.photo, styles.right, { borderColor: c.card, borderRadius: 18 }]} />
        <View style={[styles.circle, { backgroundColor: circleBg, borderColor: c.card }]}>
          <Icon name={icon} color={circleFg} size={32} />
        </View>
      </View>
      <Text accessibilityRole="header" style={[t.type.titleLarge, styles.center, { color: c.onSurface }]}>{title}</Text>
      <Text style={[t.type.bodyMedium, styles.center, { color: c.onSurfaceVariant }]}>{text}</Text>
      {actionLabel && onAction ? (
        <Button mode="contained-tonal" icon="refresh" onPress={onAction} accessibilityLabel={actionLabel} labelStyle={t.type.labelLarge}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  art: { width: 176, height: 96, marginBottom: 8 },
  photo: { position: 'absolute', width: 64, height: 64, top: 18, borderWidth: 3 },
  left: { left: 0, transform: [{ rotate: '-8deg' }] },
  right: { right: 0, transform: [{ rotate: '8deg' }] },
  circle: { position: 'absolute', left: 52, top: 12, width: 72, height: 72, borderRadius: 36, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center' },
});
