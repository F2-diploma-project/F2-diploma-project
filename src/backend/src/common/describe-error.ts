export function describeError(error: unknown): string {
  if (error instanceof AggregateError && error.message === '') {
    return error.errors.map(describeError).join('; ');
  }
  if (error instanceof Error) {
    if (error.message !== '') return error.message;
    if ('code' in error && typeof error.code === 'string') return error.code;
    return error.name;
  }
  return String(error);
}
