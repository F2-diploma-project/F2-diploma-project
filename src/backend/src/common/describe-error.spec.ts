import { describeError } from './describe-error';

describe('describeError', () => {
  it('returns the message of a regular error', () => {
    expect(describeError(new Error('boom'))).toBe('boom');
  });

  it('lists nested messages of an AggregateError with an empty message', () => {
    const error = new AggregateError(
      [new Error('connect ECONNREFUSED ::1:6379'), new Error('connect ECONNREFUSED 127.0.0.1:6379')],
      '',
    );

    expect(describeError(error)).toBe(
      'connect ECONNREFUSED ::1:6379; connect ECONNREFUSED 127.0.0.1:6379',
    );
  });

  it('falls back to the error code when there is no message', () => {
    const error = Object.assign(new Error(''), { code: 'ECONNREFUSED' });

    expect(describeError(error)).toBe('ECONNREFUSED');
  });

  it('describes non-error values', () => {
    expect(describeError('plain text')).toBe('plain text');
  });
});
