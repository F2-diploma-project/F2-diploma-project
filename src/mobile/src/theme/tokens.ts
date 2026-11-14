import raw from './tokens.json';

export type Scheme = 'light' | 'dark';
export type ColorName = keyof typeof raw.color.light;
export type ColorTokens = Record<ColorName, string>;

export const colors: Record<Scheme, ColorTokens> = raw.color;
export const space = raw.space;
export const radius = raw.radius;
export const size = raw.size;
export const fontFamily = raw.font.weights;

type Weight = keyof typeof raw.font.weights;
type TypeName = keyof typeof raw.type;

export interface TypeStyle {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

const toStyle = ([fontSize, lineHeight, weight, letterSpacing]: (string | number)[]): TypeStyle => ({
  fontFamily: fontFamily[weight as Weight],
  fontSize: Number(fontSize),
  lineHeight: Number(lineHeight),
  letterSpacing: Number(letterSpacing),
});

export const typeScale = Object.fromEntries(
  Object.entries(raw.type).map(([name, value]) => [name, toStyle(value)]),
) as Record<TypeName, TypeStyle>;

export type TypeScaleName = TypeName;
