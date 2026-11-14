import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { LotsService, StaffLot, VenueLotStatus } from '../../data/types';
import { useTheme } from '../../theme';
import { Icon } from '../../components/icons/Icon';
import { Banner, EmptyState, LotCard, ScreenHeader, SegmentTabs, Toast } from '../../components/ui';

type Tab = Extract<VenueLotStatus, 'active' | 'draft' | 'sold_out'>;
type Load = { state: 'loading' } | { state: 'error' } | { state: 'ready'; lots: StaffLot[] };

export interface LotsScreenProps {
  service: LotsService;
  /** Лот, щойно опублікований на іншому екрані: показуємо сповіщення зі «Скасувати». */
  publishedLotId?: string;
  /** Скільки лотів щойно опубліковано разом (без скасування). */
  publishedCount?: number;
  initialTab?: 'active' | 'draft' | 'sold_out';
  onOpenLot?: (lotId: string) => void;
  onSnap?: () => void;
  onSearch?: () => void;
  /** Відступ знизу під висячу навігацію. */
  bottomInset?: number;
}

const EMPTY_TEXT: Record<Tab, [string, string]> = {
  active: ['Активних лотів немає', 'Сфотографуйте вітрину наприкінці зміни — чернетки лотів складуться самі.'],
  draft: ['Чернеток немає', 'Чернетки зʼявляються після фото вітрини.'],
  sold_out: ['Розпроданих лотів немає', 'Тут будуть лоти, які вже купили повністю.'],
};

export function LotsScreen({ service, publishedLotId, publishedCount, initialTab = 'active', onOpenLot, onSnap, onSearch, bottomInset = 108 }: LotsScreenProps) {
  const t = useTheme();
  const c = t.colors;
  const [tab, setTab] = useState<Tab>(initialTab);
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [counts, setCounts] = useState<Record<VenueLotStatus, number> | null>(null);
  const [toastFor, setToastFor] = useState<string | undefined>(publishedLotId);
  const [bulkToast, setBulkToast] = useState(Boolean(publishedCount));

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([service.list(tab), service.counts()])
      .then(([lots, n]) => {
        if (cancelled) return;
        setLoad({ state: 'ready', lots });
        setCounts(n);
      })
      .catch(() => {
        if (!cancelled) setLoad({ state: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [service, tab, reloadKey]);

  const reload = () => {
    setLoad({ state: 'loading' });
    setReloadKey((k) => k + 1);
  };

  const changeTab = (next: Tab) => {
    if (next === tab) return;
    setLoad({ state: 'loading' });
    setTab(next);
  };

  useEffect(() => {
    if (!toastFor && !bulkToast) return;
    const timer = setTimeout(() => {
      setToastFor(undefined);
      setBulkToast(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toastFor, bulkToast]);

  const undo = async () => {
    if (!toastFor) return;
    const id = toastFor;
    setToastFor(undefined);
    await service.unpublish(id);
    reload();
  };

  const label = (name: string, n?: number) => (n ? `${name} · ${n}` : name);
  const tabs = [
    { value: 'active' as const, label: label('Активні', counts?.active) },
    { value: 'draft' as const, label: label('Чернетки', counts?.draft) },
    { value: 'sold_out' as const, label: label('Розпродані', counts?.sold_out) },
  ];

  return (
    <SafeAreaView edges={['top']} style={[styles.flex, { backgroundColor: c.screen }]}>
      <ScreenHeader title="Лоти" action={{ icon: 'search', label: 'Пошук лотів', onPress: () => onSearch?.() }} />
      <View style={{ paddingHorizontal: t.space.lg, paddingBottom: t.space.lg }}>
        <SegmentTabs items={tabs} value={tab} onChange={changeTab} />
      </View>

      {load.state === 'loading' ? (
        <View style={styles.center}>
          <ActivityIndicator color={c.primary} size="large" />
          <Text style={[t.type.bodyLarge, { color: c.onSurfaceVariant, marginTop: t.space.lg }]}>Завантажуємо лоти…</Text>
        </View>
      ) : load.state === 'error' ? (
        <View style={styles.center}>
          <EmptyState icon="cloud_off" title="Немає зв’язку" text="Не вдалося завантажити лоти. Перевірте інтернет і спробуйте ще раз." actionLabel="Спробувати ще раз" onAction={reload} />
        </View>
      ) : (
        <FlatList
          data={load.lots}
          keyExtractor={(l) => l.id}
          renderItem={({ item }) => <LotCard lot={item} onPress={item.status === 'draft' && onOpenLot ? () => onOpenLot(item.id) : undefined} />}
          ItemSeparatorComponent={() => <View style={{ height: t.space.sm }} />}
          ListHeaderComponent={
            tab === 'draft' && load.lots.length > 0 ? (
              <View style={{ marginBottom: t.space.sm }}>
                <Banner kind="info" icon="photo_camera" text="Чернетки з фото вітрини. Перевірте назву, кількість і ціну — і публікуйте." />
              </View>
            ) : undefined
          }
          ListEmptyComponent={<View style={styles.emptyWrap}><EmptyState icon="sell" title={EMPTY_TEXT[tab][0]} text={EMPTY_TEXT[tab][1]} /></View>}
          contentContainerStyle={[styles.list, { paddingHorizontal: t.space.lg, paddingBottom: bottomInset + 96 }]}
        />
      )}

      <View pointerEvents="box-none" style={[styles.footer, { bottom: bottomInset, paddingHorizontal: t.space.lg, gap: t.space.sm }]}>
        {toastFor ? <Toast text="Лот опубліковано" actionLabel="Скасувати" onAction={undo} /> : null}
        {bulkToast && publishedCount ? <Toast text={`Опубліковано лотів: ${publishedCount}`} /> : null}
        <Button
          mode="contained"
          onPress={onSnap}
          accessibilityLabel="Сфотографувати вітрину"
          icon={({ color }) => <Icon name="photo_camera" color={color} size={20} />}
          style={{ borderRadius: t.radius.full }}
          contentStyle={{ height: t.size.buttonHeight }}
          labelStyle={t.type.labelLarge}
        >
          Сфотографувати вітрину
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 160 },
  list: { flexGrow: 1 },
  emptyWrap: { flex: 1, justifyContent: 'center', paddingTop: 48 },
  footer: { position: 'absolute', left: 0, right: 0 },
});
