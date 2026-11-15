import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../components/icons/Icon';
import { TopBar } from '../../components/ui';
import { useTheme } from '../../theme';

const SECTIONS: { title: string; icon: IconName; lines: string[] }[] = [
  {
    title: 'Як опублікувати лоти',
    icon: 'sell',
    lines: [
      '1. На «Лотах» натисніть кнопку камери й сфотографуйте вітрину.',
      '2. У «Знайдено на фото» перевірте позиції: де «Не впевнені» — виправте назву й кількість.',
      '3. Натисніть «Опублікувати всі» — лоти з’являться в застосунку покупців.',
    ],
  },
  {
    title: 'Як видати замовлення',
    icon: 'qr_code_scanner',
    lines: [
      '1. Відкрийте «Видачу» й наведіть камеру на QR-код у телефоні покупця.',
      '2. Якщо QR не сканується — «Ввести код вручну»: 6 символів під QR-кодом.',
      '3. Перевірте лот і кількість і натисніть «Видати замовлення».',
    ],
  },
  {
    title: 'Якщо щось пішло не так',
    icon: 'help',
    lines: [
      '«Код не знайдено» — покупець показує код іншого закладу.',
      '«Час видачі минув» — перевірте, чи замовлення ще є, і видайте свідомо.',
      '«Немає зв’язку» — перевірте інтернет і спробуйте ще раз.',
    ],
  },
];

/** Коротка допомога касиру — тексти з наявних екранів. */
export function HelpScreen({ onBack }: { onBack: () => void }) {
  const t = useTheme();
  const c = t.colors;
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.screen }]}>
      <TopBar title="Допомога" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.space.lg, paddingTop: t.space.sm, paddingBottom: t.space.xl, gap: t.space.md }}>
        {SECTIONS.map((s) => (
          <View key={s.title} style={{ backgroundColor: c.card, borderRadius: t.radius.card, padding: t.space.lg, gap: t.space.md }}>
            <View style={[styles.row, { gap: t.space.md }]}>
              <View style={[styles.plate, { backgroundColor: c.primaryContainer, borderRadius: t.radius.md - 2 }]}>
                <Icon name={s.icon} color={c.primary} size={20} />
              </View>
              <Text style={[t.type.titleMedium, styles.flex, { color: c.onSurface }]}>{s.title}</Text>
            </View>
            <View style={{ gap: t.space.sm }}>
              {s.lines.map((l) => (
                <Text key={l} style={[t.type.bodyMedium, { color: c.onSurface }]}>{l}</Text>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  plate: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
});
