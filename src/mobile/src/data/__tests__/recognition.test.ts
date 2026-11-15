import { checkImage, cropLayout, MAX_IMAGE_BYTES } from '../recognition';

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

describe('фрагмент фото позиції', () => {
  it('рамка заповнює квадрат: масштаб за коротшою стороною рамки, по центру', () => {
    // Фото 1000×800, рамка 200×100 px починається з (100, 400) → квадрат 56: масштаб 56/100.
    const l = cropLayout({ x: 0.1, y: 0.5, width: 0.2, height: 0.125 }, 1000, 800, 56);
    expect(l.width).toBeCloseTo(560);
    expect(l.height).toBeCloseTo(448);
    expect(l.left).toBeCloseTo(-56 - (112 - 56) / 2);
    expect(l.top).toBeCloseTo(-224);
  });

  it('без розмірів фото — все фото, без зсуву', () => {
    expect(cropLayout({ x: 0.1, y: 0.1, width: 0.2, height: 0.2 }, 0, 0, 56)).toEqual({ width: 56, height: 56, left: 0, top: 0 });
  });
});

