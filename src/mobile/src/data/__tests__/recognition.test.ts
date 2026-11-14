import { checkImage, MAX_IMAGE_BYTES } from '../recognition';

describe('перевірка фото перед завантаженням', () => {
  it('приймає JPEG і PNG до 10 МБ', () => {
    expect(checkImage({ uri: 'a', mimeType: 'image/jpeg', fileSize: 2_000_000 })).toBeNull();
    expect(checkImage({ uri: 'a', mimeType: 'image/png', fileSize: MAX_IMAGE_BYTES })).toBeNull();
  });
  it('відхиляє інші типи — за MIME, а не за іменем файлу', () => {
    expect(checkImage({ uri: 'photo.jpg', mimeType: 'image/heic', fileSize: 1000 })).toBe('TYPE');
    expect(checkImage({ uri: 'photo.png', mimeType: 'image/gif', fileSize: 1000 })).toBe('TYPE');
    expect(checkImage({ uri: 'photo.jpg', mimeType: null, fileSize: 1000 })).toBe('TYPE');
  });
  it('відхиляє файли понад 10 МБ', () => {
    expect(checkImage({ uri: 'a', mimeType: 'image/jpeg', fileSize: MAX_IMAGE_BYTES + 1 })).toBe('SIZE');
  });
});
