import { colors, radius, size, space, typeScale, type ColorName } from '../tokens';
import { contrastRatio } from '../contrast';

const HEX = /^#[0-9A-F]{6}$/;
const RGBA = /^rgba\(\d{1,3},\s?\d{1,3},\s?\d{1,3},\s?(0|1|0?\.\d+)\)$/;

describe('кольорові токени', () => {
  it('мають однаковий набір у світлій і темній темах', () => {
    expect(Object.keys(colors.dark).sort()).toEqual(Object.keys(colors.light).sort());
  });

  it('усі значення — коректні кольори', () => {
    for (const mode of ['light', 'dark'] as const) {
      for (const [name, value] of Object.entries(colors[mode])) {
        expect({ name, ok: HEX.test(value) || RGBA.test(value) }).toEqual({ name, ok: true });
      }
    }
  });

  it('містять фірмові токени продукту', () => {
    const required: ColorName[] = ['screen', 'card', 'iconPlate', 'cameraBg', 'cameraOnBg', 'primary', 'primaryContainer'];
    for (const name of required) expect(colors.light[name]).toBeDefined();
  });

  it('зберігають основні значення з Figma', () => {
    expect(colors.light.primary).toBe('#006A67');
    expect(colors.dark.primary).toBe('#96CBC7');
    expect(colors.light.screen).toBe('#EEF3F2');
    expect(colors.dark.card).toBe('#1C2121');
  });
});

describe('контраст тексту (WCAG 2.2, ≥ 4.5:1)', () => {
  const pairs: [ColorName, ColorName][] = [
    ['onPrimary', 'primary'],
    ['onPrimaryContainer', 'primaryContainer'],
    ['onSecondaryContainer', 'secondaryContainer'],
    ['onTertiaryContainer', 'tertiaryContainer'],
    ['onErrorContainer', 'errorContainer'],
    ['onError', 'error'],
    ['onSurface', 'surface'],
    ['onSurface', 'card'],
    ['onSurface', 'screen'],
    ['onSurfaceVariant', 'surface'],
    ['onSurfaceVariant', 'screen'],
    ['primary', 'card'],
  ];
  for (const mode of ['light', 'dark'] as const) {
    for (const [fg, bg] of pairs) {
      it(`${mode}: ${fg} на ${bg}`, () => {
        expect(contrastRatio(colors[mode][fg], colors[mode][bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});

describe('розміри', () => {
  it('зона натискання не менша за платформні мінімуми (iOS 44, Android 48)', () => {
    expect(size.touchMin).toBeGreaterThanOrEqual(48);
    expect(size.buttonHeight).toBeGreaterThanOrEqual(size.touchMin);
  });

  it('відступи кратні 4', () => {
    for (const value of Object.values(space)) expect(value % 4).toBe(0);
  });

  it('заокруглення карток і фото — з Figma', () => {
    expect(radius.card).toBe(20);
    expect(radius.thumb).toBe(14);
  });
});

describe('типографіка', () => {
  it('використовує лише Onest', () => {
    for (const style of Object.values(typeScale)) expect(style.fontFamily).toMatch(/^Onest_/);
  });

  it('висота рядка не менша за розмір шрифту', () => {
    for (const style of Object.values(typeScale)) expect(style.lineHeight).toBeGreaterThanOrEqual(style.fontSize);
  });

  it('title/medium — 16/20: назви на двох рядках не розходяться (рішення Марії)', () => {
    expect(typeScale.titleMedium).toMatchObject({ fontSize: 16, lineHeight: 20 });
  });
});
