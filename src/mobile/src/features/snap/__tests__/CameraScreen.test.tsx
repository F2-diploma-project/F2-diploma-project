import { forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { ThemeProvider } from '../../../theme';
import { CameraScreen } from '../CameraScreen';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

const mockPermission = { granted: true, canAskAgain: true };
const mockTake = jest.fn(async () => ({ uri: 'file:///shot.jpg', width: 1200, height: 900 }));
jest.mock('expo-camera', () => ({
  useCameraPermissions: () => [mockPermission, jest.fn()],
  CameraView: jest.requireActual('react').forwardRef((_p: object, ref: unknown) => {
    const R = jest.requireActual('react');
    R.useImperativeHandle(ref, () => ({ takePictureAsync: mockTake }));
    const { View: V } = jest.requireActual('react-native');
    return <V testID="camera" />;
  }),
}));
const mockStatusBar = jest.fn();
jest.mock('expo-status-bar', () => ({ StatusBar: (p: { style?: string }) => { mockStatusBar(p.style); return null; } }));
const mockPick = jest.fn();
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: (...a: unknown[]) => mockPick(...a), requestMediaLibraryPermissionsAsync: async () => ({ granted: true }) }));

// невикористані імпорти потрібні для типів у mock-фабриці
void forwardRef; void useImperativeHandle; void View;

const setup = async () => {
  const onPhoto = jest.fn();
  const onClose = jest.fn();
  const user = userEvent.setup();
  await render(<ThemeProvider><CameraScreen onPhoto={onPhoto} onClose={onClose} /></ThemeProvider>);
  return { onPhoto, onClose, user };
};

describe('Камера Snap & Sell', () => {
  beforeEach(() => { mockPermission.granted = true; mockPick.mockReset(); mockTake.mockClear(); });

  it('робить статус-бар світлим на темному тлі камери', async () => {
    await setup();
    expect(mockStatusBar).toHaveBeenCalledWith('light');
  });

  it('показує видошукач, фірмову мітку й підказку', async () => {
    await setup();
    expect(screen.getByTestId('camera')).toBeOnTheScreen();
    expect(screen.getByText('Snap & Sell · фото вітрини')).toBeOnTheScreen();
    expect(screen.getByText(/Наведіть камеру на вітрину/)).toBeOnTheScreen();
  });

  it('знімок → фото JPEG передається далі', async () => {
    const { user, onPhoto } = await setup();
    await user.press(screen.getByRole('button', { name: 'Зробити знімок' }));
    await waitFor(() => expect(onPhoto).toHaveBeenCalledWith(expect.objectContaining({ uri: 'file:///shot.jpg', mimeType: 'image/jpeg' })));
  });

  it('фото з галереї перевіряється: HEIC відхилено з поясненням', async () => {
    mockPick.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///x.heic', mimeType: 'image/heic', fileSize: 1000 }] });
    const { user, onPhoto } = await setup();
    await user.press(screen.getByRole('button', { name: 'Вибрати з галереї' }));
    expect(await screen.findByText('Підходять лише фото JPEG або PNG.')).toBeOnTheScreen();
    expect(onPhoto).not.toHaveBeenCalled();
  });

  it('фото з галереї PNG приймається', async () => {
    mockPick.mockResolvedValue({ canceled: false, assets: [{ uri: 'file:///x.png', mimeType: 'image/png', fileSize: 1000 }] });
    const { user, onPhoto } = await setup();
    await user.press(screen.getByRole('button', { name: 'Вибрати з галереї' }));
    await waitFor(() => expect(onPhoto).toHaveBeenCalledWith(expect.objectContaining({ mimeType: 'image/png' })));
  });

  it('немає доступу до камери — пояснення й галерея', async () => {
    mockPermission.granted = false;
    await setup();
    expect(screen.getByText('Немає доступу до камери')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Вибрати з галереї' })).toBeOnTheScreen();
  });

  it('закрити', async () => {
    const { user, onClose } = await setup();
    await user.press(screen.getByRole('button', { name: 'Закрити камеру' }));
    expect(onClose).toHaveBeenCalled();
  });
});
