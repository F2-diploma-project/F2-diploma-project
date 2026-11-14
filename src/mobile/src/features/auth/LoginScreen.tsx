import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from '../../components/icons/Icon';
import { Banner } from '../../components/ui';
import { AuthError, LOGIN_PATTERN, PASSWORD_MIN, type AuthService, type StaffSession } from '../../data/auth';
import { formatTime } from '../../data/format';
import { useTheme } from '../../theme';

const COLLAGE = [
  { src: require('../../../assets/photos/croissant_b.jpg'), style: { left: 0, top: 26, width: 76, height: 76, transform: [{ rotate: '-8deg' }] } },
  { src: require('../../../assets/photos/coffee.jpg'), style: { left: 144, top: 26, width: 76, height: 76, transform: [{ rotate: '8deg' }] } },
  { src: require('../../../assets/photos/quiche_a.jpg'), style: { left: 56, top: 4, width: 108, height: 108 } },
] as const;

type Message = { kind: 'error' | 'info'; text: string } | null;

const errorText = (e: unknown): string => {
  if (e instanceof AuthError) {
    if (e.code === 'INVALID_CREDENTIALS') return 'Невірний логін або пароль.';
    if (e.code === 'ACCOUNT_LOCKED') return `Забагато невдалих спроб. Спробуйте після ${e.lockedUntil ? formatTime(e.lockedUntil) : 'кількох хвилин'}.`;
    if (e.code === 'TOO_MANY_REQUESTS') return 'Забагато спроб. Зачекайте хвилину й спробуйте ще раз.';
  }
  return 'Немає зв’язку. Перевірте інтернет і спробуйте ще раз.';
};

export function LoginScreen({ service, onSignedIn }: { service: AuthService; onSignedIn: (session: StaffSession) => void }) {
  const t = useTheme();
  const c = t.colors;
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);

  const loginError = touched && !LOGIN_PATTERN.test(login.trim()) ? 'Лише латинські літери, цифри, крапка, дефіс або підкреслення' : null;
  const passwordError = touched && password.length < PASSWORD_MIN ? `Щонайменше ${PASSWORD_MIN} символів` : null;

  const submit = async () => {
    setTouched(true);
    setMessage(null);
    if (!LOGIN_PATTERN.test(login.trim()) || password.length < PASSWORD_MIN) return;
    setBusy(true);
    try {
      onSignedIn(await service.login(login.trim(), password));
    } catch (e) {
      setMessage({ kind: 'error', text: errorText(e) });
    } finally {
      setBusy(false);
    }
  };

  const fieldTheme = { roundness: t.radius.md };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: c.screen }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={[styles.top, { gap: t.space.lg, paddingHorizontal: t.space.xl }]}>
            <View style={styles.collage} aria-hidden>
              {COLLAGE.map((p, i) => (
                <Image key={i} source={p.src} style={[styles.photo, p.style, { borderColor: c.card }]} />
              ))}
            </View>
            <View style={[styles.tag, { backgroundColor: c.card, borderRadius: t.radius.full, gap: 6 }]}>
              <Icon name="bolt" color={c.primary} size={18} />
              <Text style={[t.type.labelLarge, { color: c.onSurface }]}>Snap & Sell для закладів</Text>
            </View>
            <Text accessibilityRole="header" style={[t.type.headlineMedium, styles.center, { color: c.onSurface }]}>Вхід для персоналу</Text>
            <Text style={[t.type.bodyLarge, styles.center, { color: c.onSurfaceVariant }]}>Публікуйте залишки зміни й видавайте замовлення покупцям.</Text>
          </View>

          <View style={{ paddingHorizontal: t.space.lg, paddingBottom: t.space.xl, gap: t.space.md }}>
            <View style={[styles.card, { backgroundColor: c.card, borderRadius: t.radius.card, padding: t.space.lg, gap: t.space.sm }]}>
              {message ? <Banner kind={message.kind} icon={message.kind === 'error' ? 'error' : 'person'} text={message.text} /> : null}
              <View>
                <TextInput
                  mode="outlined"
                  label="Логін"
                  accessibilityLabel="Логін"
                  value={login}
                  onChangeText={setLogin}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  textContentType="username"
                  returnKeyType="next"
                  error={Boolean(loginError)}
                  theme={fieldTheme}
                  style={{ backgroundColor: c.card }}
                />
                {loginError ? <HelperText type="error">{loginError}</HelperText> : null}
              </View>
              <View>
                <TextInput
                  mode="outlined"
                  label="Пароль"
                  accessibilityLabel="Пароль"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={submit}
                  error={Boolean(passwordError)}
                  theme={fieldTheme}
                  style={{ backgroundColor: c.card }}
                  right={
                    <TextInput.Icon
                      accessibilityLabel={showPassword ? 'Сховати пароль' : 'Показати пароль'}
                      onPress={() => setShowPassword((v) => !v)}
                      icon={({ color }) => <Icon name={showPassword ? 'visibility_off' : 'visibility'} color={color} />}
                    />
                  }
                />
                {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}
              </View>
              <View style={styles.forgot}>
                <Button mode="text" onPress={() => setMessage({ kind: 'info', text: 'Пароль змінює адміністратор закладу. Зверніться до нього — він задасть новий.' })} labelStyle={t.type.labelLarge}>
                  Забули пароль?
                </Button>
              </View>
              <Button
                mode="contained"
                onPress={submit}
                loading={busy}
                disabled={busy || !login || !password}
                accessibilityLabel="Увійти"
                style={{ borderRadius: t.radius.full }}
                contentStyle={{ height: t.size.buttonHeight }}
                labelStyle={t.type.labelLarge}
              >
                Увійти
              </Button>
            </View>
            <Text style={[t.type.bodySmall, styles.center, { color: c.onSurfaceVariant }]}>Роль — касир чи адміністратор — визначиться автоматично.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'space-between' },
  top: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 48, paddingBottom: 16 },
  collage: { width: 220, height: 120 },
  photo: { position: 'absolute', borderRadius: 24, borderWidth: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingLeft: 10, paddingRight: 14 },
  center: { textAlign: 'center' },
  card: {},
  forgot: { alignItems: 'flex-end' },
});
