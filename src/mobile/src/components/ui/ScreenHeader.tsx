import { StyleSheet, Text, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useTheme } from '../../theme';
import { Icon, type IconName } from '../icons/Icon';

/** Шапка екрана зі списком: заголовок і кругла тональна кнопка в одному рядку. */
export function ScreenHeader({ title, action }: { title: string; action?: { icon: IconName; label: string; onPress: () => void } }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <View style={[styles.row, { paddingHorizontal: t.space.lg, paddingTop: 20, paddingBottom: t.space.lg }]}>
      <Text accessibilityRole="header" style={[t.type.headlineMedium, styles.title, { color: c.onSurface }]}>{title}</Text>
      {action ? (
        <IconButton
          mode="contained-tonal"
          size={24}
          accessibilityLabel={action.label}
          onPress={action.onPress}
          icon={({ color }) => <Icon name={action.icon} color={color} />}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { flex: 1 },
  button: { margin: 0, width: 48, height: 48 },
});
