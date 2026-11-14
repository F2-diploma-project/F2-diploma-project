import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { IconName } from '../components/icons/Icon';
import { EmptyState, ScreenHeader } from '../components/ui';
import { useTheme } from '../theme';

/** Тимчасовий екран для розділів, які ще не зроблено (видача, профіль). */
export function InProgressScreen({ title, icon }: { title: string; icon: IconName }) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: colors.screen }]}>
      <ScreenHeader title={title} />
      <View style={styles.center}>
        <EmptyState icon={icon} title="Екран у розробці" text="Цей розділ зʼявиться в наступних кроках." />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 }, center: { flex: 1, justifyContent: 'center', paddingBottom: 120 } });
