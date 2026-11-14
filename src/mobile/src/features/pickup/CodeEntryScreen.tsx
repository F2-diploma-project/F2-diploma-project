import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/icons/Icon';
import { plural } from '../../data/format';
import { CODE_LENGTH, codeLength, isCompleteCode, normalizeCode } from '../../data/pickup';
import { useTheme } from '../../theme';
import { PickupHeader } from './PickupHeader';

/** Введення коду з-під QR вручну: пояснення зверху, клітинки коду внизу біля клавіатури, пошук — сам після 6 символів. */
export function CodeEntryScreen({ onSubmit, onBack }: { onSubmit: (code: string) => void; onBack: () => void }) {
  const t = useTheme();
  const c = t.colors;
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  const [code, setCode] = useState('');
  const chars = code.replace(/-/g, '');
  const left = CODE_LENGTH - codeLength(code);
  const complete = isCompleteCode(code);

  const change = (text: string) => {
    const next = normalizeCode(text);
    setCode(next);
    if (isCompleteCode(next) && !isCompleteCode(code)) onSubmit(next);
  };

  const cell = (i: number) => {
    const focused = i === chars.length && !complete;
    return (
      <View
        key={i}
        testID={`code-cell-${i}`}
        style={[
          styles.cell,
          {
            backgroundColor: c.card,
            borderRadius: t.radius.md,
            borderColor: focused ? c.primary : c.outlineVariant,
            borderWidth: focused ? 2 : 1,
          },
        ]}
      >
        <Text style={[t.type.headlineSmall, { color: c.onSurface }]}>{chars[i] ?? ''}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.screen }]}>
      <PickupHeader title="Код замовлення" icon="arrow_back" label="Назад" onPress={onBack} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ paddingHorizontal: t.space.lg }}>
          <View style={[styles.info, { backgroundColor: c.card, borderRadius: t.radius.card, padding: t.space.md, gap: t.space.md }]}>
            <View style={[styles.plate, { backgroundColor: c.primaryContainer, borderRadius: t.radius.md }]}>
              <Icon name="qr_code_scanner" color={c.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={[t.type.titleMedium, { color: c.onSurface }]}>Код під QR-кодом</Text>
              <Text style={[t.type.bodyMedium, { color: c.onSurfaceVariant }]}>Попросіть покупця показати або назвати 6 символів із застосунку</Text>
            </View>
          </View>
        </View>

        <View style={[styles.bottom, { padding: t.space.lg, gap: t.space.md }]}>
          <Pressable accessible={false} onPress={() => input.current?.focus()} style={[styles.cells, { gap: t.space.sm }]}>
            {[0, 1, 2].map(cell)}
            <Text style={[t.type.headlineSmall, { color: c.onSurfaceVariant }]}>–</Text>
            {[3, 4, 5].map(cell)}
            <TextInput
              ref={input}
              accessibilityLabel="Код замовлення"
              value={code}
              onChangeText={change}
              autoFocus
              autoCapitalize="characters"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              keyboardType={Platform.OS === 'ios' ? 'ascii-capable' : 'visible-password'}
              returnKeyType="search"
              onSubmitEditing={() => complete && onSubmit(code)}
              maxLength={CODE_LENGTH + 1}
              caretHidden
              style={styles.hiddenInput}
            />
          </Pressable>
          <Text style={[t.type.bodySmall, styles.center, { color: c.onSurfaceVariant }]}>
            {complete ? 'Шукаємо замовлення…' : `Ще ${left} ${plural(left, ['символ', 'символи', 'символів'])} — і замовлення знайдеться саме`}
          </Text>
          <Button
            mode="contained"
            disabled={!complete}
            onPress={() => onSubmit(code)}
            style={{ borderRadius: t.radius.full }}
            contentStyle={{ height: t.size.buttonHeight }}
            labelStyle={t.type.labelLarge}
          >
            Знайти замовлення
          </Button>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  info: { flexDirection: 'row', alignItems: 'center' },
  plate: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  bottom: { flex: 1, justifyContent: 'flex-end' },
  cells: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  cell: { width: 46, height: 54, alignItems: 'center', justifyContent: 'center' },
  // Справжнє поле прозоре й лежить поверх клітинок: натиск на клітинки відкриває клавіатуру.
  hiddenInput: { ...StyleSheet.absoluteFill, opacity: 0.01, color: 'transparent' },
  center: { textAlign: 'center' },
});
