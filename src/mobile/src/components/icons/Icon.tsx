import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { ICON_PATHS, type IconName } from './paths';

export interface IconProps {
  name: IconName;
  color: string;
  size?: number;
  testID?: string;
}

/** Іконка з дизайн-системи (декоративна — прихована від читача екрана). Колір передається з токенів теми. */
export function Icon({ name, color, size = 24, testID }: IconProps) {
  return (
    <View testID={testID ?? `icon-${name}`} aria-hidden pointerEvents="none" style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 -960 960 960">
        <Path d={ICON_PATHS[name]} fill={color} />
      </Svg>
    </View>
  );
}

export type { IconName };
