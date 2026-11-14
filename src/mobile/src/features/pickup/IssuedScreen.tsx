import { StyleSheet, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/icons/Icon';
import { EmptyState } from '../../components/ui';
import { formatTime } from '../../data/format';
import type { Redemption } from '../../data/pickup';
import { useTheme } from '../../theme';
import { PickupHeader } from './PickupHeader';

/** Результат видачі; «Сканувати наступне» повертає до сканера. */
export function IssuedScreen({ redemption, onNext }: { redemption: Redemption; onNext: () => void }) {
  const t = useTheme();
  const c = t.colors;
  const late = redemption.late ? ' після терміну' : '';
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.screen }]}>
      <PickupHeader title="Замовлення" icon="close" label="Закрити" onPress={onNext} />
      <View style={[styles.center, { paddingHorizontal: t.space.lg }]}>
        <EmptyState
          icon="check_circle"
          title="Видано"
          text={`Замовлення ${redemption.confirmation_code} видано о ${formatTime(redemption.redeemed_at)}${late}. Запис додано в журнал.`}
        />
      </View>
      <View style={{ padding: t.space.lg }}>
        <Button
          mode="contained"
          onPress={onNext}
          icon={({ color }) => <Icon name="qr_code_scanner" color={color} size={20} />}
          style={{ borderRadius: t.radius.full }}
          contentStyle={{ height: t.size.buttonHeight }}
          labelStyle={t.type.labelLarge}
        >
          Сканувати наступне
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
