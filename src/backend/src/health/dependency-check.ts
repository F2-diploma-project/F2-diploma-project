export interface DependencyCheck {
  readonly name: string;
  check(): Promise<void>;
}

export const HEALTH_CHECKS = Symbol('HEALTH_CHECKS');
export const HEALTH_CHECK_TIMEOUT_MS = Symbol('HEALTH_CHECK_TIMEOUT_MS');
