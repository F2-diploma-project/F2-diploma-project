import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, ProgressBar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, type IconName } from '../../components/icons/Icon';
import { TopBar } from '../../components/ui';
import { imageSource } from '../../data/format';
import { isFinished, type RecognitionErrorCode, type RecognitionJobStatus, type RecognitionService } from '../../data/recognition';
import { useTheme } from '../../theme';

type Step = { icon: IconName; label: string; state: 'done' | 'now' | 'next' };

const stepsFor = (status: RecognitionJobStatus | 'uploading'): Step[] => {
  const order = status === 'uploading' || status === 'queued' ? 0 : status === 'processing' ? 1 : 2;
  const labels: [IconName, string][] = [['check_circle', 'Фото завантажено'], ['search', 'Шукаємо страви'], ['sell', 'Готуємо чернетки']];
  return labels.map(([icon, label], i) => ({ icon, label, state: i < order + 1 ? (i === order ? 'now' : 'done') : 'next' }));
};

/** Розпізнавання: фото вітрини, хід обробки. Обробка йде у фоні (черга BullMQ) — екран лише опитує стан завдання. */
export function RecognizeScreen({ jobId, service, pollMs = 1500, onResult, onFailed, onBack }: {
  jobId: string;
  service: RecognitionService;
  pollMs?: number;
  onResult: (jobId: string) => void;
  onFailed: (code: RecognitionErrorCode | 'NETWORK') => void;
  onBack: () => void;
}) {
  const t = useTheme();
  const c = t.colors;
  const [status, setStatus] = useState<RecognitionJobStatus>('queued');
  const photo = service.photoOf(jobId);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const poll = async () => {
      try {
        const job = await service.getJob(jobId);
        if (!alive) return;
        setStatus(job.status);
        if (isFinished(job.status)) {
          if (job.status === 'failed') onFailed(job.error_code ?? 'RETRIES_EXHAUSTED');
          else onResult(jobId);
          return;
        }
        timer = setTimeout(poll, pollMs);
      } catch {
        if (alive) onFailed('NETWORK');
      }
    };
    void poll();
    return () => {
      alive = false;
      if (timer) clearTimeout(timer);
    };
  }, [jobId, service, pollMs, onResult, onFailed]);

  const progress = status === 'queued' ? 0.25 : status === 'processing' ? 0.6 : 1;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.screen }]}>
      <TopBar title="Фото вітрини" onClose={onBack} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: t.space.lg, paddingBottom: t.space.lg, gap: t.space.md }}>
        <View style={[styles.photo, { borderRadius: t.radius.photo, backgroundColor: c.surfaceVariant }]}>
          {photo ? <Image source={imageSource(photo)} style={StyleSheet.absoluteFill} resizeMode="cover" /> : null}
          <View style={[styles.tag, { backgroundColor: c.card, borderRadius: t.radius.full }]}>
            <Icon name="bolt" color={c.primary} size={18} />
            <Text style={[t.type.labelLarge, { color: c.onSurface }]}>Snap & Sell</Text>
          </View>
        </View>
        <View style={[styles.card, { backgroundColor: c.card, borderRadius: t.radius.card, padding: t.space.lg, gap: t.space.md }]}>
          <Text accessibilityLiveRegion="polite" style={[t.type.titleMedium, { color: c.onSurface }]}>Розпізнаємо позиції…</Text>
          <ProgressBar progress={progress} color={c.primary} style={{ borderRadius: 4, height: 6, backgroundColor: c.primaryContainer }} />
          <View style={[styles.steps, { gap: t.space.sm }]}>
            {stepsFor(status).map((s) => (
              <View key={s.label} style={[styles.step, { borderRadius: t.radius.full, backgroundColor: s.state === 'now' ? c.primaryContainer : s.state === 'done' ? c.surfaceVariant : 'transparent', borderColor: c.outlineVariant, borderWidth: s.state === 'next' ? 1 : 0 }]}>
                <Icon name={s.icon} color={s.state === 'next' ? c.onSurfaceVariant : s.state === 'now' ? c.onPrimaryContainer : c.primary} size={16} />
                <Text style={[t.type.labelMedium, { color: s.state === 'next' ? c.onSurfaceVariant : c.onSurface }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
        <Text style={[t.type.bodyMedium, { color: c.onSurfaceVariant }]}>Зазвичай це займає до 10 секунд. Можна не чекати: чернетки зʼявляться у вкладці «Чернетки».</Text>
      </ScrollView>
      <View style={{ padding: t.space.lg }}>
        <Button mode="contained-tonal" onPress={onBack} style={{ borderRadius: t.radius.full }} contentStyle={{ height: t.size.buttonHeight }} labelStyle={t.type.labelLarge}>
          Повернутися до лотів
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  photo: { height: 260, overflow: 'hidden', padding: 12 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingLeft: 10, paddingRight: 14, alignSelf: 'flex-start' },
  card: {},
  steps: { alignItems: 'flex-start' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingLeft: 6, paddingRight: 10 },
});
