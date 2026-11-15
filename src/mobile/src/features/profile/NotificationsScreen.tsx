import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TopBar } from '../../components/ui';
import { DEFAULT_NOTIFICATIONS, loadNotificationPrefs, saveNotificationPrefs, type NotificationPrefs } from '../../data/settings';
import { useTheme } from '../../theme';
import { SettingsDivider, SettingsRow } from './SettingsRow';

const ROWS: { key: keyof NotificationPrefs; title: string; subtitle: string; icon: 'shopping_bag' | 'photo_camera' }[] = [
  { key: 'orders', title: 'Нові замовлення', subtitle: 'Звук і сповіщення, коли покупець оплатив лот', icon: 'shopping_bag' },
  { key: 'drafts', title: 'Готові чернетки з фото', subtitle: 'Коли розпізнавання вітрини завершилось', icon: 'photo_camera' },
];

/** Налаштування сповіщень (лише вибір; самі пуш-сповіщення з'являться разом із бекендом). */
export function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const t = useTheme();
  const c = t.colors;
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_NOTIFICATIONS);

  useEffect(() => {
    let alive = true;
    loadNotificationPrefs().then((p) => alive && setPrefs(p));
    return () => {
      alive = false;
    };
  }, []);

  const toggle = (key: keyof NotificationPrefs) => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    void saveNotificationPrefs(next);
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.screen }]}>
      <TopBar title="Сповіщення" onBack={onBack} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.space.lg, paddingTop: t.space.sm, gap: t.space.md }}>
        <View style={{ backgroundColor: c.card, borderRadius: t.radius.card, paddingVertical: t.space.xs }}>
          {ROWS.map((r, i) => (
            <View key={r.key}>
              {i > 0 ? <SettingsDivider /> : null}
              <SettingsRow
                icon={r.icon}
                title={r.title}
                subtitle={r.subtitle}
                trailing={<Switch value={prefs[r.key]} onValueChange={() => toggle(r.key)} color={c.primary} accessibilityLabel={`${r.title}, ${r.subtitle}`} />}
              />
            </View>
          ))}
        </View>
        <Text style={[t.type.bodySmall, { color: c.onSurfaceVariant }]}>
          Сповіщення приходять лише на цей телефон. Вимкнути їх повністю можна в налаштуваннях телефона.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
