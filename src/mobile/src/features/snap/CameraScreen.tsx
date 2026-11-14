import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../components/icons/Icon';
import { checkImage, IMAGE_PROBLEM_TEXT, type PickedImage } from '../../data/recognition';
import { useTheme } from '../../theme';

const SAMPLE_SHOWCASE: number = require('../../../assets/photos/croissant_b.jpg');

function RoundButton({ icon, label, onPress, color }: { icon: IconName; label: string; onPress: () => void; color: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} hitSlop={8} style={styles.round}>
      <Icon name={icon} color={color} />
    </Pressable>
  );
}

/** Екран камери Snap & Sell: знімок вітрини або фото з галереї (з перевіркою типу й розміру). */
export function CameraScreen({ onPhoto, onClose }: { onPhoto: (image: PickedImage) => void; onClose: () => void }) {
  const t = useTheme();
  const c = t.colors;
  const camera = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const accept = (image: PickedImage) => {
    const issue = checkImage(image);
    if (issue) {
      setProblem(IMAGE_PROBLEM_TEXT[issue]);
      return;
    }
    setProblem(null);
    onPhoto(image);
  };

  const shoot = async () => {
    if (!camera.current || busy) return;
    setBusy(true);
    try {
      const shot = await camera.current.takePictureAsync({ quality: 0.7 });
      // Камера застосунку завжди дає JPEG.
      if (shot) accept({ uri: shot.uri, mimeType: 'image/jpeg', fileSize: null });
    } finally {
      setBusy(false);
    }
  };

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled || !result.assets?.length) return;
    const a = result.assets[0];
    accept({ uri: a.uri, mimeType: a.mimeType ?? null, fileSize: a.fileSize ?? null });
  };

  const granted = Boolean(permission?.granted);

  return (
    <View style={[styles.flex, { backgroundColor: c.cameraBg }]}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top']} style={styles.top}>
        <RoundButton icon="close" label="Закрити камеру" onPress={onClose} color={c.cameraOnBg} />
        <Text style={[t.type.titleLarge, styles.title, { color: c.cameraOnBg }]}>Фото вітрини</Text>
        {granted ? <RoundButton icon={torch ? 'flash_off' : 'flash_on'} label={torch ? 'Вимкнути спалах' : 'Увімкнути спалах'} onPress={() => setTorch((v) => !v)} color={c.cameraOnBg} /> : <View style={styles.round} />}
      </SafeAreaView>

      <View style={[styles.viewfinder, { paddingHorizontal: t.space.xl, gap: t.space.lg }]}>
        {granted ? (
          <>
            <CameraView ref={camera} style={StyleSheet.absoluteFill} facing="back" enableTorch={torch} />
            <View style={[styles.tag, { backgroundColor: c.cameraOnBg, borderRadius: t.radius.full }]}>
              <Icon name="bolt" color={c.primary} size={18} />
              <Text style={[t.type.labelLarge, { color: c.cameraBg }]}>Snap & Sell · фото вітрини</Text>
            </View>
            <Text style={[t.type.bodyLarge, styles.center, { color: c.cameraOnBg }]}>Наведіть камеру на вітрину або тацю так, щоб було видно всі позиції</Text>
          </>
        ) : (
          <>
            <Icon name="no_photography" color={c.cameraOnBg} size={40} />
            <Text accessibilityRole="header" style={[t.type.titleLarge, styles.center, { color: c.cameraOnBg }]}>Немає доступу до камери</Text>
            <Text style={[t.type.bodyMedium, styles.center, { color: c.cameraOnBg }]}>Дозвольте застосунку користуватися камерою або виберіть готове фото з галереї.</Text>
            <Button mode="contained-tonal" onPress={() => (permission?.canAskAgain ? requestPermission() : Linking.openSettings())} labelStyle={t.type.labelLarge}>
              {permission?.canAskAgain ? 'Дозволити камеру' : 'Відкрити налаштування'}
            </Button>
          </>
        )}
        {__DEV__ ? (
          // Лише в режимі розробки: дає перевірити потік без камери (веб-перегляд, симулятор).
          <Button mode="text" textColor={c.cameraOnBg} onPress={() => accept({ uri: SAMPLE_SHOWCASE, mimeType: 'image/jpeg', fileSize: null })}>
            Тестове фото вітрини (розробка)
          </Button>
        ) : null}
        {problem ? (
          <View accessibilityRole="alert" style={[styles.problem, { backgroundColor: c.errorContainer, borderRadius: t.radius.lg }]}>
            <Icon name="error" color={c.onErrorContainer} size={20} />
            <Text style={[t.type.bodyMedium, styles.flexText, { color: c.onErrorContainer }]}>{problem}</Text>
          </View>
        ) : null}
      </View>

      <SafeAreaView edges={['bottom']} style={[styles.bottom, { paddingHorizontal: t.space['2xl'] }]}>
        <RoundButton icon="photo_library" label="Вибрати з галереї" onPress={pick} color={c.cameraOnBg} />
        {granted ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Зробити знімок" accessibilityState={{ busy }} onPress={shoot} style={[styles.shutter, { borderColor: c.cameraOnBg }]}>
            <View style={[styles.shutterInner, { backgroundColor: c.cameraOnBg, opacity: busy ? 0.5 : 1 }]} />
          </Pressable>
        ) : (
          <View style={styles.shutterSpace} />
        )}
        <View style={styles.round} />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexText: { flex: 1 },
  top: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 8, zIndex: 1 },
  title: { flex: 1 },
  round: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  viewfinder: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingLeft: 10, paddingRight: 14 },
  center: { textAlign: 'center' },
  problem: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, alignSelf: 'stretch' },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 20, paddingBottom: 24 },
  shutter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  shutterInner: { width: 60, height: 60, borderRadius: 30 },
  shutterSpace: { width: 76, height: 76 },
});
