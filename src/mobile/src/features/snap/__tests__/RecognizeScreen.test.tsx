import { render, screen, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../../theme';
import { createMockBackend } from '../../../data/mockStore';
import { RecognizeScreen } from '../RecognizeScreen';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

const start = async (opts: Parameters<typeof createMockBackend>[0]) => {
  const backend = createMockBackend({ delayMs: 0, processingPolls: 1, ...opts });
  const { job_id } = await backend.recognition.createJob({ uri: 'file:///shot.jpg', mimeType: 'image/jpeg', fileSize: 1 });
  const onResult = jest.fn();
  const onFailed = jest.fn();
  await render(<ThemeProvider><RecognizeScreen jobId={job_id} service={backend.recognition} pollMs={0} onResult={onResult} onFailed={onFailed} onBack={jest.fn()} /></ThemeProvider>);
  return { job_id, onResult, onFailed };
};

describe('Розпізнавання', () => {
  it('показує хід і передає результат', async () => {
    const { job_id, onResult } = await start({});
    expect(screen.getByText('Розпізнаємо позиції…')).toBeOnTheScreen();
    expect(screen.getByText('Snap & Sell')).toBeOnTheScreen();
    await waitFor(() => expect(onResult).toHaveBeenCalledWith(job_id));
  });

  it('нічого не знайдено → екран помилки', async () => {
    const { onFailed } = await start({ recognition: 'empty' });
    await waitFor(() => expect(onFailed).toHaveBeenCalledWith('EMPTY_RESULT'));
  });
});
