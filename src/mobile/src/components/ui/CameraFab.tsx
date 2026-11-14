import { Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { Icon } from '../icons/Icon';
import { SOFT_SHADOW } from './BottomNav';

/** Головна дія касира біля нижньої навігації: кругла кнопка камери без підпису («Кнопка камери» у Figma). */
export function CameraFab({ onPress }: { onPress: () => void }) {
  const t = useTheme();
  const c = t.colors;
  const size = t.size.navHeight;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Сфотографувати вітрину"
      onPress={onPress}
      style={({ pressed }) => [styles.fab, SOFT_SHADOW, { width: size, height: size, borderRadius: t.radius.full, backgroundColor: c.primary, opacity: pressed ? 0.88 : 1 }]}
    >
      <Icon name="photo_camera" color={c.onPrimary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: { alignItems: 'center', justifyContent: 'center' },
});
