import { createMockBackend, FIXTURE_LOTS, backend, type MockOptions } from './mockStore';

export { FIXTURE_LOTS };
export type { MockOptions };

/** Заглушка сервісу лотів (сумісна з попередніми тестами). */
export const createMockLotsService = (options: MockOptions = {}) => createMockBackend(options).lots;

export const lotsService = backend.lots;
