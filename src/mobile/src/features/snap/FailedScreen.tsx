import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/icons/Icon';
import { EmptyState, TopBar } from '../../components/ui';
import { useTheme } from '../../theme';

/** Пояснення для кодів `error_code` завдання розпізнавання (`docs/api/openapi.yaml`). */
export const FAILURE_TEXT: Record<string, string> = {
  EMPTY_RESULT: 'На фото не видно позицій. Зробіть знімок ближче й при кращому світлі або додайте лот вручну.',
  IMAGE_CORRUPT: 'Фото пошкоджене. Зробіть новий знімок.',
  IMAGE_MISSING: 'Фото не дійшло до сервера. Зробіть новий знімок.',
  VISION_REJECTED: 'Сервіс розпізнавання не зміг обробити це фото. Спробуйте інший ракурс.',
  NETWORK: 'Немає звʼязку. Перевірте інтернет і спробуйте ще раз.',
};
const DEFAULT_TEXT = 'Не вдалося розпізнати фото. Спробуйте ще раз або додайте лот вручну.';

export function FailedScreen({ code, onRetry, onManual, onClose }: { code: string; onRetry: () => void; onManual: () => void; onClose: () => void }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.surface }]}>
      <TopBar title="Фото вітрини" onClose={onClose} />
      <View style={styles.center}>
        <EmptyState icon="no_photography" tone="error" title="Не вдалося розпізнати" text={FAILURE_TEXT[code] ?? DEFAULT_TEXT} />
      </View>
      <View style={{ padding: t.space.lg, gap: t.space.md }}>
        <Button mode="contained" onPress={onRetry} icon={({ color }) => <Icon name="photo_camera" color={color} size={20} />} style={{ borderRadius: t.radius.full }} contentStyle={{ height: t.size.buttonHeight }} labelStyle={t.type.labelLarge}>
          Сфотографувати ще раз
        </Button>
        <Button mode="outlined" onPress={onManual} icon={({ color }) => <Icon name="add" color={color} size={20} />} style={{ borderRadius: t.radius.full }} contentStyle={{ height: t.size.buttonHeight }} labelStyle={t.type.labelLarge}>
          Додати лот вручну
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center' },
});
