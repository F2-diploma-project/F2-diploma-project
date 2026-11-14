import { CameraView, useCameraPermissions } from 'expo-camera';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/icons/Icon';
import { useBottomNavInset } from '../../components/ui/BottomNav';
import { EmptyState } from '../../components/ui';
import type { PickupRef } from '../../data/pickup';
import { useTheme } from '../../theme';

/** Вміст QR-коду замовлення — токен base64url від 256 біт (`QrToken` в API). */
const QR_TOKEN = /^[A-Za-z0-9_-]{43}$/;
const NOT_ORDER_QR = 'Це не QR-код замовлення. Попросіть покупця відкрити замовлення в застосунку.';

interface Props {
  /** Екран видно (вкладка активна): лише тоді вмикаємо камеру. */
  active: boolean;
  onScanned: (ref: PickupRef) => void;
  onManual: () => void;
  /** Лише режим розробки: тестовий QR для перевірки без камери (веб-перегляд, симулятор). */
  devToken?: string;
}

/** Вкладка «Видача»: сканер QR-коду замовлення або перехід до введення коду вручну. */
export function ScannerScreen({ active, onScanned, onManual, devToken }: Props) {
  const t = useTheme();
  const c = t.colors;
  const bottomInset = useBottomNavInset();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  // Камера повідомляє про той самий код багато разів на секунду — передаємо лише перший.
  const handled = useRef(false);

  const handle = (data: string) => {
    if (handled.current) return;
    if (!QR_TOKEN.test(data)) {
      setHint(NOT_ORDER_QR);
      return;
    }
    handled.current = true;
    setHint(null);
    onScanned({ token: data });
    // Після повернення на вкладку можна сканувати наступне замовлення.
    setTimeout(() => {
      handled.current = false;
    }, 1500);
  };

  const manualButton = (mode: 'contained-tonal' | 'outlined') => (
    <Button
      mode={mode}
      onPress={onManual}
      icon={({ color }) => <Icon name="keyboard" color={color} size={20} />}
      style={{ borderRadius: t.radius.full }}
      contentStyle={{ height: t.size.buttonHeight }}
      labelStyle={t.type.labelLarge}
    >
      Ввести код вручну
    </Button>
  );

  const devButton = (color: string) =>
    __DEV__ && devToken ? (
      <Button mode="text" textColor={color} onPress={() => handle(devToken)}>
        Тестовий QR (розробка)
      </Button>
    ) : null;

  if (!permission?.granted) {
    return (
      <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: c.screen }]}>
        <Text accessibilityRole="header" style={[t.type.headlineMedium, { color: c.onSurface, paddingHorizontal: t.space.lg, paddingTop: t.space.lg }]}>Видача</Text>
        <View style={[styles.center, { paddingHorizontal: t.space.lg }]}>
          <EmptyState icon="no_photography" title="Немає доступу до камери" text="Щоб сканувати QR-коди, дозвольте застосунку користуватися камерою в налаштуваннях телефона." />
          {devButton(c.primary)}
        </View>
        <View style={{ paddingHorizontal: t.space.lg, paddingBottom: bottomInset, gap: t.space.md }}>
          <Button
            mode="contained"
            onPress={() => (permission?.canAskAgain ? requestPermission() : Linking.openSettings())}
            style={{ borderRadius: t.radius.full }}
            contentStyle={{ height: t.size.buttonHeight }}
            labelStyle={t.type.labelLarge}
          >
            {permission?.canAskAgain ? 'Дозволити камеру' : 'Відкрити налаштування'}
          </Button>
          {manualButton('outlined')}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.flex, { backgroundColor: c.cameraBg }]}>
      {active ? <StatusBar style="light" /> : null}
      {active ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => handle(data)}
        />
      ) : null}
      <SafeAreaView edges={['top']} style={[styles.top, { paddingHorizontal: t.space.lg, paddingTop: t.space.sm }]}>
        <Text accessibilityRole="header" style={[t.type.headlineMedium, styles.flex, { color: c.cameraOnBg }]}>Видача</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={torch ? 'Вимкнути ліхтарик' : 'Увімкнути ліхтарик'}
          onPress={() => setTorch((v) => !v)}
          style={[styles.round, { width: t.size.touchMin, height: t.size.touchMin }]}
        >
          <Icon name={torch ? 'flash_off' : 'flash_on'} color={c.cameraOnBg} />
        </Pressable>
      </SafeAreaView>

      <View style={[styles.center, { gap: t.space.lg, paddingHorizontal: t.space.xl }]}>
        <View style={[styles.tag, { backgroundColor: c.cameraOnBg, borderRadius: t.radius.full, gap: t.space.xs }]}>
          <Icon name="qr_code_scanner" color={c.primary} size={18} />
          <Text style={[t.type.labelLarge, { color: c.cameraBg }]}>Видача замовлень</Text>
        </View>
        <View testID="scanner-frame" style={styles.frame}>
          {(['tl', 'tr', 'bl', 'br'] as const).map((k) => (
            <View key={k} style={[styles.corner, styles[k], { borderColor: c.cameraOnBg, [RADIUS_KEY[k]]: t.radius.lg }]} />
          ))}
        </View>
        <Text style={[t.type.bodyLarge, styles.text, { color: c.cameraOnBg }]}>Наведіть камеру на QR-код замовлення в телефоні покупця</Text>
        {hint ? (
          <View accessibilityRole="alert" style={[styles.hint, { backgroundColor: c.errorContainer, borderRadius: t.radius.lg, gap: t.space.sm, padding: t.space.md }]}>
            <Icon name="error" color={c.onErrorContainer} size={20} />
            <Text style={[t.type.bodyMedium, styles.flex, { color: c.onErrorContainer }]}>{hint}</Text>
          </View>
        ) : null}
        {devButton(c.cameraOnBg)}
      </View>

      <View style={{ paddingHorizontal: t.space.lg, paddingBottom: bottomInset }}>{manualButton('contained-tonal')}</View>
    </View>
  );
}

const CORNER = 36;
const RADIUS_KEY = { tl: 'borderTopLeftRadius', tr: 'borderTopRightRadius', bl: 'borderBottomLeftRadius', br: 'borderBottomRightRadius' } as const;
const styles = StyleSheet.create({
  flex: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center' },
  round: { alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tag: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingLeft: 10, paddingRight: 14 },
  frame: { width: 260, height: 260 },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderWidth: 0 },
  tl: { top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4 },
  tr: { top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4 },
  br: { bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4 },
  text: { textAlign: 'center' },
  hint: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
});
