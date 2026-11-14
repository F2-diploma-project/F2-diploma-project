import { AuthError, type AuthService, type StaffSession } from './auth';

/** Тестові облікові записи для заглушки (до появи бекенду входу). Не справжні дані. */
export const MOCK_ACCOUNTS = {
  cashier: { login: 'cashier.olena', password: 'correct-horse-battery', role: 'cashier' as const },
  admin: { login: 'admin.maria', password: 'correct-horse-battery', role: 'admin' as const },
  locked: { login: 'cashier.locked', password: 'correct-horse-battery', role: 'cashier' as const },
};

export function createMockAuthService({ delayMs = 600, offline = false }: { delayMs?: number; offline?: boolean } = {}): AuthService {
  return {
    async login(login, password): Promise<StaffSession> {
      await new Promise((r) => setTimeout(r, delayMs));
      if (offline) throw new AuthError('NETWORK');
      if (login === MOCK_ACCOUNTS.locked.login) {
        const until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        throw new AuthError('ACCOUNT_LOCKED', until);
      }
      const account = Object.values(MOCK_ACCOUNTS).find((a) => a.login === login && a.password === password);
      if (!account) throw new AuthError('INVALID_CREDENTIALS');
      return { role: account.role, login: account.login };
    },
  };
}

export const authService = createMockAuthService();
