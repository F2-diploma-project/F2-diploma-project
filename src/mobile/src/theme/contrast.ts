type Rgba = { r: number; g: number; b: number; a: number };

const parse = (value: string): Rgba => {
  if (value.startsWith('#')) {
    return { r: parseInt(value.slice(1, 3), 16), g: parseInt(value.slice(3, 5), 16), b: parseInt(value.slice(5, 7), 16), a: 1 };
  }
  const [r, g, b, a] = value.replace(/rgba\(|\)/g, '').split(',').map((part) => Number(part.trim()));
  return { r, g, b, a };
};

const channel = (c: number) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

const luminance = ({ r, g, b }: Rgba) => 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

/** Контраст за WCAG 2.2. Напівпрозорий передній колір змішується з тлом. */
export function contrastRatio(foreground: string, background: string): number {
  const bg = parse(background);
  const fgRaw = parse(foreground);
  const fg = {
    r: fgRaw.r * fgRaw.a + bg.r * (1 - fgRaw.a),
    g: fgRaw.g * fgRaw.a + bg.g * (1 - fgRaw.a),
    b: fgRaw.b * fgRaw.a + bg.b * (1 - fgRaw.a),
    a: 1,
  };
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
