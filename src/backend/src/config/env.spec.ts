import { validateEnv } from './env';

const valid = {
  DATABASE_URL: 'postgres://b2b:b2b@localhost:5432/b2b',
  REDIS_URL: 'redis://localhost:6379',
};

describe('validateEnv', () => {
  it('accepts valid variables and defaults PORT to 3000', () => {
    expect(validateEnv(valid)).toEqual({ ...valid, PORT: 3000 });
  });

  it('parses PORT as a number', () => {
    expect(validateEnv({ ...valid, PORT: '4000' }).PORT).toBe(4000);
  });

  it.each(['DATABASE_URL', 'REDIS_URL'])('rejects missing %s', (name) => {
    const env = Object.fromEntries(Object.entries(valid).filter(([key]) => key !== name));

    expect(() => validateEnv(env)).toThrow(name);
  });

  it('rejects a PORT that is not a valid port number', () => {
    expect(() => validateEnv({ ...valid, PORT: 'abc' })).toThrow('PORT');
  });
});
